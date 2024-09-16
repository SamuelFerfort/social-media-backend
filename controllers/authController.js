import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import Joi from "joi";

const prisma = new PrismaClient();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  username: Joi.string().required().max(15),
  handler: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const login = async (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Email does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Wrong Password" });

    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
      handler: user.handler,
      avatar: user.avatar || null,
      about: user.about || null,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ token });
  } catch (err) {
    console.error("Error logging in the user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const register = async (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  const { email, password, username, handler } = req.body;

  if (error) return res.status(400).json({ message: error.details[0].message });

  const emailExists = await prisma.user.findUnique({ where: { email } });
  if (emailExists)
    return res.status(400).json({ message: "Email already in use" });

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Error registering the user:", err);
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
      },
    });
    res.json(user);
  } catch (err) {
    console.error("Error getting user info:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
