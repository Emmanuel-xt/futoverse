"use server";

import { BsEmojiGrimaceFill } from "react-icons/bs";
// import { auth, signIn,getSession } from "@auth";
// import prisma from "@prisma/prisma";

import { signIn } from "../../auth"; // Ensure the correct import
import prisma from "@prisma/prisma";

export const createUser = async (form) => {
  const { email, fullName, username, password } = form;

  // console.log("Create user Function was triggered", form);

  try {
    // Create the user
    const user = await prisma.user.create({
      data: {
        email: email,
        username: username,
        password: password,
        name: fullName,
      },
    });

    // console.log("User created successfully:", user);

    // Sign in the user after creation
    await signIn("credentials", {
      email: user.email,
      password: password,
      redirect: false,
    });

    return true;
  } catch (error) {
    console.error("Error creating user:", error);
    return false;
  }
};

export const updateUser = async (userId, form) => {
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

    // console.log("User updated successfully:", user);

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

export const login = async (credentials) => {
  const { email, password } = credentials;
  // console.log("Login was triggered");

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      throw new Error("User with email does not exist");
    }
    const doesPasswordMatch = (await password) === user.password;
    // console.log("Cred passwrd", password, "db password", user.password);
    if (!doesPasswordMatch)
      throw new Error("The password does not match with the provided email");
    // console.log("Login Successfull");
    return user;
  } catch (error) {
    // console.log("error Loggin in", error);
  }
};

export const fetchUserByUsername = async (username) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        picture: true,
        about: true,
        bio: true,
        department: {
          select: {
            name: true,
          },
        },
        level: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            shops: true,
            friends: true,
          },
        },
      },
    });
    // console.log("User -->", user, "found🫡");
    return user;
  } catch (error) {
    // console.log("Error fetching the user :", username, "😓", error);
  }
};

export const fetchOnlyUserInfo = async (username) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      include: {
        department: true,
        level: true,
      },
    });
    // console.log("User -->", user, "found🫡");
    return user;
  } catch (error) {
    // console.log("Error fetching the user :", username, "😓", error);
  }
};

export const fetchAllUsersForListing = async () => {
  // console.log("About to fetch all users ");
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        picture: true,
        department: true,
        level: true,
      },
    });
    // console.log("Users -->", users, "found🫡");
    return users;
  } catch (error) {
    // console.log("Error fetching the users: ", error);
    return [];
  }
};

export const searchUsers = async (query) => {
  // console.log("About to fetch users based on search", query);
  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { username: { contains: query, mode: "insensitive" } },
            ],
          },
          // { id: { not: authUserId } }, // Exclude the authenticated user
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        picture: true,
      },
      take: 10, // Limit results to avoid performance issues
    });

    // console.log("users found", users);

    return users;
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
};

// export const deleteUser = async ()

export const createSystemUser = async () => {
  try {
    const systemUser = await prisma.user.create({
      data: {
        id: 141618,
        username: "system",
        email: "system@futoverse.com",
        password: "system.password",
      },
    });

    // console.log("✅ Created system user:", systemUser);
    return systemUser;
  } catch (error) {
    // console.log("Error creating Systemuser", error);
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

  console.log("Updated all existing users with createdAt and updatedAt");
}
