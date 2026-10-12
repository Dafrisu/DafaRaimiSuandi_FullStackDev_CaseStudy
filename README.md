# Field Report Management System

A full-stack application built with React, TypeScript, Express.js, and PostgreSQL.

## Prerequisites

Install the following before proceeding:

- [Node.js and npm](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Git](https://git-scm.com/)

## 1. Clone the Repository

Clone the repository and navigate to the project directory:

```powershell / gitbash

git clone https://github.com/Dafrisu/DafaRaimiSuandi_FullStackDev_CaseStudy

cd DafaRaimiSuandi_FullStackDev_CaseStudy
```

## 2. Set Up the Database

Create a PostgreSQL database named `field_reports_case_study`:

```sql
CREATE DATABASE field_reports_case_study;
```

Connect to the database and execute the schema file from the project root:

```powershell
psql -U postgres -d field_reports_case_study -f .\backend\migrations\schema.sql
```

Replace `postgres` with your PostgreSQL username if necessary.

## 3. Configure and Run the Backend

Open a PowerShell terminal in the project root and run:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Open `backend/.env` and configure your PostgreSQL connection settings:
```
dotenv
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=field_reports_case_study
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
```

Replace `YOUR_POSTGRES_PASSWORD` with your PostgreSQL password.

Start the backend:

```powershell
npm run dev
```

The API will run at `http://localhost:3000`.

Keep this terminal running.

## 4. Configure and Run the Frontend

Open a second PowerShell terminal in the project root:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
```

Ensure `frontend/.env` contains:

dotenv
VITE_API_URL=http://localhost:3000/api


Start the frontend:

```powershell
npm run dev
```

Open the URL displayed in the terminal, usually `http://localhost:5173`.

## 5. Verify the Setup

Open these URLs in your browser:

- API health: `http://localhost:3000/api/health`
- Database connection: `http://localhost:3000/api/db-health`
- Frontend: `http://localhost:5173`

Try creating a report and changing its status to confirm the application works.

## 6. Production Build (Optional)

Build the backend:

```powershell
cd backend
npm run build
```

Build the frontend in a separate terminal:

```powershell
cd frontend
npm run build
```

## Notes

- Keep the backend and frontend terminals running during local development.
- Never commit `.env` files containing local credentials.
- The `.env.example` files provide the required environment variable templates.
