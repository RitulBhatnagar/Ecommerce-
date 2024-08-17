import { PrismaClient, User, Prisma, Role } from "@prisma/client";
import APIError, { HttpStatusCode } from "../middlewares/errorMiddleware";
import { ErrorCommonStrings, localConstant } from "../utils/constant";
import { AddToCartDto, CheckoutDto } from "../types/cart";
import logger from "../utils/logger";

const prisma = new PrismaClient();
export const createCartService = async (
  userId: string,
  { productId, quantity }: AddToCartDto
) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: {
        userId: userId,
      },
      include: { items: true },
    });

    if (!cart) {
      await prisma.cart.create({
        data: {
          userId: userId,
          items: {
            create: {
              productId: productId,
              quantity: quantity,
            },
          },
        },
      });
    }

    const exisitingItem = cart?.items.find(
      (item) => item.productId === productId
    );
    if (exisitingItem) {
      await prisma.cartItem.update({
        where: {
          id: exisitingItem.id,
        },
        data: {
          quantity: {
            increment: quantity,
          },
        },
      });
    }
    if (!cart) {
      throw new APIError(
        ErrorCommonStrings.NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
        false,
        localConstant.CART_NOT_FOUND
      );
    }

    await prisma.cartItem.create({
      data: {
        cartId: cart?.id,
        productId: productId,
        quantity: quantity,
      },
    });

    return cart;
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

    logger.info("Sending the mail to user");
    // send mail to user
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
