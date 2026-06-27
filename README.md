# Gram Panchayat Management System

A full-stack e-governance platform for Gram Panchayat operations, citizen services, welfare scheme tracking, grievance handling, meetings, finance monitoring, reports, and role-based administration.

The system is designed for a production-style government service workflow: citizens can register, administrators verify accounts, staff manage service data, and monitors review performance through reports and dashboards.

## Highlights

| Area | What it provides |
| --- | --- |
| Citizen Services | Citizen records, household details, grievance filing, welfare scheme access, and meeting information |
| Administration | Role-based access, account approval, suspended account handling, and operational dashboards |
| Governance | Welfare schemes, Gram Sabha meetings, property tax records, financial summaries, and reporting |
| Smart Village Modules | WhatsApp complaint intake, certificate workflow, MGNREGA attendance and wage tracking, SHG management, and domestic tax/payment overview |
| Security | Password authentication, HTTP-only sessions, role protection, pending account verification, and audit logging |
| Deployment | Production build, MySQL database support, environment-based configuration, and deployment checklist |

## Core Features

- Role-based login for Administrator, Secretary, Monitor, and Citizen.
- Citizen self-registration with administrator verification before access.
- User management screen for approving or suspending accounts.
- Dashboard with local user profile and role-aware service shortcuts.
- Citizen records and household management.
- Welfare schemes with enrollment and budget tracking.
- Property tax and financial management.
- Public grievance submission and reference tracking.
- WhatsApp-style complaint intake with automatic category detection, priority prediction, SLA due date, officer assignment, and CSV export.
- Smart Services page for certificate applications, 100-days work scheme attendance/wages, Women Self Help Group project/loan tracking, and domestic tax payment status.
- Meetings and Gram Sabha scheduling.
- Reports and analytics for monitoring service delivery.
- Local development mode with sample data when no database is configured.
- Production MySQL mode for public deployment.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| UI | Radix UI components, Lucide icons |
| Backend | Hono, tRPC |
| Database | MySQL with Drizzle ORM |
| Auth | Email/password, signed session cookie, role middleware |
| Build | Vite client build and bundled Node server |

## Project Structure

```text
app/
  api/                 Backend, tRPC routers, auth, middleware
  contracts/           Shared constants and types
  db/                  Drizzle schema, relations, seed scripts
  src/                 React frontend
  DEPLOYMENT.md        Production deployment checklist
  README.md            Project documentation
  package.json         Scripts and dependencies
```

## Roles And Access

| Role | Access |
| --- | --- |
| Administrator | Full system access, user approvals, account suspension, reports, records, schemes, finance, meetings, grievances |
| Secretary | Records, schemes, finance, meetings, grievances |
| Monitor | Dashboard, schemes, finance, meetings, reports |
| Citizen | Dashboard, schemes, meetings, grievances |

New citizen registrations are created as `pending`. An administrator must approve the account from the **Users** page before the citizen can sign in.

## Requirements

- Node.js 20 or newer
- npm
- MySQL for production or database-backed testing
- VS Code or any modern editor

Check your installed versions:

```sh
node -v
npm -v
```

## Run Locally

The runnable project is inside the `app` folder.

```sh
cd "/Users/nareshramavath/Downloads/Gram Panchayat Management System/app"
npm install
npm run dev
```

## Real WhatsApp Complaint Intake

The backend exposes WhatsApp complaint intake webhooks that can receive villagers' WhatsApp messages and create complaints directly in the same grievance register used by the website. The app supports Meta Cloud API directly and Gupshup as an India-friendly WhatsApp Business provider.

Webhook endpoints:

```text
GET  /api/whatsapp/webhook   Meta verification endpoint
POST /api/whatsapp/webhook   Incoming WhatsApp messages
POST /api/whatsapp/gupshup   Incoming Gupshup WhatsApp messages
GET  /api/whatsapp/status    Local configuration status
```

Production webhook URL format:

```text
https://your-domain.com/api/whatsapp/webhook
https://your-domain.com/api/whatsapp/gupshup
```

Required environment variables:

```sh
WHATSAPP_VERIFY_TOKEN="choose-a-strong-random-string"
WHATSAPP_ACCESS_TOKEN="meta-whatsapp-cloud-api-token"
WHATSAPP_PHONE_NUMBER_ID="meta-phone-number-id"
WHATSAPP_API_VERSION="v21.0"
```

Gupshup provider variables:

```sh
GUPSHUP_API_KEY="gupshup-api-key"
GUPSHUP_SOURCE_NUMBER="registered-whatsapp-sender-number"
GUPSHUP_APP_NAME="gupshup-app-name"
GUPSHUP_WEBHOOK_TOKEN="choose-a-strong-random-string"
```

For Gupshup, set the callback/webhook URL in the Gupshup dashboard to:

```text
https://panchayat-management-system.vercel.app/api/whatsapp/gupshup/YOUR_GUPSHUP_WEBHOOK_TOKEN
```

Villagers can send a normal WhatsApp text, image, file, audio, video, or location message. Text becomes the complaint description; media/location messages are registered with the available caption, link, or location details. If the sender's number is not already in citizen records, the app creates a minimal citizen intake record so the complaint is still accepted and staff can verify the citizen later.

Flow:

1. A villager sends a text complaint to the official Panchayat WhatsApp Business number.
2. Meta or Gupshup sends the message to the configured webhook.
3. The app matches the WhatsApp number to a citizen phone number, including Indian numbers sent as `91XXXXXXXXXX`.
4. A grievance is created with source `whatsapp`, AI-style category, priority, SLA due date, and reference number.
5. If WhatsApp credentials are configured, the villager receives an automatic reply with the complaint reference number.

For production, configure the webhook in Meta Developer Console with the callback URL above and the same `WHATSAPP_VERIFY_TOKEN` value from your server environment.

Open:

```text
http://127.0.0.1:3000/
```

To stop the server, press `Control + C` in the terminal.

## Local Demo Mode

If `DATABASE_URL` is not set, the app runs with local sample data. The login page shows development role buttons:

- Admin
- Secretary
- Monitor
- Citizen

This is useful for demonstrations and UI testing. For real deployment, configure a MySQL database.

## Run With MySQL

Create a `.env` file:

```sh
cp .env.example .env
```

Set these values:

```env
NODE_ENV=production
DATABASE_URL=mysql://user:password@host:3306/database_name
APP_SECRET=replace_with_a_long_random_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_12_character_password
ADMIN_NAME=System Administrator
VITE_APP_NAME="Gram Panchayat Management System"
```

Push the schema and create the first administrator:

```sh
npm run db:push
npm run db:seed-admin
```

Run locally against the database:

```sh
npm run dev
```

## Useful Commands

```sh
npm run dev           # Start local development server
npm run check         # Type-check the project
npm run build         # Build frontend and backend for production
npm run start         # Start production server from dist
npm run db:push       # Push schema to MySQL
npm run db:seed-admin # Create or update the first admin user
```

## Deployment

This app should be deployed as a Node web service with a MySQL database.

Recommended environment variables:

```env
NODE_ENV=production
DATABASE_URL=mysql://user:password@host:3306/database
APP_SECRET=use_a_secure_random_value_at_least_32_characters
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=use_a_strong_password
ADMIN_NAME=System Administrator
VITE_APP_NAME="Gram Panchayat Management System"
```

Build and start commands:

```sh
npm install
npm run build
npm run start
```

After deployment, run the database setup once:

```sh
npm run db:push
npm run db:seed-admin
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full production checklist.

## Public Launch Checklist

- Use HTTPS only.
- Use a managed MySQL database with backups.
- Store secrets in the hosting provider environment variable manager.
- Confirm `APP_SECRET` is strong and private.
- Verify that citizen registrations stay pending until admin approval.
- Test all roles with real accounts before launch.
- Confirm records, schemes, grievances, meetings, finances, reports, and quick links work correctly.
- Keep `.env`, database credentials, and generated build files out of GitHub.

## GitHub Upload Notes

Upload the source project, not generated folders.

Include:

- `api/`
- `contracts/`
- `db/`
- `src/`
- `README.md`
- `DEPLOYMENT.md`
- `package.json`
- `package-lock.json`
- config files such as `vite.config.ts`, `tsconfig.json`, and `tailwind.config.js`

Do not include:

- `node_modules/`
- `dist/`
- `.env`
- `.env.local`
- `.DS_Store`
- build cache or coverage folders

## License

Add the required license before public release, based on the ownership and approval policy of the Gram Panchayat or deploying organization.
