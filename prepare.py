import os
import sys
from pathlib import Path

BASE_DIR = "server"

# --- 1. UPGRADE REQUIREMENTS ---
req_file = f"{BASE_DIR}/requirements.txt"
print(f"📦 Updating {req_file}...")

requirements = """
django>=5.0
djangorestframework
djangorestframework-simplejwt
django-cors-headers
razorpay
gunicorn
psycopg2-binary
dj-database-url
whitenoise
"""

with open(req_file, "w") as f:
    f.write(requirements.strip())

# --- 2. CREATE PROCFILE (For Heroku/Render) ---
proc_file = f"{BASE_DIR}/Procfile"
print(f"⚙️ Creating {proc_file}...")
with open(proc_file, "w") as f:
    f.write("web: gunicorn core.wsgi")

# --- 3. UPGRADE SETTINGS.PY ---
settings_file = f"{BASE_DIR}/core/settings.py"
print(f"🛠 Updating {settings_file} for Production...")

# Reading existing settings
with open(settings_file, "r") as f:
    settings_content = f.read()

# Prepare new content blocks
import_block = "import os\nimport dj_database_url\nfrom pathlib import Path"

# Add Whitenoise to Middleware (Crucial for CSS/Images in production)
middleware_upgrade = """
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
"""

# Smart Database Config (SQLite locally, Postgres in Prod)
db_upgrade = """
# Database Configuration
# Uses DATABASE_URL environment variable if available (Prod), else SQLite (Local)
DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///' + str(BASE_DIR / 'db.sqlite3'),
        conn_max_age=600
    )
}
"""

# Static Files Config
static_upgrade = """
# Static Files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
"""

# Allow all hosts in production (simplifies deployment)
hosts_upgrade = "ALLOWED_HOSTS = ['*']"

# Apply modifications
if "import dj_database_url" not in settings_content:
    settings_content = settings_content.replace("from pathlib import Path", import_block)

if "ALLOWED_HOSTS = []" in settings_content:
    settings_content = settings_content.replace("ALLOWED_HOSTS = []", hosts_upgrade)

if "'whitenoise.middleware.WhiteNoiseMiddleware'" not in settings_content:
    # Replace the whole middleware block to ensure correct order
    start = settings_content.find("MIDDLEWARE = [")
    end = settings_content.find("]", start) + 1
    if start != -1 and end != -1:
        settings_content = settings_content[:start] + middleware_upgrade.strip() + settings_content[end:]

if "dj_database_url.config" not in settings_content:
    # Replace the default database block
    # We look for the standard SQLite block to replace
    start = settings_content.find("DATABASES = {")
    end = settings_content.find("}", start) + 1
    if start != -1 and end != -1:
        # Check if it looks like the default block before replacing
        if "sqlite3" in settings_content[start:end]:
            settings_content = settings_content[:start] + db_upgrade.strip() + settings_content[end:]

if "STATIC_ROOT" not in settings_content:
    settings_content += "\n" + static_upgrade

# Write back
with open(settings_file, "w") as f:
    f.write(settings_content)

print("\n✅ Backend is now PRODUCTION READY!")
print("📝 Next Steps for you:")
print("1. Run: pip install -r server/requirements.txt")
print("2. (Frontend) You must update client/src/App.jsx to point to your new website URL instead of localhost.")