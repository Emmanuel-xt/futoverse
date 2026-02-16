"use server";

import prisma from "@prisma/prisma";
import { validateInput } from "@lib/validations/validate";
import { rejectOrderSchema } from "@lib/validations/schemas";

export const rejectOrder = async (orderId, comment, userId) => {
  const validation = validateInput(rejectOrderSchema, { orderId, comment, userId });
  if (!validation.success) return { success: false, error: "Invalid input" };

  try {
    // Fetch the order with shop info to verify ownership
    const order = await prisma.order.findUnique({
      where: { orderId: orderId },
      include: {
        shop: {
          select: { userId: true },
        },
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Verify the user owns the shop that received this order
    if (order.shop.userId !== userId) {
      return { success: false, error: "Unauthorized to reject this order" };
    }

    const updatedOrder = await prisma.order.update({
      where: { orderId: orderId },
      data: {
        status: "rejected",
        comment: comment,
      },
    });

    return { success: true, order: updatedOrder };
  } catch (error) {
    console.error("Error rejecting order:", error);
    return { success: false, error: "Failed to reject order" };
  }
};
