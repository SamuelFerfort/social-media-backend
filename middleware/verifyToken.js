import "dotenv/config";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    console.warn("Authorization header missing");
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const tokenParts = authHeader.split(" ");

  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
    console.warn("Malformed authorization header");
    return res.status(401).json({ message: "Malformed authorization header" });
  }

  const token = tokenParts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      console.warn("Invalid token payload");
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      console.warn(`User not found for ID: ${decoded.id}`);
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export default verifyToken;
