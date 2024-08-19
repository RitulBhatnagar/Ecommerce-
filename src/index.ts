import express from "express";
import dotenv from "dotenv";
import logger from "./utils/logger";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
dotenv.config();
import userRoute from "./routes/user.routes";
import productRoute from "./routes/product.routes";
import cartRoute from "./routes/cart.routes";
import healthRoute from "./routes/health.routes";
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Add CORS preflight
app.options("*", cors());
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
// To disable caching, use the following:
app.use("/api", userRoute);
app.use("/", healthRoute);
app.use("/api", productRoute);
app.use("/api", cartRoute);
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

export default app;
