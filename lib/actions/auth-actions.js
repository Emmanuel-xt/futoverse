"use server";

import crypto from "crypto";
import { sendEmail } from "@lib/email";
import { updateUserPassword } from "./user-actions";
import prisma from "@prisma/prisma";

export async function sendPasswordResetEmail(email) {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // console.log("user was found", user.username);

    if (!user) {
      // Don't reveal if email exists or not for security
      console.log("user was not found");
      return { success: true };
    }

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: resetToken,
        expires,
      },
    });
    // console.log("reset token was created", resetToken);

    // Create reset URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://futoverse.com";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    // Send email
    const emailResult = await sendEmail({
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You requested a password reset for your account. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
        </div>
      `,
    });

    if (!emailResult.success) {
      console.error("Failed to send reset email:", emailResult.error);
      return { success: false, error: "Failed to send reset email" };
    }
    // console.log("reset email was sent", emailResult);

    return { success: true };
  } catch (error) {
    console.error("Send password reset email error:", error);
    return { success: false, error: "Failed to send reset email" };
  }
}

export async function verifyResetToken(token) {
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return { valid: false, error: "Invalid token" };
    }

    // Check if token has expired
    if (resetToken.expires < new Date()) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { token },
      });
      return { valid: false, error: "Token has expired" };
    }

    return { valid: true, email: resetToken.email };
  } catch (error) {
    // console.error("Verify reset token error:", error);
    return { valid: false, error: "Invalid token" };
  }
}

export async function resetPassword(token, newPassword) {
  try {
    // Verify token first
    const tokenVerification = await verifyResetToken(token);
    if (!tokenVerification.valid) {
      return { success: false, error: tokenVerification.error };
    }

    // Get the email from token verification
    const email = tokenVerification.email;

    // Update user password
    const updateResult = await updateUserPassword(email, newPassword);

    if (!updateResult.success) {
      return { success: false, error: "Failed to update password" };
    }

    // Delete the used token
    await prisma.passwordResetToken.delete({
      where: { token },
    });

    return { success: true };
  } catch (error) {
    // console.error("Reset password error:", error);
    return { success: false, error: "Failed to reset password" };
  }
}

// Clean up expired tokens (you can run this periodically)
export async function cleanupExpiredTokens() {
  try {
    await prisma.passwordResetToken.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Cleanup expired tokens error:", error);
    return { success: false };
  }
}
