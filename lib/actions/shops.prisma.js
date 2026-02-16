"use server";

import prisma from "@prisma/prisma";
import { name } from "file-loader";
import { revalidatePath } from "next/cache";
import { validateInput } from "@lib/validations/validate";
import { createShopSchema, createStoreSchema, updateShopSchema } from "@lib/validations/schemas";

export const createShop = async (form) => {
  const validation = validateInput(createShopSchema, form);
  if (!validation.success) return false;

  const { id, name, description, longitude, latitude, category, userId } = form;
  // console.log("Create shop action was triggered");

  try {
    const shop = await prisma.shop.create({
      data: {
        id: id,
        name: name,
        description: description,
        longitude: longitude,
        latitude: latitude,
        category: category,
        userId: userId,
      },
    });

    // console.log("sharp! you now own a shop at ", shop.kingdom);
    return true;
  } catch (error) {
    // console.log("Error creating shop", error);
    return false;
  }
};

export async function createStore(data) {
  console.log(
    "Create store action was triggered with data:",
    data,
    data.userId * 1000
  );

  const validation = validateInput(createStoreSchema, data);
  if (!validation.success) throw new Error("Invalid input");

  try {

    // Check if store name already exists
    const existingStore = await prisma.shop.findUnique({
      where: { name: data.name },
    });

    if (existingStore) {
      throw new Error("A store with this name already exists");
    }

    // Create the store
    const newStore = await prisma.shop.create({
      data: {
        id: data.userId * 1000,
        name: data.name,
        description: data.description,
        category: data.category,
        locationDesc: data.locationDesc,
        image: data.image || null,
        userId: data.userId,
        latitude: data.latitude, // Set as null as requested
        longitude: data.longitude, // Set as null as requested
        size: 0.0007, // Default value from schema
        model: "default", // You may want to make this configurable
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log("Store created successfully:", newStore);

    // Revalidate the stores page to show the new store
    revalidatePath("/finds/stores");
    revalidatePath("/shops");

    return newStore;
  } catch (error) {
    console.error("Error creating store:", error);

    throw new Error("Failed to create store");
  }
}

export const fetchUserShopById = async (id) => {
  // console.log("about to fetch shops of user with the id", id);

  try {
    const stores = await prisma.shop.findUnique({
      where: {
        name: id,
      },
      include: {
        shopItems: true,
        statuses: true,
        user: true,
        orders: {
          include: {
            items: true,
            user: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });
    // console.log("stores", stores);
    return stores;
  } catch (error) {
    console.log("Error fetching stores of user", id, error);
  }
};

export const fetchShopForEditing = async (id) => {
  // console.log("about to fetch shops of user with the id", id);

  try {
    const stores = await prisma.shop.findUnique({
      where: {
        name: id,
      },
      select: {
        name: true,
        description: true,
        image: true,
        category: true,
        locationDesc: true,
        coverImage: true,
        model: true,
      },
    });
    // console.log("stores", stores);
    return stores;
  } catch (error) {
    // console.log("Error fetching stores of user", id, error);
  }
};

export const fetchShopandItsUserId = async (id) => {
  // console.log("about to fetch shop with the id", id);

  try {
    const stores = await prisma.shop.findUnique({
      where: {
        name: id,
      },
      select: {
        name: true,
        userId: true,
      },
    });
    // console.log("stores with user id ", stores);
    return stores;
  } catch (error) {
    // console.log("Error fetching stores of user", id, error);
  }
};

export const fetchUserShopByUserId = async (id) => {
  // console.log("about to fetch shops of user with the id", id);

  try {
    const stores = await prisma.shop.findMany({
      where: {
        userId: id,
      },
      select: {
        id: true,
        name: true,
      },
    });
    // console.log("stores", stores.name);
    return stores;
  } catch (error) {
    // console.log("Error fetching stores of user", id, error);
  }
};

export const addShopItemsToShopId = async (shopId, product, userId) => {
  if (!shopId || !product || !userId) return { success: false, message: "Invalid input" };

  const { name, image, description, quantity, price, category } = product;
  // console.log("about to add items to shop ->", shopId);

  const shop = await prisma.shop.findUnique({
    where: { name: shopId },
  });

  // if (!shop) {
  if (!shop || shop.userId !== userId) {
    // console.log("are you sure you are the owner");
    throw new Error("Unauthorized: You are not the owner of this shop");
  }
  // console.log("Sure you are the owner");
  try {
    const addeditems = await prisma.shopItem.create({
      data: {
        tag: category,
        image: image,
        name: name,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        shopId: shop.id,
        userId: userId,
      },
    });
    // console.log("ShopItems added successfully to shop", addeditems);
    return { success: true, addeditems };
  } catch (error) {
    console.error("Error adding items : ", error);
    return { success: false, message: error.message };
  }
};

export const createOrder = async (orderData) => {
  if (!orderData || !orderData.orderId) throw new Error("Invalid input");

  // console.log("About to create order", orderData);
  // const existingUser = await prisma.user.findUnique({
  //   where: { id: orderData.userId },
  // });
  // if (!existingUser) {
  //   throw new Error(`User with ID ${orderData.userId} does not exist`);
  // }
  // const existingShop = await prisma.shop.findUnique({
  //   where: { id: parseFloat(orderData.shopId) },
  // });
  // if (!existingShop) {
  //   throw new Error(`Shop with ID ${orderData.shopId} does not exist`);
  // }
  // console.log("Order items", orderData.items);
  try {
    const order = await prisma.order.create({
      data: {
        orderId: orderData.orderId,
        totalAmount: orderData.totalAmount,
        orderDate: orderData.orderDate,
        status: orderData.status,
        userId: orderData.userId,
        shopId: orderData.shopId,
        items: {
          create: orderData.items.create,
        },
      },
    });

    // console.log("Order created successfully", order);
    return order;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error; // Rethrow the error to be caught in the front end
  }
};

export const fetchOnlyShops = async () => {
  // console.log("fetch shops for 3d map display was invocked");

  try {
    const shops = await prisma.shop.findMany({
      include: {
        user: true,
      },
    });
    // console.log("Shops fetched successfully");
    return { success: true, shops };
  } catch (error) {
    // console.log("Error fetching shops for 3d display", error);
    if (error.code === "P1001") {
      return {
        success: false,
        message: "Database connection failed. Please try again later.",
      };
    }

    return {
      success: false,
      message: "An unexpected error occurred while fetching shops.",
    };
  }
};

export const fetchOnlyShop = async (shopId) => {
  // console.log("fetch shops for 3d map display was invocked");

  try {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        user: true,
      },
    });
    // console.log("Shop details fetched successfully", shop);
    return { success: true, shop };
  } catch (error) {
    // console.log("Error fetching shops for 3d display", error);
    if (error.code === "P1001") {
      return {
        success: false,
        message: "Database connection failed. Please try again later.",
      };
    }

    return {
      success: false,
      message: "An unexpected error occurred while fetching shops.",
    };
  }
};

export const fetchAllShops = async () => {
  console.log("fetching all shops");
  try {
    const shops = await prisma.shop.findMany();
    console.log("All shops were fetched");
    return shops;
  } catch (error) {
    console.log("Error fetching all shops", error);
    throw new Error("Error fetching all stores");
  }
};

export const filterShops = async (term, category) => {
  // console.log("Filtering of shops was triggered", term, category);

  try {
    const shops = await prisma.shop.findMany({
      where: {
        AND: [
          category
            ? { category: { equals: category, mode: "insensitive" } }
            : {}, // Filter by category if provided
          {
            OR: [
              { name: { contains: term, mode: "insensitive" } }, // Match shop name
              {
                shopItems: {
                  some: { name: { contains: term, mode: "insensitive" } },
                },
              }, // Match shop items
            ],
          },
        ],
      },
      include: {
        shopItems: {
          select: {
            name: true,
          },
        },
      },
    });

    // console.log("Indeed shops are being filtered", shops);
    return shops;
  } catch (error) {
    // console.log("Error performing filtering", error);
    return null;
  }
};

export const updateShopDetails = async (shopId, form, userId) => {
  const validation = validateInput(updateShopSchema, form);
  if (!validation.success) return { success: false, error: "Invalid input" };

  const { name, image, desc, category, locationDesc, coverImage } = form;

  try {
    // Verify ownership before updating
    const existingShop = await prisma.Shop.findUnique({
      where: { name: shopId },
      select: { userId: true },
    });

    if (!existingShop) {
      return { success: false, error: "Shop not found" };
    }

    if (existingShop.userId !== userId) {
      return { success: false, error: "Unauthorized to update this shop" };
    }

    const shop = await prisma.Shop.update({
      where: { name: shopId },
      data: {
        name: name,
        description: desc,
        category: category,
        image: image,
        locationDesc: locationDesc,
        coverImage: coverImage,
      },
    });

    return { success: true, shop };
  } catch (error) {
    console.error("Error updating shop:", error);
    return { success: false, error: "Failed to update shop" };
  }
};

export const updateShopTileId = async ({
  storeName,
  newTileId,
  longitude,
  latitude,
  storeId,
}) => {
  if (!storeName || !newTileId) return false;

  try {
    // Update the user
    const shop = await prisma.Shop.update({
      where: {
        name: storeName,
      },
      data: {
        id: newTileId,
        longitude: longitude,
        latitude: latitude,
      },
    });

    // console.log("shop tile id was changed:", shop.id, newTileId);

    return true;
  } catch (error) {
    console.error("Error updating shop tile id:", error);
    return false;
  }
};

export const deleteStore = async (shopId) => {
  if (!shopId) return false;

  // console.log("Deleting store with id:", shopId);
  try {
    const shop = await prisma.shop.delete({
      where: {
        name: shopId, // Use the unique id field here
      },
    });
    // console.log("Store deleted successfully:", shop);
    return true;
  } catch (error) {
    console.error("Error deleting store:", error);
    return false;
  }
};

export const shopCouter = async (userId) => {
  if (!userId) return 0;

  const shopCount = await prisma.shop.count({
    where: {
      userId: userId, // Replace with the actual user ID
    },
  });
  // console.log("shop count =", shopCount);
  return shopCount;
};

export const getFilteredStores = async (category, searchedItem) => {
  try {
    const shops = await prisma.shop.findMany({
      where: {
        AND: [
          category ? { category } : {},
          searchedItem
            ? {
                items: {
                  some: {
                    name: {
                      contains: searchedItem,
                      mode: "insensitive",
                    },
                  },
                },
              }
            : {},
        ],
      },
      include: {
        items: true, // Include items to display them if needed
      },
    });

    // console.log("shops filterd based on ", shops);
    return shops;
  } catch (error) {
    // console.log("Error performing filtering", error);
  }
};
