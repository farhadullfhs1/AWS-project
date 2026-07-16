# AWS Deployment Checklist

This repository is prepared for a common AWS setup:

- Frontend: Vite build deployed to S3 or served from EC2 with Nginx
- Backend: Django + Gunicorn on EC2 or App Runner
- Database: PostgreSQL on RDS

## Required environment variables

### Frontend

- `VITE_API_URL` should point to the public backend API, for example `https://api.example.com/api`

### Backend

- `SECRET_KEY`
- `DJANGO_ENV=production`
- `DJANGO_DEBUG=False`
- `DJANGO_ALLOWED_HOSTS`
- `FRONTEND_URL`
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`
- `DATABASE_URL`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

## Backend startup

Run database migrations before starting Gunicorn:

```bash
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn core.wsgi:application --bind 0.0.0.0:8000
```

## Health check

- `GET /health/` returns `{"status":"ok"}`
- `GET /api/products/` should return the menu payload

## Frontend build

```bash
cd client
npm install
npm run build
```

The production build output is in `client/dist/`.
