import { PrismaClient, User, Prisma, Role } from "@prisma/client";
import APIError, { HttpStatusCode } from "../middlewares/errorMiddleware";
import { ErrorCommonStrings, localConstant } from "../utils/constant";

const prisma = new PrismaClient();

export const createProductService = async (
  title: string,
  description: string,
  price: number,
  image: string
) => {
  try {
    const product = await prisma.product.create({
      data: {
        title: title,
        description: description,
        price: price,
        image: image,
      },
    });
    return product;
  } catch (error) {
    throw new APIError(
      ErrorCommonStrings.INTERNAL_SERVER_ERROR,
      HttpStatusCode.INTERNAL_ERROR,
      false,
      localConstant.INTERNAL_SERVER_ERROR
    );
  }
};

export const getProductsService = async () => {
  try {
    const products = await prisma.product.findMany({
      where: {
        published: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        image: true,
      },
      orderBy: {
        createAt: "desc",
      },
    });
    return products;
  } catch (error) {
    throw new APIError(
      ErrorCommonStrings.INTERNAL_SERVER_ERROR,
      HttpStatusCode.INTERNAL_ERROR,
      false,
      localConstant.INTERNAL_SERVER_ERROR
    );
  }
};

export const getProductByIdService = async (id: string) => {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: id,
      },
    });
    if (!product) {
      throw new APIError(
        ErrorCommonStrings.NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
        false,
        localConstant.PRODUCT_NOT_FOUND
      );
    }
    return product;
  } catch (error) {
    if (error instanceof APIError) {
      return error;
    }
    throw new APIError(
      ErrorCommonStrings.INTERNAL_SERVER_ERROR,
      HttpStatusCode.INTERNAL_ERROR,
      false,
      localConstant.INTERNAL_SERVER_ERROR
    );
  }
};

export const deleteProductService = async (id: string) => {
  try {
    const product = await prisma.product.delete({
      where: {
        id: id,
      },
    });
    return product;
  } catch (error) {
    throw new APIError(
      ErrorCommonStrings.INTERNAL_SERVER_ERROR,
      HttpStatusCode.INTERNAL_ERROR,
      false,
      localConstant.INTERNAL_SERVER_ERROR
    );
  }
};

export const changeProductStatusService = async (
  id: string,
  published: boolean
) => {
  try {
    const product = await prisma.product.update({
      where: {
        id: id,
      },
      data: {
        published: published,
      },
    });
    return product;
  } catch (error) {
    throw new APIError(
      ErrorCommonStrings.INTERNAL_SERVER_ERROR,
      HttpStatusCode.INTERNAL_ERROR,
      false,
      localConstant.INTERNAL_SERVER_ERROR
    );
  }
};
