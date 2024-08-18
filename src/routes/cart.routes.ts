import { Router } from "express";
import checkAuthToken from "../middlewares/authenticate";
import {
  checkoutCart,
  createCart,
  getCart,
} from "../controllers/cart.controller";
import { roleIdentifierUser } from "../middlewares/roleIdentifier";

const router = Router();

// add to cart
router.post("/cart", checkAuthToken, roleIdentifierUser, createCart);

// get the cart
router.get("/cart", checkAuthToken, roleIdentifierUser, getCart);

// checkout cart
router.post("/cart/checkout", checkAuthToken, roleIdentifierUser, checkoutCart);

export default router;
