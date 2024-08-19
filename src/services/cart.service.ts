import { PrismaClient, User, Prisma, Role } from "@prisma/client";
import APIError, { HttpStatusCode } from "../middlewares/errorMiddleware";
import { ErrorCommonStrings, localConstant } from "../utils/constant";
import { AddToCartDto, CheckoutDto } from "../types/cart";
import logger from "../utils/logger";
import { sendMail } from "./email.service";
// import { emailQueue } from "../index";

const prisma = new PrismaClient();
export const createCartService = async (
  userId: string,
  { productId, quantity }: AddToCartDto
) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          items: {
            create: {
              productId,
              quantity,
            },
          },
        },
        include: { items: true },
      });
      return true;
    }

    const existingItem = cart.items.find(
      (item) => item.productId === productId
    );

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: { increment: quantity },
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    return true;
  } catch (error) {
    logger.error("Error in creating cart service", error);
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      ErrorCommonStrings.INTERNAL_SERVER_ERROR,
      HttpStatusCode.INTERNAL_ERROR,
      false,
      localConstant.INTERNAL_SERVER_ERROR
    );
  }
};

export const getCartService = async (userId: string) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: {
        userId: userId,
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
    return cart;
  } catch (error) {
    throw new APIError(
      ErrorCommonStrings.INTERNAL_SERVER_ERROR,
      HttpStatusCode.INTERNAL_ERROR,
      false,
      localConstant.INTERNAL_SERVER_ERROR
    );
  }
};

export const checkoutCartService = async (
  userId: string,
  { shippingAddress }: CheckoutDto
) => {
  logger.info(shippingAddress);
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new APIError(
        ErrorCommonStrings.NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
        false,
        localConstant.USER_NOT_FOUND
      );
    }

    const cart = await prisma.cart.findUnique({
      where: {
        userId: userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new APIError(
        ErrorCommonStrings.NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
        false,
        localConstant.CART_NOT_FOUND
      );
    }

    await prisma.cart.delete({
      where: {
        id: cart.id,
      },
    });
    console.log(user.email);
    logger.info("Sending mail to the user", user.email);
    await sendMail(
      user.email,
      "Order Confirmation",
      "Your order has been confirmed"
    );
    return { success: true, message: "Checkout successful" };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      ErrorCommonStrings.INTERNAL_SERVER_ERROR,
      HttpStatusCode.INTERNAL_ERROR,
      false,
      localConstant.INTERNAL_SERVER_ERROR
    );
  }
};
