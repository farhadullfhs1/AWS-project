from django.contrib.auth.models import User
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.contrib.auth.password_validation import validate_password
from rest_framework import status
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from orders.models import StaffProfile


def _create_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


def _staff_context(user):
    try:
        profile = user.staff_profile
        return {
            "employee_id": profile.employee_id,
            "staff_branch": profile.branch,
        }
    except StaffProfile.DoesNotExist:
        return {
            "employee_id": "",
            "staff_branch": "",
        }


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        identifier = (attrs.get("username") or attrs.get("email") or attrs.get("identifier") or "").strip()
        password = attrs.get("password") or ""

        if not identifier:
            raise DRFValidationError({"username": "Email or username is required."})
        if not password:
            raise DRFValidationError({"password": "Password is required."})

        user = User.objects.filter(username__iexact=identifier).first()
        if user is None and "@" in identifier:
            user = User.objects.filter(email__iexact=identifier).first()

        if user is not None:
            attrs["username"] = user.username
        else:
            attrs["username"] = identifier

        data = super().validate(attrs)
        data["username"] = self.user.username
        data["email"] = self.user.email
        data["is_staff"] = self.user.is_staff
        data.update(_staff_context(self.user) if self.user.is_staff else {"employee_id": "", "staff_branch": ""})
        return data


class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        password = request.data.get("password") or ""
        username = (request.data.get("username") or "").strip() or email

        if not email:
            return Response({"error": "email is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            validate_email(email)
        except DjangoValidationError:
            return Response({"error": "Enter a valid email address"}, status=status.HTTP_400_BAD_REQUEST)
        if not password:
            return Response({"error": "password is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            validate_password(password)
        except DjangoValidationError as exc:
            return Response({"error": " ".join(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email__iexact=email).exists():
            return Response({"error": "email already exists"}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({"error": "username already exists"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, email=email, password=password)
        tokens = _create_tokens(user)

        return Response(
            {
                "message": "Account created successfully",
                "email": user.email,
                **tokens,
                "username": user.username,
                "is_staff": user.is_staff,
                **(_staff_context(user) if user.is_staff else {"employee_id": "", "staff_branch": ""}),
            },
            status=status.HTTP_201_CREATED,
        )
