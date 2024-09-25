import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import Joi from "joi";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .external(async (value, helpers) => {
      const emailExists = await prisma.user.findFirst({
        where: { email: value },
      });

      if (emailExists) {
        throw new Joi.ValidationError("Custom validation error", [
          {
            message: "Email already in use",
            path: ["email"],
            type: "any.custom",
            context: { label: "email", key: "email" },
          },
        ]);
      }
      return value;
    }),
  password: Joi.string().min(8).required(),
  username: Joi.string().required().max(40),
  handler: Joi.string()
    .required()
    .pattern(/@/)
    .external(async (value, helpers) => {
      const handlerExists = await prisma.user.findFirst({
        where: { handler: value },
      });

      if (handlerExists) {
        throw new Joi.ValidationError("Custom validation error", [
          {
            message: "This handler is already in use",
            path: ["handler"],
            type: "any.custom",
            context: { label: "handler", key: "handler" },
          },
        ]);
      }

      return value;
    }),
}).messages({
  "any.custom": "{{#message}}",
  "string.pattern.base": '{{#label}} must contain "@" symbol',
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(8),
});

export const login = async (req, res) => {
  try {
    const { email, password } = await loginSchema.validateAsync(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
      handler: user.handler,
      avatar: user.avatar || null,
      about: user.about || null,
      banner: user.banner,
      avatarPublicId: user.avatarPublicId,
      bannerPublicId: user.bannerPublicId,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ token, user: payload });
  } catch (error) {
    if (error.isJoi) {
      console.error("Joi error:", error.details[0].message);
      return res.status(400).json({ message: error.details[0].message });
    }
    console.error("Error logging in the user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const register = async (req, res, next) => {
  try {
    const { email, password, username, handler } =
      await registerSchema.validateAsync(req.body);

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        handler,
      },
    });

    res.status(201).json({ success: true });
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json({ message: error.details[0].message });
    }
    console.error("Error registering the user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        handler: true,
        about: true,
        banner: true,
      },
    });
    res.json(user);
  } catch (err) {
    console.error("Error getting user info:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
