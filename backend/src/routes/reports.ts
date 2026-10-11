
import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// Update an active report
router.put("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { title, description } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({
            success: false,
            message: "Report ID must be a positive integer.",
        });
        return;
    }

    if (
        typeof title !== "string" ||
        typeof description !== "string" ||
        !title.trim() ||
        !description.trim()
    ) {
        res.status(400).json({
            success: false,
            message: "Title and description are required.",
        });
        return;
    }

    try {
        const result = await pool.query(
            `UPDATE reports
       SET title = $1,
           description = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
         AND deleted_at IS NULL
       RETURNING id, title, description, status, created_at, updated_at`,
            [title.trim(), description.trim(), id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "Report not found.",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Report updated successfully.",
            data: result.rows[0],
        });
    } catch (error) {
        console.error("Failed to update report:", error);

        res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
});


// Get one active report by ID
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({
            success: false,
            message: "Report ID must be a positive integer.",
        });
        return;
    }

    try {
        const result = await pool.query(
            `SELECT id, title, description, status, created_at, updated_at
       FROM reports
       WHERE id = $1 AND deleted_at IS NULL`,
            [id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "Report not found.",
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        console.error("Failed to fetch report:", error);

        res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
});


// Get all active reports
// Get reports with pagination and optional status filtering
router.get("/", async (req, res) => {
    try {
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 10);
        const status = req.query.status;
        const search = req.query.search;

        // Validate pagination parameters
        if (
            !Number.isInteger(page) ||
            page < 1 ||
            !Number.isInteger(limit) ||
            limit < 1 ||
            limit > 100
        ) {
            res.status(400).json({
                success: false,
                message:
                    "Page must be a positive integer and limit must be between 1 and 100.",
            });
            return;
        }

        // Validate optional status filter
        const allowedStatuses = ["pending", "approved", "rejected"];

        if (
            status !== undefined &&
            (typeof status !== "string" ||
                !allowedStatuses.includes(status))
        ) {
            res.status(400).json({
                success: false,
                message:
                    "Invalid status. Allowed values: pending, approved, rejected.",
            });
            return;
        }

        // Validate optional search keyword
        if (search !== undefined && typeof search !== "string") {
            res.status(400).json({
                success: false,
                message: "Search must be a single text value.",
            });
            return;
        }

        // Calculate how many reports to skip
        const offset = (page - 1) * limit;

        // Build the filter safely using SQL parameters
        const filterStatus =
            typeof status === "string" ? status : null;

        const searchPattern =
            typeof search === "string" && search.trim() !== ""
                ? `%${search.trim()}%`
                : null;

        const countResult = await pool.query(
            `SELECT COUNT(*)::INTEGER AS total
            FROM reports
            WHERE deleted_at IS NULL
                AND ($1::VARCHAR IS NULL OR status = $1)
                AND (
                $2::VARCHAR IS NULL
                OR title ILIKE $2
                OR description ILIKE $2
                )`,
            [filterStatus, searchPattern]
        );

        const totalReports: number = countResult.rows[0].total;
        const totalPages = Math.ceil(totalReports / limit);


        const result = await pool.query(
            `SELECT id, title, description, status, created_at, updated_at
            FROM reports
            WHERE deleted_at IS NULL
                AND ($1::VARCHAR IS NULL OR status = $1)
                AND (
                $2::VARCHAR IS NULL
                OR title ILIKE $2
                OR description ILIKE $2
                )
            ORDER BY created_at DESC, id DESC
            LIMIT $3 OFFSET $4`,
            [filterStatus, searchPattern, limit, offset]
        );


        res.status(200).json({
            success: true,
            count: result.rows.length,
            pagination: {
                page,
                limit,
                totalReports,
                totalPages,
            },
            data: result.rows,
        });
    } catch (error) {
        console.error("Failed to fetch reports:", error);
        res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
});


// Create a new report
router.post("/", async (req, res) => {
    try {
        const { title, description } = req.body;

        // Validate required fields
        if (
            typeof title !== "string" ||
            typeof description !== "string" ||
            !title.trim() ||
            !description.trim()
        ) {
            res.status(400).json({
                success: false,
                message: "Title and description are required.",
            });
            return;
        }

        // Insert the report into PostgreSQL
        const result = await pool.query(
            `INSERT INTO reports (title, description)
       VALUES ($1, $2)
       RETURNING id, title, description, status, created_at, updated_at`,
            [title.trim(), description.trim()]
        );

        res.status(201).json({
            success: true,
            message: "Report created successfully.",
            data: result.rows[0],
        });
    } catch (error) {
        console.error("Failed to create report:", error);

        res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
});

// Soft-delete an active report
router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({
            success: false,
            message: "Report ID must be a positive integer.",
        });
        return;
    }

    try {
        const result = await pool.query(
            `UPDATE reports
       SET deleted_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
         AND deleted_at IS NULL
       RETURNING id, title, deleted_at`,
            [id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "Report not found.",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Report deleted successfully.",
            data: result.rows[0],
        });
    } catch (error) {
        console.error("Failed to delete report:", error);

        res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
});

// Update report status
router.patch("/:id/status", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { status } = req.body;

        // Validate report ID
        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({
                success: false,
                message: "Invalid report ID.",
            });
            return;
        }

        // Validate status
        const allowedStatuses = ["pending", "approved", "rejected"];

        if (
            typeof status !== "string" ||
            !allowedStatuses.includes(status)
        ) {
            res.status(400).json({
                success: false,
                message:
                    "Invalid status. Allowed values: pending, approved, rejected.",
            });
            return;
        }

        // Update only active reports
        const result = await pool.query(
            `UPDATE reports
       SET status = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
         AND deleted_at IS NULL
       RETURNING id, title, description, status, created_at, updated_at`,
            [status, id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "Report not found.",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Report status updated successfully.",
            data: result.rows[0],
        });
    } catch (error) {
        console.error("Failed to update report status:", error);
        res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
});

export default router;