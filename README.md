# BrewHaven Coffee Shop

Full-stack coffee shop e-commerce app built with React and Django REST Framework.

## Stack

- Frontend: React, Tailwind CSS, Vite
- Backend: Django, Django REST Framework, SimpleJWT
- Database: SQLite for local development
- Deployment: AWS EC2 Free Tier with Nginx and Gunicorn

## Core Features

- Product browsing and menu display
- JWT authentication
- Cart management
- Checkout and order creation
- Order cancellation support
- Responsive UI for mobile and desktop

## AWS Deployment Proof

The project was deployed and verified on AWS Free Tier before being decommissioned to avoid ongoing charges.

Verified during deployment:

- EC2 `t3.micro` instance was running
- Nginx served the frontend
- Django API responded successfully
- Billing alarm was configured to protect against accidental spend

Live checks captured before teardown:

- Frontend: `200 OK`
- API: `200 OK` from `/api/products/`

See [`docs/deployment-proof.md`](docs/deployment-proof.md) for a sanitized proof summary.

## Privacy

This repository is kept free of AWS access keys, account numbers, tokens, and other private details.
