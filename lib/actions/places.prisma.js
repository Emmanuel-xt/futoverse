"use server";
// The contents of this file is not yet usefull

import prisma from "@prisma/prisma";

export const registerPlace = async (form) => {
  console.log("Places creation function was fired");
  const { email, userName, placeName, longitude, latitude } = form;
  try {
    const created = await prisma.place.create({
      data: {
        email: email,
        userName: userName,
        placeName: placeName,
        longitude: longitude,
        latitude: latitude,
      },
    });
    console.log(`Place: ${placeName} was registerd`);
    return true;
  } catch (error) {
    console.log("Error registering place", error);
    return false;
  }
};

export const fetchFilteredPlace = async (term) => {
  try {
    const filtered = await prisma.Place.findMany({
      where: {
        placeName: { contains: term, mode: "insensitive" },
      },
      select: {
        placeName: true,
        longitude: true,
        latitude: true,
      },
    });
    console.log("places where fetched");
    return filtered;
  } catch (error) {
    console.log("error filtering places", error);
  }
};
