import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerAdmin,
  registerUser,
} from "../controllers/user.controller";
import checkAuthToken from "../middlewares/authenticate";

const router = Router();

router.post("/user/register", registerUser);
router.post("/user/register-admin", registerAdmin);
router.post("/user/login", loginUser);
router.post("/user/logout", checkAuthToken, logoutUser);

export default router;
