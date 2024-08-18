import { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "../middlewares/errorMiddleware";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

interface DecodedToken {
  id: string;
  role: string;
  exp: number;
}

const prisma = new PrismaClient();
const checkAuthToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(HttpStatusCode.UNAUTHORIZED)
      .json({ message: "Unauthorized: Missing authorization token" });
  }

  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined.");
    return res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
  const token = authHeader.split(" ")[1];

  try {
    // find the token in the database
    const tokenData = await prisma.token.findUnique({
      where: {
        token: token,
      },
    });
    if (!tokenData) {
      return res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: "Please login or register" });
    }
    const decodedToken = jwt.verify(token, JWT_SECRET) as DecodedToken;

    // Check if token has expired
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (decodedToken.exp < currentTimestamp) {
      return res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: "Please login again" });
    }

    req.body.user = { userId: decodedToken.id, role: decodedToken.role };
    next();
  } catch (error) {
    console.log("Token validation error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      return res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: "Unauthorized: Token has expired" });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: "Unauthorized: Invalid authorization token" });
    }

    return res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error during token validation" });
  }
};

export default checkAuthToken;
