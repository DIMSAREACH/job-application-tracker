import { Resend } from "resend";

export async function sendPasswordResetEmail(email: string, token: string) {

  const apiKey = process.env.RESEND_API_KEY;

  const baseUrl = process.env.NEXTAUTH_URL
    ? process.env.NEXTAUTH_URL
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const resetLink = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${token}`;

  console.log(`[AUTH MAIL] Password Reset Link for ${email}: ${resetLink}`);

  if (!apiKey) {
    console.warn("[RESEND] RESEND_API_KEY is not set in environment. Link logged to console above.");
    return { success: false, error: "RESEND_API_KEY is missing in server environment settings." };
  }

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: "Job Tracker <onboarding@resend.dev>",
      to: [email],
      subject: "Reset your Job Tracker Password",

      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff; shadow: 0 10px 25px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="background: linear-gradient(135deg, #4f46e5, #9333ea); display: inline-block; padding: 12px; border-radius: 16px; color: #ffffff;">
              <strong style="font-size: 20px;">💼 Job Tracker</strong>
            </div>
          </div>
          <h2 style="color: #0f172a; margin-bottom: 8px; text-align: center; font-size: 22px;">Reset Your Password</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; text-align: center;">
            We received a request to reset your password for your <strong>Job Application Tracker</strong> account. Click the button below to create a new password:
          </p>
          <div style="margin: 28px 0; text-align: center;">
            <a href="${resetLink}" style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #ffffff; padding: 14px 28px; border-radius: 14px; font-weight: bold; text-decoration: none; display: inline-block; font-size: 14px; shadow: 0 4px 12px rgba(79,70,229,0.3);">
              Reset Password Now
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            This security link will expire in 1 hour.<br/>If you didn't request a password reset, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="color: #cbd5e1; font-size: 11px; text-align: center;">
            Job Application Tracker • Automated Security System
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("[RESEND] Error sending password reset email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("[RESEND] Exception sending password reset email:", err);
    return { success: false, error: err.message || "Failed to send email" };
  }
}
