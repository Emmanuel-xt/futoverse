"use server";

import prisma from "@prisma/prisma";

export const fetchProductById = async (id) => {
  console.log("about to fetch product  with the id", id);
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
            // username: true,
          },
        },
        user: {
          select: {
            username: true,
            name: true,
          },
        },
      },
    });
    console.log("product", product);
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

    // console.log("product", products);

    // console.log("product", products);
    return products;
  } catch (error) {
    console.log("Error fetching product", error);
  }
};

export async function getRecentProducts() {
  try {
    const products = await prisma.shopItem.findMany({
      take: 10,
      orderBy: {
        id: "desc", // Most recently posted
      },
      include: {
        shop: {
          select: {
            name: true,
            image: true,
          },
        },
        user: {
          select: {
            name: true,
            picture: true,
          },
        },
      },
    });

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export const updateProductDetails = async (productId, form, userId) => {
  const { name, price, quantity, image, description, category } = form;
  const parseId = parseFloat(productId);

  try {
    // Verify ownership before updating
    const existingProduct = await prisma.shopItem.findUnique({
      where: { id: parseId },
      include: { shop: { select: { userId: true } } },
    });

    if (!existingProduct) {
      return { success: false, error: "Product not found" };
    }

    if (existingProduct.shop.userId !== userId && existingProduct.userId !== userId) {
      return { success: false, error: "Unauthorized to update this product" };
    }

    const product = await prisma.shopItem.update({
      where: { id: parseId },
      data: {
        name: name,
        description: description,
        quantity: quantity || 1,
        price: price,
        tag: category,
        image: image,
      },
    });

    return { success: true, product };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Failed to update product" };
  }
};

export const deleteProduct = async (productId, userId) => {
  const parseId = parseFloat(productId);

  try {
    // Verify ownership before deleting
    const existingProduct = await prisma.shopItem.findUnique({
      where: { id: parseId },
      include: { shop: { select: { userId: true } } },
    });

    if (!existingProduct) {
      return { success: false, error: "Product not found" };
    }

    if (existingProduct.shop.userId !== userId && existingProduct.userId !== userId) {
      return { success: false, error: "Unauthorized to delete this product" };
    }

    await prisma.shopItem.delete({
      where: { id: parseId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Failed to delete product" };
  }
};
