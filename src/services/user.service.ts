import { PrismaClient, User, Prisma, Role } from "@prisma/client";
import argon2 from "argon2";
import logger from "../utils/logger";
import jwt from "jsonwebtoken";
import APIError, { HttpStatusCode } from "../middlewares/errorMiddleware";
import { ErrorCommonStrings, localConstant } from "../utils/constant";

const prisma = new PrismaClient();

export const registerUserService = async (
  name: string,
  email: string,
  password: string,
  role: Role
): Promise<User> => {
  try {
    // Hash the password using bcrypt
    const hashedPassword = await argon2.hash(password);

    // Create a new user in the database
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        role: role,
      },
    });
    logger.info(`User registered successfully: ${user.id}`);
    return user;
  } catch (error) {
    logger.error("Error while registering user", error);

    // If the error is an instance of APIError, rethrow it
    if (error instanceof APIError) {
      throw error;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle Prisma-specific errors
      if (error.code === "P2002") {
        throw new APIError(
          ErrorCommonStrings.NOT_ALLOWED,
          HttpStatusCode.NOT_ALLOWED,
          true,
          localConstant.USER_ALREADY_EXISIT
        );
      }
    }

    // Throw a new APIError with a generic internal server error message
    throw new APIError(
      ErrorCommonStrings.INTERNAL_SERVER_ERROR,
      HttpStatusCode.INTERNAL_ERROR,
      false,
      localConstant.INTERNAL_SERVER_ERROR
    );
  }
};

export const loginUserService = async (email: string, password: string) => {
  try {
    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    // If the user does not exist, throw a NOT_FOUND error
    if (!user) {
      throw new APIError(
        ErrorCommonStrings.NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
        true,
        localConstant.USER_NOT_FOUND
      );
    }

    // Compare the password with the hashed password in the database
    const isPasswordValid = await argon2.verify(user.password, password);

    // If the password is invalid, throw an UNAUTHORIZED_REQUEST error
    if (!isPasswordValid) {
      throw new APIError(
        ErrorCommonStrings.UNAUTHORIZED_REQUEST,
        HttpStatusCode.UNAUTHORIZED_REQUEST,
        true,
        localConstant.INVALID_PASSWORD
      );
    }

    // Generate an authentication token for the user
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET || "",
      {
        expiresIn: "24h",
      }
    );
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.token.upsert({
      where: { userId: user.id },
      update: { token: token, expiresAt: expiresAt },
      create: {
        userId: user.id,
        token: token,
        expiresAt: expiresAt,
      },
    });
    // Return the authentication token
    return token;
  } catch (error) {
    logger.error("Error in logging in user service", error);
    if (error instanceof APIError) {
      // If the error is an instance of APIError, rethrow it
      throw error;
    }

    // Throw a new APIError with a generic internal server error message
    throw new APIError(
      ErrorCommonStrings.INTERNAL_SERVER_ERROR,
      HttpStatusCode.INTERNAL_ERROR,
      false,
      localConstant.INTERNAL_SERVER_ERROR
    );
  }
};

export const logoutUserService = async (userId: string) => {
  try {
    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        token: true,
      },
    });

    // If the user does not exist, throw a NOT_FOUND error
    if (!user) {
      throw new APIError(
        ErrorCommonStrings.NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
        true,
        localConstant.USER_NOT_FOUND
      );
    }
    // Delete the token from the database
    await prisma.token.deleteMany({
      where: {
        userId: user.id,
        token: user.token[0].token,
      },
    });
    return true;
  } catch (error) {
    logger.error("Error in logging out user service", error);
    if (error instanceof APIError) {
      // If the error is an instance of APIError, rethrow it
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
