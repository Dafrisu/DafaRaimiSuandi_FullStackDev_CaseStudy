# Field Report Management System

A full-stack web application for creating, reviewing, and managing field reports.

## Features

- Create field reports with a title and description.
- View reports stored in PostgreSQL.
- Track report statuses: `pending`, `approved`, and `rejected`.
- Approve or reject pending reports.
- Persist report data and status changes in the database.
- Soft-delete reports through the backend API.

## Technology Stack

**Frontend**
- React
- TypeScript
- Vite

**Backend**
- Node.js
- Express.js
- TypeScript
- PostgreSQL

## Project Structure
backend/
├── migrations/
│   └── schema.sql
├── src/
│   ├── routes/
│   │   └── reports.ts
│   ├── db.ts
│   └── server.ts
├── .env.example
├── package.json
└── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── reportService.ts
│   │   ├── App.tsx
│   │   └── App.css
│   └── package.json
└── README.md


## Requirements

- Node.js and npm
- PostgreSQL
- Git

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check API health |
| GET | `/api/db-health` | Check database connectivity |
| GET | `/api/reports` | Retrieve reports |
| GET | `/api/reports/:id` | Retrieve one report |
| POST | `/api/reports` | Create a report |
| PUT | `/api/reports/:id` | Update report details |
| DELETE | `/api/reports/:id` | Soft-delete a report |
| PATCH | `/api/reports/:id/status` | Change report status |

## License

This project was created as a full-stack developer case study.


## Local Development Setup
### 1. Clone the Repository

Clone this repository and open the project directory in your terminal.

### 2. Set Up PostgreSQL

Create a PostgreSQL database named `field_reports_case_study`.

For example, using `psql`:

```sql
CREATE DATABASE field_reports_case_study;
```

Connect to the new database and execute the schema file:

```powershell
psql -U postgres -d field_reports_case_study -f backend/migrations/schema.sql
```

Replace `postgres` with your PostgreSQL username if necessary.

### 3. Configure the Backend

Open a terminal in the `backend` directory:

```powershell
cd backend
npm install
```

Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

Edit `backend/.env` with your PostgreSQL connection details:

```dotenv
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=field_reports_case_study
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
```

Replace `YOUR_POSTGRES_PASSWORD` with your actual local PostgreSQL password. Never commit the real `.env` file.

Start the backend development server:

```powershell
npm run dev
```

The API will run at `http://localhost:3000`.

### 4. Configure the Frontend

Open a second terminal at the project root:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
```

The frontend environment file should contain:

```dotenv
VITE_API_URL=http://localhost:3000/api
```

Start the frontend development server:

```powershell
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

### 5. Verify the Application

Check the backend health endpoint:

`http://localhost:3000/api/health`

Check the database connection endpoint:

`http://localhost:3000/api/db-health`

Then open the frontend and try creating a report, approving it, and rejecting another pending report.

### Production Builds

Build the backend:

```powershell
cd backend
npm run build
```

Build the frontend:

```powershell
cd frontend
npm run build
```