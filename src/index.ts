import express from "express";
import dotenv from "dotenv";
import logger from "./utils/logger";
dotenv.config();
import userRoute from "./routes/user.routes";
import productRoute from "./routes/product.routes";
import cartRoute from "./routes/cart.routes";
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/api", userRoute);
app.use("/api", productRoute);
app.use("/api", cartRoute);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

export default app;
