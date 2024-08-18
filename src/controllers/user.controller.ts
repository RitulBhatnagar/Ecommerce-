import { Request, Response } from "express";
import logger from "../utils/logger";
import APIError, { HttpStatusCode } from "../middlewares/errorMiddleware";
import { localConstant } from "../utils/constant";

import {
  loginUserService,
  logoutUserService,
  registerUserService,
} from "../services/user.service";
import { Role } from "@prisma/client";

export const registerUser = async (req: Request, res: Response) => {
  // Destructure the request body to get the user details
  const { name, email, password } = req.body;

  try {
    // Call the service function to register the user
    const registerUser = await registerUserService(
      name,
      email,
      password,
      Role.USER
    );

    // Return the response with the created user
    return res.status(HttpStatusCode.CREATED).json({
      message: "User created successfully",
      registerUser,
    });
  } catch (error) {
    // Log the error if any
    logger.error("Error in registering user", error);

    // If the error is an instance of APIError, return the appropriate error response
    if (error instanceof APIError) {
      return res
        .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({
          message: error.message || localConstant.USER_NOT_CREATED,
        });
    }

    // Return the internal server error response
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: localConstant.USER_NOT_CREATED,
    });
  }
};

export const registerAdmin = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    // Call the service function to register the user
    const registerUser = await registerUserService(
      name,
      email,
      password,
      Role.ADMIN
    );

    // Return the response with the created user
    return res.status(HttpStatusCode.CREATED).json({
      message: "Admin created successfully",
      registerUser,
    });
  } catch (error) {
    // Log the error if any
    logger.error("Error in registering admin controller", error);

    // If the error is an instance of APIError, return the appropriate error response
    if (error instanceof APIError) {
      return res
        .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({
          message: error.message || localConstant.ADMIN_NOT_CREATED,
        });
    }

    // Return the internal server error response
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: localConstant.ADMIN_NOT_CREATED,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  try {
    // Call the service function to login the user
    const loginUser = await loginUserService(email, password, role);

    // Return the response with the logged in user
    return res.status(HttpStatusCode.OK).json({
      message: "User logged in successfully",
      accessToken: loginUser,
    });
  } catch (error) {
    // Log the error if any
    logger.error("Error in logging in user", error);

    // If the error is an instance of APIError, return the appropriate error response
    if (error instanceof APIError) {
      return res
        .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({
          message: error.message || localConstant.USER_NOT_LOGGED_IN,
        });
    }

    // Return the internal server error response
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: localConstant.INTERNAL_SERVER_ERROR,
    });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  const { userId } = req.body.user;

  if (!userId) {
    return res
      .status(HttpStatusCode.UNAUTHORIZED)
      .json({ message: "Unauthorized: Missing user id" });
  }

  try {
    const logoutUser = await logoutUserService(userId);
    return res.status(HttpStatusCode.OK).json({
      message: "User logged out successfully",
      logout: logoutUser,
    });
  } catch (error) {
    logger.error("Error in logout of user", error);

    // If the error is an instance of APIError, return the appropriate error response
    if (error instanceof APIError) {
      return res
        .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({
          message: error.message || localConstant.USER_LOGOUT_FAILED,
        });
    }

    // Return the internal server error response
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: localConstant.USER_LOGOUT_FAILED,
    });
  }
};
