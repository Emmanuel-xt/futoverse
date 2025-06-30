"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
  try {
    const { data, error } = await resend.emails.send({
      from: "sandbox@resend.dev", // Use a verified sender domain or Resend's sandbox
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: "Email send failed" };
    }
    console.log("Email sent successfully:", data);
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error("Server error:", err);
    return { success: false, error: "Unexpected error sending email" };
  }
}
