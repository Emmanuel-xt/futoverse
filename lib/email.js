import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your@gmail.com
    pass: process.env.EMAIL_PASS, // App password (NOT your Gmail password)
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter verification failed:", error);
  } else {
    console.log("✅ Email transporter is ready to send messages");
  }
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Futoverse" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    // console.log("Email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error };
  }
};
