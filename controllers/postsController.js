import { PrismaClient } from "@prisma/client";
import fileSizeLimit from "../middleware/fileSizeLimit.js";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const storage = multer.memoryStorage();

const upload = multer({ storage });

const prisma = new PrismaClient();

export const getHomePosts = async (req, res) => {
  const { page = 1, limit = 20, userId } = req.query;
  const skip = (page - 1) * limit;

  try {
    const posts = await prisma.post.findMany({
      where: {
        parentId: null,
        authorId: userId ? userId : undefined, //User filter for profile posts
      },
      orderBy: {
        createdAt: "desc",
      },
      take: Number(limit),
      skip,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            handler: true,
          },
        },
        media: true,
        _count: {
          select: {
            likes: true,
            replies: true,
            reposts: true,
            bookmarks: true,
          },
        },
        likes: {
          where: {
            userId: req.user.id,
          },
          select: {
            userId: true,
          },
        },
        reposts: {
          where: {
            userId: req.user.id,
          },
          select: {
            userId: true,
          },
        },
        bookmarks: {
          where: {
            userId: req.user.id,
          },
          select: {
            userId: true,
          },
        },
      },
    });

    const total = await prisma.post.count({ where: { parentId: null } });

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    console.error("Error getting home posts", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createPost = [
  upload.single("image"),
  fileSizeLimit,

  async (req, res) => {
    const { content } = req.body;
    const authorId = req.user.id;

    if (!content && !req.file) {
      return res.status(400).json({ message: "Content or image required" });
    }

    let media, mediaPublicId;
    if (req.file) {
      try {
        const fileStr = `data:${
          req.file.mimetype
        };base64,${req.file.buffer.toString("base64")}`;

        const result = await cloudinary.uploader.upload(fileStr, {
          folder: "social_media",
        });

        media = result.secure_url;
        mediaPublicId = result.public_id;
      } catch (uploadError) {
        console.error("Error uploading image to Cloudinary:", uploadError);
        return res.status(500).json({ message: "Failed to upload image" });
      }
    }

    try {
      const post = await prisma.post.create({
        data: {
          content,
          media: media
            ? {
                create: {
                  url: media,
                  type: "IMAGE",
                  urlPublicId: mediaPublicId,
                },
              }
            : undefined,
          author: { connect: { id: authorId } },
        },
        include: {
          author: true,
          media: true,
        },
      });

      res.status(201).json(post);
    } catch (err) {
      console.error("Error creating post", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
];

export const likePost = async (req, res, next) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    await prisma.$transaction(async (prisma) => {
      const like = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId: userId,
            postId: postId,
          },
        },
      });

      if (like) {
        await prisma.like.delete({
          where: {
            userId_postId: {
              userId: userId,
              postId: postId,
            },
          },
        });
      } else {
        await prisma.like.create({
          data: {
            userId: userId,
            postId: postId,
          },
        });
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error handling like interaction:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const bookmarkPost = async (req, res, next) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    await prisma.$transaction(async (prisma) => {
      const bookmark = await prisma.bookmark.findUnique({
        where: {
          userId_postId: {
            userId: userId,
            postId: postId,
          },
        },
      });

      if (bookmark) {
        await prisma.bookmark.delete({
          where: {
            userId_postId: {
              userId: userId,
              postId: postId,
            },
          },
        });
      } else {
        await prisma.bookmark.create({
          data: {
            userId: userId,
            postId: postId,
          },
        });
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error handling bookmark interaction:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const repostPost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    await prisma.$transaction(async (prisma) => {
      const repost = await prisma.repost.findUnique({
        where: {
          userId_postId: {
            userId: userId,
            postId: postId,
          },
        },
      });

      if (repost) {
        await prisma.repost.delete({
          where: {
            id: repost.id,
          },
        });
      } else {
        await prisma.repost.create({
          data: {
            userId: userId,
            postId: postId,
          },
        });
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error handling repost interaction:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        authorId: req.user.id,
      },
      include: {
        media: true,
      },
    });

    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found or user does not own the post" });
    }

    if (post.media && post.media.length > 0) {
      await cloudinary.uploader.destroy(post.media[0].urlPublicId);
    }

    await prisma.post.delete({ where: { id: postId } });

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
