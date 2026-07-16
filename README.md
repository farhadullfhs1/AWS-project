# BrewHaven Coffee Shop

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Django](https://img.shields.io/badge/Django-REST%20Framework-092E20?logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![AWS](https://img.shields.io/badge/AWS-EC2%20Free%20Tier-FF9900?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/free/)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Status](https://img.shields.io/badge/Deployment-Verified-success)](docs/deployment-proof.md)

Full-stack coffee shop e-commerce platform built with React and Django REST Framework. The app supports browsing, authentication, cart management, checkout, and order cancellation. It was deployed and validated on AWS Free Tier, then decommissioned to avoid ongoing charges.

## Overview

- Frontend: React, Tailwind CSS, Vite
- Backend: Django, Django REST Framework, SimpleJWT
- Database: SQLite for local development
- Production stack: AWS EC2, Nginx, Gunicorn

## Features

- Product browsing and menu display
- JWT authentication
- Cart management
- Checkout and order creation
- Order cancellation support
- Responsive UI for mobile and desktop

## Screenshots

Redacted screenshots are best kept in `docs/screenshots/`.

- [Deployment Proof Guide](docs/screenshots/README.md)
- Suggested files:
  - `aws-ec2-instance.png`
  - `cloudwatch-billing-alarm.png`
  - `frontend-homepage.png`
  - `menu-page.png`
  - `api-products-ok.png`

## Deployment Proof

The project was deployed and verified on AWS Free Tier before being removed to avoid charges.

- EC2 `t3.micro` instance was running
- Nginx served the frontend
- Django API responded successfully
- Billing alarm was configured to protect against accidental spend

Captured checks before teardown:

- Frontend returned `200 OK`
- API returned `200 OK` from `/api/products/`

See [`docs/deployment-proof.md`](docs/deployment-proof.md) for the sanitized verification summary.

## Privacy

This repository is kept free of AWS access keys, account numbers, tokens, and other private details.
