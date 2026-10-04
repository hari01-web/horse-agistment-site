// Email alerts via Resend (https://resend.com). Switched off until these are
// set in Vercel (Project → Settings → Environment Variables):
//   RESEND_API_KEY  – from Resend → API Keys
//   EMAIL_FROM      – e.g. "Strathyre Park <alerts@strathyrepark.com.au>"
//   ALERT_EMAIL     – where admin alerts go (comma-separate for several)
//   SITE_URL        – e.g. "https://strathyrepark.com.au" (for links)
// Sending never blocks or breaks the action that triggered it.

const SITE_URL = (process.env.SITE_URL || "https://horse-agistment-site.vercel.app").replace(/\/$/, "");

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

export async function sendEmail({
  to,
  subject,
  lines,
  linkPath,
  linkLabel = "Open Strathyre Park",
}: {
  to: string | string[] | null | undefined;
  subject: string;
  lines: string[];
  linkPath?: string;
  linkLabel?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const recipients = (Array.isArray(to) ? to : [to])
    .flatMap((t) => (t ?? "").split(","))
    .map((t) => t.trim())
    .filter(Boolean);
  if (!apiKey || !from || recipients.length === 0) return;

  const link = linkPath ? `${SITE_URL}${linkPath}` : SITE_URL;
  const text = [...lines, "", `${linkLabel}: ${link}`].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#1c2333">
${lines.map((l) => `<p>${escapeHtml(l)}</p>`).join("\n")}
<p><a href="${link}" style="display:inline-block;background:#2c3e64;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">${escapeHtml(linkLabel)}</a></p>
<p style="color:#888;font-size:12px">Strathyre Park · Welcome Creek</p>
</div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: recipients, subject, text, html }),
    });
    if (!res.ok) console.error("Email send failed", res.status, await res.text());
  } catch (err) {
    console.error("Email send failed", err);
  }
}

// Alerts for the stable (admin), e.g. a new message or request.
export function alertAdmin(subject: string, lines: string[], linkPath: string) {
  return sendEmail({ to: process.env.ALERT_EMAIL, subject, lines, linkPath });
}

// Short preview of free text for an email.
export function preview(text: string, max = 300) {
  const clean = text.trim().replace(/\s+/g, " ");
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}
