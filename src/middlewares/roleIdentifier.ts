import { Request, Response, NextFunction } from "express";

export const roleIdentifier = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { role } = req.body.user;
  if (role !== "ADMIN") {
    return res.status(403).json({ message: "Unauthorized access" });
  }

  next();
};
