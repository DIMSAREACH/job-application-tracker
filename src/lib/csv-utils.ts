import { Application } from "@prisma/client";

export function exportApplicationsToCSV(applications: Application[]) {
  if (!applications || applications.length === 0) return;

  const headers = [
    "Company",
    "Position",
    "Stage",
    "Interviewed",
    "Location",
    "Salary",
    "Job URL",
    "Date Applied",
    "Notes",
  ];

  const escapeCSV = (str: string | null | undefined) => {
    if (!str) return '""';
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const rows = applications.map((app) => [
    escapeCSV(app.company),
    escapeCSV(app.position),
    escapeCSV(app.status),
    escapeCSV(app.interviewed ? "Yes" : "No"),
    escapeCSV(app.location),
    escapeCSV(app.salary),
    escapeCSV(app.jobUrl),
    escapeCSV(new Date(app.dateApplied).toISOString().split("T")[0]),
    escapeCSV(app.notes),
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `job_applications_${new Date().toISOString().split("T")[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCSVToApplications(csvText: string): {
  company: string;
  position: string;
  location?: string;
  salary?: string;
  jobUrl?: string;
  status: "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED";
  interviewed: boolean;
  notes?: string;
  dateApplied: Date;
}[] {
  const lines = csvText.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const parsedApps: any[] = [];

  // Simple CSV parser ignoring quotes
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]
      .split(",")
      .map((val) => val.trim().replace(/^"|"$/g, ""));

    if (values.length >= 2 && values[0] && values[1]) {
      const company = values[0];
      const position = values[1];
      const rawStatus = (values[2] || "").toUpperCase();
      let status: "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED" = "APPLIED";
      if (["INTERVIEWING", "OFFER", "REJECTED"].includes(rawStatus)) {
        status = rawStatus as any;
      }

      const interviewed = (values[3] || "").toLowerCase() === "yes";
      const location = values[4] || undefined;
      const salary = values[5] || undefined;
      const jobUrl = values[6] || undefined;
      const dateAppliedStr = values[7];
      const dateApplied = dateAppliedStr ? new Date(dateAppliedStr) : new Date();
      const notes = values[8] || undefined;

      parsedApps.push({
        company,
        position,
        status,
        interviewed,
        location,
        salary,
        jobUrl,
        dateApplied: isNaN(dateApplied.getTime()) ? new Date() : dateApplied,
        notes,
      });
    }
  }

  return parsedApps;
}
