"use server";

import prisma from "@prisma/prisma";
import { z } from "zod";
import { addPoints } from "./points.prisma";

const createUserSchema = z.object({
  fullName: z.string().min(1),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  invite: z.string().nullable().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function createUser(data) {
  try {
    const validatedData = createUserSchema.parse(data);
    console.log("Creating user with data:", validatedData);

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

    const user = await prisma.user.create({
      data: {
        name: validatedData.fullName,
        username: validatedData.username,
        email: validatedData.email,
        password: validatedData.password,
      },
    });
    if (validatedData.invite) {
      const id = Number.parseInt(validatedData.invite);
      const inviter = await prisma.user.findUnique({
        where: { id: id },
      });

      if (inviter) {
        const add = await addPoints(inviter.id, 100, "INVITE_ACCEPTED");

        console.log("points added to inviter:", add);

        // Log the invite relationship
        await prisma.inviteHistory.create({
          data: {
            inviterId: inviter.id,
            inviteeId: user.id,
          },
        });

        const notify = await prisma.notification.create({
          data: {
            userId: inviter.id,
            type: "INVITE_ACCEPTED",
            title: "Your just eared 100points!",
            body: `${user.name} just joined using your invite link!`,
            link: `/profile/${user.username}`, // optional link to new user's profile
          },
        });
        console.log("Notification created for inviter:", notify);
      }
    }

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

    if (!user || user.isDeleted) {
      return null;
    }

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
    console.log("Completing user profile for ID:", userId, "with data:", data);
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
    // let departmentId = null;
    // if (data.department) {
    //   const department = await prisma.department.upsert({
    //     where: { name: data.department },
    //     update: {},
    //     create: { name: data.department },
    //   });
    //   departmentId = department.id;
    // }

    const department = data.departmentName
      ? await prisma.department.upsert({
          where: { name: data.departmentName },
          create: {
            name: data.departmentName,
            initial: data.departmentInitial,
          },
          update: {},
        })
      : null;

    const level = data.level
      ? await prisma.level.upsert({
          where: { name: data.level },
          create: { name: data.level },
          update: {},
        })
      : null;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: Number.parseInt(userId) },
      data: {
        username: data.username,
        about: data.about,
        gender: data.gender,
        departmentId: department?.id,
        levelId: level?.id,
        needsOnboarding: false, // Profile completed
      },
      include: {
        department: true,
      },
    });

    console.log("User profile updated successfully:", updatedUser);

    return {
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        about: updatedUser.about,
        department: updatedUser.department?.name,
        level: updatedUser.level?.name,
        gender: updatedUser.gender,
        needsOnboarding: false, // Profile completed
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
      data: { password: newPassword },
    });
    return { success: true };
  } catch (error) {
    console.error("Update user password error:", error);
    return { success: false, error: "Failed to update password" };
  }
}
