# Deployment Proof Summary

This document records the deployment evidence for BrewHaven in a sanitized form.

## What Was Verified

- One AWS EC2 Free Tier instance was created and used for the deployment.
- The instance was launched in `us-east-1`.
- The app was served behind Nginx with Gunicorn running the Django backend.
- A CloudWatch billing alarm was created with a `$0.01` threshold.
- The deployment was later removed to avoid any further AWS charges.

## Sanitized Evidence

- EC2 console showed the instance in `running` state with `3/3 checks passed`.
- CloudWatch alarm page showed `CoffeeShopEstimatedChargesAlarm` in `OK` state.
- The public site returned `200 OK` at the root URL.
- The API returned `200 OK` at `/api/products/`.

## Privacy Notes

- No AWS secret keys are stored here.
- No account password, access token, or private billing identifier is included.
- The screenshots used for resume proof should be redacted before publishing if they show browser tabs, AWS account IDs, or any other personal details.

## Suggested Resume Line

`Screenshots and live endpoint test results available on request.`
