import "dotenv/config";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export default function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        handler: true,
        avatar: true,
        about: true,
        banner: true,
        avatarPublicId: true,
        bannerPublicId: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (err) {
      if (err.name === "TokenExpiredError") {
        console.error("TOKEN EXPIRATION", ERR);
        return res.status(401).json({ message: "Token expired" });
      }
      console.error("INVALID TOKEN", err);
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  });
}
