"use server";

import { signIn } from "../../auth";
import prisma from "@prisma/prisma";
import { addPoints } from "./points.prisma";
import { SYSTEM_USER_ID, SYSTEM_USER_EMAIL } from "@constants/app-config";
import { validateInput } from "@lib/validations/validate";
import { userIdSchema, updateUserSchema } from "@lib/validations/schemas";

export const updateUser = async (userId, form) => {
  const vId = validateInput(userIdSchema, { userId });
  if (!vId.success) return false;
  const vForm = validateInput(updateUserSchema, form);
  if (!vForm.success) return false;

  const {
    name,
    img,
    levelName,
    about,
    bio,
    gender,
    departmentName,
    departmentInitial,
  } = form;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { departmentId: true, points: true },
    });
    // Find or create the department
    const department = departmentName
      ? await prisma.department.upsert({
          where: { name: departmentName },
          create: { name: departmentName, initial: departmentInitial },
          update: {},
        })
      : null;

    // Find or create the level
    const level = levelName
      ? await prisma.level.upsert({
          where: { name: levelName },
          create: { name: levelName },
          update: {},
        })
      : null;

    // Update the user
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: name,
        picture: img,
        about: about,
        bio: bio,
        gender: gender,
        levelId: level?.id,
        departmentId: department?.id,
      },
    });

    if (!existingUser.departmentId) {
      await addPoints(userId, 50, "COMPLETE_PROFILE");
    }

    // Sign in the user after creation
    await signIn("credentials", {
      email: user.email,
      password: user.password,
      redirect: false,
    });

    return true;
  } catch (error) {
    console.error("Error updating user:", error);
    return false;
  }
};

export const createSystemUser = async () => {
  try {
    const systemUser = await prisma.user.create({
      data: {
        id: SYSTEM_USER_ID,
        username: "system",
        email: SYSTEM_USER_EMAIL,
        password: "system.password",
      },
    });

    return systemUser;
  } catch (error) {
    console.error("Error creating system user:", error);
    return null;
  }
};

export async function updateOldUsers() {
  const now = new Date();

  await prisma.user.updateMany({
    data: {
      createdAt: now,
      updatedAt: now,
    },
  });
}

export async function softDeleteUser(userId) {
  const v = validateInput(userIdSchema, { userId });
  if (!v.success) throw new Error("Invalid userId");
  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          isDeleted: true,
        },
      }),
      prisma.post.updateMany({
        where: { creatorId: userId },
        data: { isDeleted: true },
      }),
      prisma.comment.updateMany({
        where: { creatorId: userId },
        data: { isDeleted: true },
      }),
      prisma.message.updateMany({
        where: { senderId: userId },
        data: { isDeleted: true },
      }),
    ]);
    return { success: true };
  } catch (error) {
    console.error("Error soft deleting user:", error);
    throw new Error("Error soft deleting user");
  }
}
