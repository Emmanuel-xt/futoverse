"use server";

import prisma from "@prisma/prisma";
import { z } from "zod";

const createUserSchema = z.object({
  fullName: z.string().min(1),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function createUser(data) {
  try {
    const validatedData = createUserSchema.parse(data);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === validatedData.email) {
        return { success: false, error: "Email already exists" };
      }
      if (existingUser.username === validatedData.username) {
        return { success: false, error: "Username already exists" };
      }
    }

    // Store password as plain text (no encryption as requested)
    const user = await prisma.user.create({
      data: {
        name: validatedData.fullName,
        username: validatedData.username,
        email: validatedData.email,
        password: validatedData.password, // Plain text password
      },
    });

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("Create user error:", error);
    return { success: false, error: "Failed to create user" };
  }
}

export async function login(credentials) {
  try {
    const validatedData = loginSchema.parse(credentials);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        department: true,
        level: true,
      },
    });

    if (!user) {
      return null;
    }

    // Direct password comparison (no hashing)
    if (user.password !== validatedData.password) {
      return null;
    }

    return {
      id: user.id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      image: user.picture,
      bio: user.bio,
      department: user.department?.name,
      level: user.level?.name,
      gender: user.gender,
      needsOnboarding: user.needsOnboarding,
    };
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
}

export async function getUserByEmail(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        department: true,
        level: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Get user by email error:", error);
    return null;
  }
}

export async function getUserById(id) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number.parseInt(id) },
      include: {
        department: true,
        level: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Get user by ID error:", error);
    return null;
  }
}

export async function createUserFromGoogle(data) {
  try {
    // Generate a temporary username from email
    const baseUsername = data.email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    let username = baseUsername;
    let counter = 1;

    // Check if username exists and increment if needed
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        picture: data.picture,
        username: username,
        password: "", // Google users don't have passwords
        googleId: data.googleId,
        needsOnboarding: true, // New Google users need onboarding
      },
    });

    return user;
  } catch (error) {
    console.error("Create user from Google error:", error);
    return null;
  }
}

export async function completeUserProfile(userId, data) {
  try {
    // Check if username is already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        username: data.username,
        NOT: { id: Number.parseInt(userId) },
      },
    });

    if (existingUser) {
      return { success: false, error: "Username taken" };
    }

    // Find or create department if provided
    let departmentId = null;
    if (data.department) {
      const department = await prisma.department.upsert({
        where: { name: data.department },
        update: {},
        create: { name: data.department },
      });
      departmentId = department.id;
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: Number.parseInt(userId) },
      data: {
        username: data.username,
        bio: data.bio,
        departmentId,
        gender: data.gender,
        needsOnboarding: false, // Profile completed
      },
      include: {
        department: true,
      },
    });

    return {
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        bio: updatedUser.bio,
        department: updatedUser.department?.name,
        gender: updatedUser.gender,
      },
    };
  } catch (error) {
    console.error("Complete user profile error:", error);
    return { success: false, error: "Failed to complete profile" };
  }
}

export async function updateUserPassword(email, newPassword) {
  try {
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { password: newPassword }, // Plain text password
    });
    console.log("password updated successfully", updatedUser);
    return { success: true };
  } catch (error) {
    console.error("Update user password error:", error);
    return { success: false, error: "Failed to update password" };
  }
}
