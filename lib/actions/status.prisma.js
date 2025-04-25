"use server";

import prisma from "@prisma/prisma";

export const createStoreStatus = async (shopId, form) => {
  const { text, media } = form;
  try {
    // console.log("about to create store status");

    // Set expiresAt to 30 minutes from now (example: replace 30 with your desired minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    const status = await prisma.StoreStatus.create({
      data: {
        shopId: shopId,
        content: text,
        media: media,
        expiresAt: expiresAt,
      },
    });

    // console.log("status created succeffully", status);
    return true;
  } catch (error) {
    // console.log("error creating store status ", error);
    return false;
  }
};
