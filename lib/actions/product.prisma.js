"use server";

import prisma from "@prisma/prisma";
import { Select } from "@radix-ui/react-select";

export const fetchProductById = async (id) => {
  // console.log("about to fetch product  with the id", id);
  const parseId = parseFloat(id);

  try {
    const product = await prisma.shopItem.findUnique({
      where: {
        id: parseId,
      },
      include: {
        shop: {
          select: {
            name: true,
            userId: true,
          },
        },
      },
    });
    // console.log("product", product);
    return product;
  } catch (error) {
    console.log("Error fetching product", id, error);
  }
};
export const fetchAllProductS = async () => {
  console.log("about to fetch all products");

  try {
    const products = await prisma.shopItem.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        tag: true,
        image: true,
        userId: true,
        shop: {
          select: {
            longitude: true,
            latitude: true,
          },
        },
      },
    });

    console.log("product", products);

    console.log("product", products);
    return products;
  } catch (error) {
    console.log("Error fetching product", error);
  }
};

export const updateProductDetails = async (productId, form) => {
  const { name, price, quantity, image, description, category } = form;
  const parseId = parseFloat(productId);

  console.log("Update product Function was triggered");

  try {
    // Update the user
    const product = await prisma.shopItem.update({
      where: {
        id: parseId,
      },
      data: {
        name: name,
        description: description,
        quantity: quantity || 1,
        price: price,
        tag: category,
        image: image,
      },
    });

    console.log("shop details updated successfully:", product);

    return true;
  } catch (error) {
    console.error("Error updating shop:", error);
    return false;
  }
};

export const deleteProduct = async (productId) => {
  console.log("Deleting Product with id:", productId);
  const parseId = parseFloat(productId);
  try {
    const product = await prisma.shopItem.delete({
      where: {
        id: parseId, // Use the unique id field here
      },
    });
    console.log("product deleted successfully:", product);
    return true;
  } catch (error) {
    console.error("Error deleting store:", error);
    return false;
  }
};
