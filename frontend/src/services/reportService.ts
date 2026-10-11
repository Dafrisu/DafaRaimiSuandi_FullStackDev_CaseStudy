
const API_URL = import.meta.env.VITE_API_URL;

export type ReportStatus = "pending" | "approved" | "rejected";

export type Report = {
    id: number;
    title: string;
    description: string;
    status: ReportStatus;
    created_at?: string;
    updated_at?: string;
};

type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data?: T;
};

async function request<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    const result = (await response.json()) as ApiResponse<T>;

    if (!response.ok || !result.success) {
        throw new Error(result.message ?? "An API request failed.");
    }

    return result;
}

export async function getReports(): Promise<Report[]> {
    const result = await request<Report[]>("/reports");
    return result.data ?? [];
}

export async function createReport(
    title: string,
    description: string,
): Promise<Report> {
    const result = await request<Report>("/reports", {
        method: "POST",
        body: JSON.stringify({ title, description }),
    });

    if (!result.data) {
        throw new Error("The API did not return the created report.");
    }

    return result.data;
}

export async function updateReportStatus(
    id: number,
    status: ReportStatus,
): Promise<Report> {
    const result = await request<Report>(`/reports/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });

    if (!result.data) {
        throw new Error("The API did not return the updated report.");
    }

    return result.data;
}
