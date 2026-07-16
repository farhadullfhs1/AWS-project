import os
import tempfile
import dj_database_url
from pathlib import Path
from datetime import timedelta
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent

DEBUG = os.environ.get('DJANGO_DEBUG', 'True' if os.environ.get('DJANGO_ENV', 'development').lower() != 'production' else 'False').lower() == 'true'

SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    if os.environ.get('DJANGO_ENV', 'development').lower() == 'production':
        raise ImproperlyConfigured('SECRET_KEY must be set in production.')
    SECRET_KEY = 'django-insecure-dev-key-change-this-in-production'

def _split_env(value, default=''):
    raw = os.environ.get(value, default)
    return [item.strip() for item in raw.split(',') if item.strip()]

ALLOWED_HOSTS = _split_env('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # Local apps
    'products',
    'orders',
    'payments',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # Added for Prod
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# Database Configuration
# Uses DATABASE_URL if available (Prod), else SQLite (Local)
LOCAL_SQLITE_PATH = Path(tempfile.gettempdir()) / 'brewhaven-local.sqlite3'
DATABASES = {
    'default': dj_database_url.config(
        # Store the dev SQLite database in temp so Windows file locking in the
        # workspace directory doesn't block local migrations.
        default='sqlite:///' + str(LOCAL_SQLITE_PATH),
        conn_max_age=600
    )
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# DRF Config
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny', # Allow read access by default
    ]
}

# JWT Config
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

# CORS Config (Allow React Frontend)
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
if DEBUG:
    # Local development often runs on a LAN IP like http://192.168.x.x:5173.
    # Allow all origins in debug so the browser can talk to the API without CORS friction.
    CORS_ALLOW_ALL_ORIGINS = True
    CORS_ALLOWED_ORIGINS = _split_env(
        'CORS_ALLOWED_ORIGINS',
        f'{FRONTEND_URL},http://localhost:5173,http://127.0.0.1:5173'
    )
    CSRF_TRUSTED_ORIGINS = _split_env(
        'CSRF_TRUSTED_ORIGINS',
        f'{FRONTEND_URL},http://localhost:5173,http://127.0.0.1:5173'
    )
else:
    CORS_ALLOWED_ORIGINS = _split_env('CORS_ALLOWED_ORIGINS', FRONTEND_URL)
    CSRF_TRUSTED_ORIGINS = _split_env('CSRF_TRUSTED_ORIGINS', FRONTEND_URL)


# Static Files (CSS, JavaScript, Images)
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', 'True').lower() == 'true'
