import { PrismaClient } from "@prisma/client";
import fileSizeLimit from "../middleware/fileSizeLimit.js";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const storage = multer.memoryStorage();

const upload = multer({ storage });

const prisma = new PrismaClient();

export const editProfile = [
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  fileSizeLimit,
  async (req, res) => {
    const { username, about } = req.body;

    try {
      let avatarUrl, bannerUrl, avatarPublicId, bannerPublicId;

      if (req.files.avatar && req.files.avatar[0]) {
        const avatarFileStr = `data:${
          req.files.avatar[0].mimetype
        };base64,${req.files.avatar[0].buffer.toString("base64")}`;

        const result = await cloudinary.uploader.upload(avatarFileStr, {
          folder: "social_media_profile",
        });

        if (req.user.avatarPublicId) {
          await cloudinary.uploader.destroy(req.user.avatarPublicId);
        }

        avatarUrl = result.secure_url;
        avatarPublicId = result.public_id;
      }

      if (req.files.banner && req.files.banner[0]) {
        const bannerFileStr = `data:${
          req.files.banner[0].mimetype
        };base64,${req.files.banner[0].buffer.toString("base64")}`;

        const result = await cloudinary.uploader.upload(bannerFileStr, {
          folder: "social_media_profile",
        });

        if (req.user.bannerPublicId) {
          await cloudinary.uploader.destroy(req.user.bannerPublicId);
        }

        bannerUrl = result.secure_url;
        bannerPublicId = result.public_id;
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(username && username !== req.user.username ? { username } : {}),
          ...(about && about !== req.user.about ? { about } : {}),
          ...(avatarUrl ? { avatar: avatarUrl, avatarPublicId } : {}),
          ...(bannerUrl ? { banner: bannerUrl, bannerPublicId } : {}),
        },
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  },
];

export const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(notifications);
  } catch (err) {
    console.error("Error getting notifications", err);
    res.status(500).json({ message: "Failed to get notifications" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        NOT: { id: req.user.id },
      },
      select: {
        id: true,
        username: true,
        handler: true,
        avatar: true,
        followers: {
          where: {
            followerId: req.user.id,
          },
        },
      },
    });

    res.json(users);
  } catch (error) {
    console.error("Error getting all users:", error);
    res.status(500).json({ error: "Failed to get users" });
  }
};

export const toggleFollow = async (req, res) => {
  const { userId } = req.params;

  try {
    const isFollowing = await prisma.follows.findFirst({
      where: {
        followerId: req.user.id, // The authenticated user
        followingId: userId, // The target user
      },
    });

    if (isFollowing) {
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: req.user.id,
            followingId: userId,
          },
        },
      });

      await prisma.notification.deleteMany({
        where: {
          userId: userId,
          type: "FOLLOW",
          relatedUserId: req.user.id,
        },
      });
    } else {
      await prisma.follows.create({
        data: {
          followerId: req.user.id,
          followingId: userId,
        },
      });

      await prisma.notification.create({
        data: {
          userId: userId,
          type: "FOLLOW",
          content: `${req.user.username} followed you`,
          relatedUserId: req.user.id,
        },
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error toggling follow:", err);
    res.status(500).json({ error: "Failed to handle follow" });
  }
};
