# Rental Listings & Move-in Platform

Full-stack rental housing platform with:

- Next.js tenant/admin dashboards
- Express API
- MongoDB via Docker Compose
- JWT authentication and role-based authorization
- Listing review/publishing workflows
- Visit scheduling, shortlists, comparisons, move-in checklist, support tickets, and stay extensions

## Quick Start

Use Node.js 18.18 or newer.

```bash
docker compose up -d
npm install
cp server/.env.example server/.env
cp client/.env.example client/.env.local
npm run seed
npm run dev
```

Frontend: http://localhost:3000  
API: http://localhost:5000

Seeded users:

- Tenant: `tenant@example.com` / `password123`
- Admin: `admin@example.com` / `password123`
