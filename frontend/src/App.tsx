import { useEffect, useState } from "react";
import {
  getReports,
  createReport,
  updateReportStatus,
  type Report,
  type ReportStatus,
} from "./services/reportService";
import "./App.css";

function App() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReports() {
      try {
        setError("");
        const data = await getReports();
        setReports(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load reports.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadReports();
  }, []);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!title.trim() || !description.trim()) {
      return;
    }

    try {
      setIsSaving(true);
      setSubmitError("");

      const newReport = await createReport(
        title.trim(),
        description.trim(),
      );

      setReports((currentReports) => [
        newReport,
        ...currentReports,
      ]);

      setTitle("");
      setDescription("");
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to create the report.",
      );
    } finally {
      setIsSaving(false);
    }
  }



  async function handleStatusChange(
    id: number,
    status: ReportStatus,
  ) {
    try {
      setError("");

      const updatedReport = await updateReportStatus(id, status);

      setReports((currentReports) =>
        currentReports.map((report) =>
          report.id === id ? updatedReport : report,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update report status.",
      );
    }
  }


  const pendingCount = reports.filter(
    (report) => report.status === "pending",
  ).length;

  const approvedCount = reports.filter(
    (report) => report.status === "approved",
  ).length;

  const rejectedCount = reports.filter(
    (report) => report.status === "rejected",
  ).length;

  return (
    <main className="app-container">
      <header className="page-header">
        <div>
          <p className="eyebrow">REPORT MANAGEMENT</p>
          <h1>Field Reports</h1>
          <p className="page-description">
            Create, review, and manage field reports in one place.
          </p>
        </div>
      </header>

      <section className="summary-grid" aria-label="Report summary">
        <article className="summary-card">
          <span className="summary-label">Total Reports</span>
          <strong>{reports.length}</strong>
        </article>

        <article className="summary-card">
          <span className="summary-label">Pending</span>
          <strong>{pendingCount}</strong>
        </article>

        <article className="summary-card">
          <span className="summary-label">Approved</span>
          <strong>{approvedCount}</strong>
        </article>

        <article className="summary-card">
          <span className="summary-label">Rejected</span>
          <strong>{rejectedCount}</strong>
        </article>
      </section>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>Create a report</h2>
            <p>Enter the report details below.</p>
          </div>
        </div>

        <form className="report-form" onSubmit={handleSubmit}>
          {submitError && (
            <p role="alert" className="form-error">
              {submitError}
            </p>
          )}
          <div className="form-field">
            <label htmlFor="report-title">Report name</label>
            <input
              id="report-title"
              type="text"
              placeholder="e.g. Damaged road near Main Street"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="report-description">Description</label>
            <textarea
              id="report-description"
              placeholder="Describe the issue or field observation..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              required
            />
          </div>

          <button
            className="button button-primary"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Create report"}
          </button>
        </form>
      </section>


      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>All reports</h2>
            <p>Review reports and update their status.</p>
          </div>
          <span className="report-count">{reports.length} reports</span>
        </div>

        {isLoading ? (
          <div className="empty-state">
            <h3>Loading reports...</h3>
            <p>Please wait while we retrieve your reports.</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h3>Unable to load reports</h3>
            <p>{error}</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="empty-state">
            <h3>No reports yet</h3>
            <p>Create your first report using the form above.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className="report-title-cell">{report.title}</td>
                    <td className="description-cell">
                      {report.description}
                    </td>
                    <td>
                      <span className={`status-badge status-${report.status}`}>
                        {report.status}
                      </span>
                    </td>
                    <td>
                      {report.status === "pending" ? (
                        <div className="action-buttons">
                          <button
                            className="button button-approve"
                            onClick={() =>
                              handleStatusChange(report.id, "approved")
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="button button-reject"
                            onClick={() =>
                              handleStatusChange(report.id, "rejected")
                            }
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="action-complete">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </main>
  );
}

export default App;
