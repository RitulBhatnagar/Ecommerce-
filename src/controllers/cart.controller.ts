import { Request, Response } from "express";
import {
  createCartService,
  getCartService,
  checkoutCartService,
} from "../services/cart.service";
import logger from "../utils/logger";
import APIError, { HttpStatusCode } from "../middlewares/errorMiddleware";
import { localConstant } from "../utils/constant";
import { AddToCartDto, CheckoutDto } from "../types/cart";

export const createCart = async (req: Request, res: Response) => {
  const { userId } = req.body.user;
  const addToCartDto: AddToCartDto = req.body;

  try {
    const addToCart = await createCartService(userId, addToCartDto);
    return res.status(HttpStatusCode.CREATED).json({
      message: "Item added successfully",
      cart: addToCart,
    });
  } catch (error) {
    logger.error("Error in creating cart", error);
    if (error instanceof APIError) {
      return res
        .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({
          message: error.message || localConstant.INTERNAL_SERVER_ERROR,
        });
    }

    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: localConstant.INTERNAL_SERVER_ERROR,
    });
  }
};

export const getCart = async (req: Request, res: Response) => {
  const { userId } = req.body.user;

  try {
    const cart = await getCartService(userId);
    return res.status(HttpStatusCode.OK).json({
      message: "Cart retrieved successfully",
      cart: cart,
    });
  } catch (error) {
    logger.error("Error in getting cart", error);
    if (error instanceof APIError) {
      return res
        .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({
          message: error.message || localConstant.INTERNAL_SERVER_ERROR,
        });
    }
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: localConstant.INTERNAL_SERVER_ERROR,
    });
  }
};
export const checkoutCart = async (req: Request, res: Response) => {
  const { userId } = req.body.user;
  const checkoutDto: CheckoutDto = req.body;

  try {
    const checkoutResult = await checkoutCartService(userId, checkoutDto);
    return res.status(HttpStatusCode.OK).json({
      message: "Checkout completed successfully",
      order: checkoutResult,
    });
  } catch (error) {
    logger.error("Error in checking out cart", error);
    if (error instanceof APIError) {
      return res
        .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({
          message: error.message || localConstant.INTERNAL_SERVER_ERROR,
        });
    }

    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: localConstant.INTERNAL_SERVER_ERROR,
    });
  }
};
