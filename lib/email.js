import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Reusable sendEmail function for all Futoverse system emails
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Futoverse <noreply@futoverse.com>", // 👈 use your verified domain
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend Email Error:", error);
      return { success: false, error };
    }

    // console.log("Email sent successfully:", data);


    return { success: true, data };
  } catch (err) {
    // console.error("Unexpected sendEmail error:", err);
    return { success: false, error: err };
  }
};
