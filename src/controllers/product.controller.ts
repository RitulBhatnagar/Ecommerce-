import { Request, Response } from "express";
import logger from "../utils/logger";
import APIError, { HttpStatusCode } from "../middlewares/errorMiddleware";
import { localConstant } from "../utils/constant";
import {
  createProductService,
  getProductByIdService,
  changeProductStatusService,
  deleteProductService,
  getProductsService,
} from "../services/product.service";

export const createProduct = async (req: Request, res: Response) => {
  const { title, description, price, image } = req.body;

  try {
    // Call the service function to create the product
    const product = await createProductService(
      title,
      description,
      price,
      image
    );

    return res.status(HttpStatusCode.CREATED).json({
      message: "Product created successfully",
      product: product,
    });
  } catch (error) {
    logger.error("Error in creating product", error);
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

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await getProductsService();
    return res.status(HttpStatusCode.OK).json({
      products: products,
    });
  } catch (error) {
    logger.error("Error in getting products", error);
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

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await getProductByIdService(id);
    return res.status(HttpStatusCode.OK).json({
      product: product,
    });
  } catch (error) {
    logger.error("Error in getting product by id", error);
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

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await deleteProductService(id);
    return res.status(HttpStatusCode.OK).json({
      message: "Product deleted successfully",
      product: product,
    });
  } catch (error) {
    logger.error("Error in deleting product", error);
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

export const changeProductStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const product = await changeProductStatusService(id, status);
    return res.status(HttpStatusCode.OK).json({
      message: "Product status changed successfully",
      product: product,
    });
  } catch (error) {
    logger.error("Error in changing product status", error);
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
