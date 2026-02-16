"use server";

import prisma from "@prisma/prisma";
import { validateInput } from "@lib/validations/validate";
import { updateProductSchema } from "@lib/validations/schemas";

export const fetchProductById = async (id) => {
  if (!id) return null;

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
    return product;
  } catch (error) {
    console.error("Error fetching product:", id, error);
    return null;
  }
};

export const fetchAllProducts = async () => {
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

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
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
  const validation = validateInput(updateProductSchema, form);
  if (!validation.success) return { success: false, error: "Invalid input" };

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
  if (!productId || !userId) return { success: false, error: "Invalid input" };

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
