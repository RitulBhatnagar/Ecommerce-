import { Router } from "express";
import checkAuthToken from "../middlewares/authenticate";
import {
  roleIdentifierAdmin,
  roleIdentifierUser,
} from "../middlewares/roleIdentifier";
import {
  changeProductStatus,
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
} from "../controllers/product.controller";

const router = Router();

router.post(
  "/product/create",
  checkAuthToken,
  roleIdentifierAdmin,
  createProduct
);

router.get("/products", getProducts);

router.get("/product/:id", getProductById);

router.delete(
  "/product/:id",
  checkAuthToken,
  roleIdentifierAdmin,
  deleteProduct
);

router.put(
  "/product/:id",
  checkAuthToken,
  roleIdentifierAdmin,
  changeProductStatus
);
export default router;
