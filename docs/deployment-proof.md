# Deployment Proof Summary

This document records the deployment evidence for BrewHaven in a sanitized form.

## Verification Checklist

- AWS Free Tier EC2 deployment completed
- Region used: `us-east-1`
- Instance type used: `t3.micro`
- Nginx served the frontend
- Gunicorn served the Django backend
- CloudWatch billing alarm configured at `$0.01`
- Deployment later removed to avoid ongoing charges

## Evidence Captured

- EC2 console showing the instance in `running` state with `3/3 checks passed`
- CloudWatch alarm page showing `CoffeeShopEstimatedChargesAlarm` in `OK` state
- Browser view of the BrewHaven homepage
- Browser view of the BrewHaven menu page
- Live endpoint response showing `200 OK` at `/api/products/`

## Sanitization Rules

- Do not publish AWS access keys, secret keys, or session tokens
- Do not include full account IDs or billing identifiers
- Redact browser tabs, bookmark bars, and any personal account data
- Crop the screenshots so only the useful proof remains

## Resume Line

`Screenshots and live endpoint test results available on request.`
