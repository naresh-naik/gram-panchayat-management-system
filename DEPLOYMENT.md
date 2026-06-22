# Deployment Checklist

## Required Production Environment

- `NODE_ENV=production`
- `DATABASE_URL=mysql://user:password@host:3306/database`
- `APP_SECRET` set to a long random value, at least 32 characters
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` for first administrator setup
- `PORT` if your hosting provider does not use `3000`

## Database Setup

Run these once against the production database:

```sh
npm install
npm run db:push
npm run db:seed-admin
```

After the first administrator signs in, open `Users` from the admin navigation to verify pending citizen registrations, suspend accounts if required, and keep role access controlled from inside the application.

## Build And Start

```sh
npm run check
npm run build
npm run start
```

The app serves the built frontend and API from the same origin. Use HTTPS in front of the Node server so secure session cookies work correctly.

## Role Access

- Administrator: all sections
- Secretary: records, schemes, finance, meetings, grievances
- Monitor: dashboard, schemes, finance, meetings, reports
- Citizen: dashboard, schemes, meetings, grievances

## Before Public Launch

- Use a managed MySQL database with daily backups.
- Use HTTPS only.
- Store environment variables in the hosting provider secret manager.
- Rotate `APP_SECRET` only during a planned session reset.
- Confirm an administrator account exists before opening access to users.
- Confirm new citizen registrations remain pending until an administrator approves them.
- Review each role with a real login before launch: Administrator, Secretary, Monitor, and Citizen.
- Keep database credentials out of the repository.
