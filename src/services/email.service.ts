import nodemailer from "nodemailer";
import dotenv from "dotenv";
import logger from "../utils/logger";

dotenv.config();
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  from: process.env.EMAIL_FROM,
});

export const sendMail = async (to: string, subject: string, body: string) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: body,
    });
  } catch (error) {
    logger.error("Error in sending mail", error);
  }
};
