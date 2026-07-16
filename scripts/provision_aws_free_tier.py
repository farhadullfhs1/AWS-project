from __future__ import annotations

import json
import configparser
import os
import textwrap
import time
from pathlib import Path

import boto3
from botocore.exceptions import ClientError


ROOT = Path(__file__).resolve().parent.parent
CREDS_FILE = ROOT / ".aws" / "credentials"
REGION = "us-east-1"
EMAIL = "farhadul17.work@gmail.com"
TOPIC_NAME = "coffee-shop-billing-alerts"
ALARM_NAME = "CoffeeShopEstimatedChargesAlarm"
ROLE_NAME = "CoffeeShopEC2SSMRole"
PROFILE_NAME = "CoffeeShopEC2SSMProfile"
SG_NAME = "coffee-shop-web-sg"
INSTANCE_NAME = "coffee-shop-app"
REPO_URL = "https://github.com/farhadullfhs1/coffee-shop-fullstack.git"


def load_credentials() -> tuple[str, str]:
    parser = configparser.ConfigParser()
    if not CREDS_FILE.exists():
        raise FileNotFoundError(f"Missing credentials file: {CREDS_FILE}")
    with CREDS_FILE.open("r", encoding="utf-8-sig") as handle:
        parser.read_file(handle)
    if "default" not in parser:
        raise RuntimeError("Expected a [default] profile in .aws/credentials")
    section = parser["default"]
    return section["aws_access_key_id"], section["aws_secret_access_key"]


def session() -> boto3.Session:
    key, secret = load_credentials()
    return boto3.Session(
        aws_access_key_id=key,
        aws_secret_access_key=secret,
        region_name=REGION,
    )


def ensure_sns_and_alarm(sess: boto3.Session) -> str:
    sns = sess.client("sns")
    cw = sess.client("cloudwatch")

    topic = sns.create_topic(Name=TOPIC_NAME)
    topic_arn = topic["TopicArn"]

    subs = sns.list_subscriptions_by_topic(TopicArn=topic_arn).get("Subscriptions", [])
    if not any(s.get("Endpoint") == EMAIL and s.get("Protocol") == "email" for s in subs):
        sns.subscribe(TopicArn=topic_arn, Protocol="email", Endpoint=EMAIL)

    cw.put_metric_alarm(
        AlarmName=ALARM_NAME,
        AlarmDescription="Notify when estimated AWS charges exceed $0.01",
        ActionsEnabled=True,
        AlarmActions=[topic_arn],
        Namespace="AWS/Billing",
        MetricName="EstimatedCharges",
        Dimensions=[{"Name": "Currency", "Value": "USD"}],
        Statistic="Maximum",
        Period=21600,
        EvaluationPeriods=1,
        Threshold=0.01,
        ComparisonOperator="GreaterThanThreshold",
        TreatMissingData="notBreaching",
        Unit="None",
    )

    return topic_arn


def ensure_iam_role(sess: boto3.Session) -> str:
    iam = sess.client("iam")
    assume_role_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {"Service": "ec2.amazonaws.com"},
                "Action": "sts:AssumeRole",
            }
        ],
    }

    try:
        iam.get_role(RoleName=ROLE_NAME)
    except ClientError as exc:
        if exc.response["Error"]["Code"] == "NoSuchEntity":
            iam.create_role(
                RoleName=ROLE_NAME,
                AssumeRolePolicyDocument=json.dumps(assume_role_policy),
                Description="EC2 role for Coffee Shop app with SSM access",
            )
        else:
            raise

    try:
        iam.attach_role_policy(
            RoleName=ROLE_NAME,
            PolicyArn="arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore",
        )
    except ClientError:
        pass

    try:
        iam.get_instance_profile(InstanceProfileName=PROFILE_NAME)
    except ClientError as exc:
        if exc.response["Error"]["Code"] == "NoSuchEntity":
            iam.create_instance_profile(InstanceProfileName=PROFILE_NAME)
        else:
            raise

    time.sleep(5)
    attached_roles = iam.get_instance_profile(InstanceProfileName=PROFILE_NAME)["InstanceProfile"].get("Roles", [])
    if not any(role["RoleName"] == ROLE_NAME for role in attached_roles):
        try:
            iam.add_role_to_instance_profile(
                InstanceProfileName=PROFILE_NAME,
                RoleName=ROLE_NAME,
            )
        except ClientError as add_exc:
            if add_exc.response["Error"]["Code"] not in {"LimitExceeded", "EntityAlreadyExists"}:
                raise

    return PROFILE_NAME


def ensure_security_group(sess: boto3.Session) -> tuple[str, str]:
    ec2 = sess.client("ec2")
    vpcs = ec2.describe_vpcs(Filters=[{"Name": "isDefault", "Values": ["true"]}])["Vpcs"]
    if not vpcs:
        raise RuntimeError("No default VPC found")
    vpc_id = vpcs[0]["VpcId"]

    existing = ec2.describe_security_groups(
        Filters=[
            {"Name": "group-name", "Values": [SG_NAME]},
            {"Name": "vpc-id", "Values": [vpc_id]},
        ]
    )["SecurityGroups"]
    if existing:
        sg_id = existing[0]["GroupId"]
    else:
        sg_id = ec2.create_security_group(
            GroupName=SG_NAME,
            Description="Coffee Shop web access",
            VpcId=vpc_id,
        )["GroupId"]
        ec2.create_tags(Resources=[sg_id], Tags=[{"Key": "Name", "Value": SG_NAME}])

    for port in (80, 443):
        try:
            ec2.authorize_security_group_ingress(
                GroupId=sg_id,
                IpPermissions=[
                    {
                        "IpProtocol": "tcp",
                        "FromPort": port,
                        "ToPort": port,
                        "IpRanges": [{"CidrIp": "0.0.0.0/0"}],
                    }
                ],
            )
        except ClientError as exc:
            if exc.response["Error"]["Code"] != "InvalidPermission.Duplicate":
                raise

    return sg_id, vpc_id


def latest_al2023_ami(sess: boto3.Session) -> str:
    ssm = sess.client("ssm")
    param = ssm.get_parameter(
        Name="/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-6.1-x86_64",
    )
    return param["Parameter"]["Value"]


def build_user_data() -> str:
    return textwrap.dedent(
        f"""\
        #!/bin/bash
        set -euxo pipefail

        dnf update -y
        dnf install -y git python3.11 python3.11-pip nginx

        if ! command -v node >/dev/null 2>&1; then
          curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
          dnf install -y nodejs
        fi

        systemctl enable --now nginx

        cd /opt
        if [ ! -d coffee-shop-fullstack ]; then
          git clone --branch main --depth 1 {REPO_URL}
        fi

        SECRET_KEY="$(openssl rand -base64 50)"
        cat >/etc/coffee-shop.env <<EOF
        DJANGO_DEBUG=False
        DJANGO_ALLOWED_HOSTS=*
        SECRET_KEY=${{SECRET_KEY}}
        EOF

        cd /opt/coffee-shop-fullstack/server
        python3.11 -m venv venv
        . venv/bin/activate
        pip install --upgrade pip
        pip install -r requirements.txt
        python manage.py migrate --noinput
        python manage.py collectstatic --noinput

        cat >/etc/systemd/system/coffee-shop-backend.service <<'EOF'
        [Unit]
        Description=Coffee Shop Django Backend
        After=network.target

        [Service]
        Type=simple
        User=ec2-user
        WorkingDirectory=/opt/coffee-shop-fullstack/server
        EnvironmentFile=/etc/coffee-shop.env
        Environment=DJANGO_SETTINGS_MODULE=core.settings
        ExecStart=/opt/coffee-shop-fullstack/server/venv/bin/gunicorn core.wsgi:application --bind 127.0.0.1:8000 --workers 2 --timeout 120
        Restart=always
        RestartSec=5

        [Install]
        WantedBy=multi-user.target
        EOF

        cd /opt/coffee-shop-fullstack/client
        npm install
        npm run build

        chown -R ec2-user:ec2-user /opt/coffee-shop-fullstack

        cat >/etc/nginx/conf.d/coffee-shop.conf <<'EOF'
        server {{
          listen 80 default_server;
          server_name coffee-shop-app;

          root /opt/coffee-shop-fullstack/client/dist;
          index index.html;

          location /api/ {{
            proxy_pass http://127.0.0.1:8000/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
          }}

          location /admin/ {{
            proxy_pass http://127.0.0.1:8000/admin/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
          }}

          location /static/ {{
            proxy_pass http://127.0.0.1:8000/static/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
          }}

          location / {{
            try_files $uri $uri/ /index.html;
          }}
        }}
        EOF

        nginx -t
        systemctl daemon-reload
        systemctl enable --now coffee-shop-backend
        systemctl restart nginx
        """
    )


def launch_instance(sess: boto3.Session, sg_id: str, profile_name: str, vpc_id: str) -> dict:
    ec2 = sess.client("ec2")
    existing = ec2.describe_instances(
        Filters=[
            {"Name": "tag:Name", "Values": [INSTANCE_NAME]},
            {"Name": "instance-state-name", "Values": ["pending", "running", "stopping", "stopped"]},
        ]
    )["Reservations"]
    for reservation in existing:
        for instance in reservation["Instances"]:
            return instance

    ami_id = latest_al2023_ami(sess)
    user_data = build_user_data()
    subnets = ec2.describe_subnets(
        Filters=[
            {"Name": "vpc-id", "Values": [vpc_id]},
        ]
    )["Subnets"]
    allowed_azs = {"us-east-1a", "us-east-1b", "us-east-1c", "us-east-1d", "us-east-1f"}
    candidates = [subnet for subnet in subnets if subnet.get("AvailabilityZone") in allowed_azs]
    if not candidates:
        raise RuntimeError("No supported subnet found for t3.micro in us-east-1")
    subnet_id = sorted(candidates, key=lambda subnet: subnet["AvailabilityZone"])[0]["SubnetId"]

    resp = ec2.run_instances(
        ImageId=ami_id,
        InstanceType="t3.micro",
        MinCount=1,
        MaxCount=1,
        IamInstanceProfile={"Name": profile_name},
        UserData=user_data,
        BlockDeviceMappings=[
            {
                "DeviceName": "/dev/xvda",
                "Ebs": {
                    "VolumeSize": 30,
                    "VolumeType": "gp3",
                    "DeleteOnTermination": True,
                },
            }
        ],
        NetworkInterfaces=[
            {
                "DeviceIndex": 0,
                "AssociatePublicIpAddress": True,
                "SubnetId": subnet_id,
                "Groups": [sg_id],
            }
        ],
        TagSpecifications=[
            {
                "ResourceType": "instance",
                "Tags": [
                    {"Key": "Name", "Value": INSTANCE_NAME},
                    {"Key": "Project", "Value": "coffee-shop-fullstack"},
                    {"Key": "FreeTier", "Value": "true"},
                ],
            }
        ],
        MetadataOptions={"HttpTokens": "required"},
    )

    return resp["Instances"][0]


def main() -> None:
    sess = session()
    sts = sess.client("sts")
    ident = sts.get_caller_identity()
    print(f"Using AWS account {ident['Account']} as {ident.get('Arn')}")

    topic_arn = ensure_sns_and_alarm(sess)
    print(f"SNS topic ready: {topic_arn}")

    profile_name = ensure_iam_role(sess)
    print(f"IAM instance profile ready: {profile_name}")

    sg_id, vpc_id = ensure_security_group(sess)
    print(f"Security group ready: {sg_id} in VPC {vpc_id}")

    instance = launch_instance(sess, sg_id, profile_name, vpc_id)
    instance_id = instance["InstanceId"]
    print(f"EC2 instance launched or reused: {instance_id}")

    ec2 = sess.client("ec2")
    waiter = ec2.get_waiter("instance_running")
    print("Waiting for instance to reach running state...")
    waiter.wait(InstanceIds=[instance_id])

    desc = ec2.describe_instances(InstanceIds=[instance_id])["Reservations"][0]["Instances"][0]
    public_dns = desc.get("PublicDnsName")
    public_ip = desc.get("PublicIpAddress")
    print("Instance is running.")
    print(f"Public DNS: {public_dns}")
    print(f"Public IP: {public_ip}")
    print("Reminder: the SNS email subscription must be confirmed from your inbox before the billing alarm can notify you.")


if __name__ == "__main__":
    main()
