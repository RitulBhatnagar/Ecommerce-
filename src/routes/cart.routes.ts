import { Router } from "express";
import checkAuthToken from "../middlewares/authenticate";
import {
  checkoutCart,
  createCart,
  getCart,
} from "../controllers/cart.controller";

const router = Router();

// add to cart
router.post("/cart/:id", checkAuthToken, createCart);

// get the cart
router.get("/cart", checkAuthToken, getCart);

// checkout cart
router.post("/cart/checkout", checkAuthToken, checkoutCart);

export default router;
