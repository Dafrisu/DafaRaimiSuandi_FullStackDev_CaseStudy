
import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import reportsRouter from "./routes/reports.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/reports", reportsRouter);

// Health-check endpoint
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Field Report API is running!",
    });
});

// Database connection test
app.get("/api/db-health", async (_req, res) => {
    try {
        const result = await pool.query("SELECT current_database()");

        res.status(200).json({
            success: true,
            message: "Database connection successful!",
            database: result.rows[0].current_database,
        });
    } catch (error) {
        console.error("Database connection failed:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed.",
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
