# URL Redirect Manager

A dynamic URL redirection system built with Next.js, Prisma, and PostgreSQL.

## Features

- Create unlimited URL redirects
- Manage redirects through a simple web interface
- Automatic redirection based on database rules
- RESTful API for managing redirects

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your PostgreSQL database and add the connection URL to `.env`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/your_database"
```

3. Run database migrations:
```bash
npx prisma migrate dev
```

4. Start the development server:
```bash
npm run dev
```

## Usage

1. Visit `http://localhost:3000` to access the web interface
2. Add new redirects by entering the source URL and target URL
3. Delete redirects using the delete button
4. All redirects are automatically applied when someone visits the source URL

## API Endpoints

- `GET /api/redirects` - Get all redirects
- `POST /api/redirects` - Create a new redirect
- `DELETE /api/redirects` - Delete a redirect

## Deployment

1. Deploy to Vercel:
```bash
vercel
```

2. Set up your PostgreSQL database (e.g., using Vercel Postgres)
3. Add the `DATABASE_URL` environment variable in your Vercel project settings
4. Deploy your database migrations:
```bash
vercel env pull .env
npx prisma migrate deploy
```
