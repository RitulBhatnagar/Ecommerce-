import { Request, Response, NextFunction } from "express";

export const roleIdentifierAdmin = (
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

export const roleIdentifierUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { role } = req.body.user;
  if (role !== "USER") {
    return res.status(403).json({ message: "Unauthorized access" });
  }
  next();
};
