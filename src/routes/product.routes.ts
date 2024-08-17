import { Router } from "express";
import checkAuthToken from "../middlewares/authenticate";
import { roleIdentifier } from "../middlewares/roleIdentifier";
import {
  changeProductStatus,
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
} from "../controllers/product.controller";

const router = Router();

router.post("/product/create", checkAuthToken, roleIdentifier, createProduct);

router.get("/products", getProducts);

router.get("/product/:id", getProductById);

router.delete("/product", checkAuthToken, roleIdentifier, deleteProduct);

router.put("/product", checkAuthToken, roleIdentifier, changeProductStatus);
export default router;
