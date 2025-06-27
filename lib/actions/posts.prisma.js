"use server";
// The contents of this file is not yet usefull

import prisma from "@prisma/prisma";

export async function createPost(authorId, form) {
  const { text, media } = form;
  try {
    // Create the post and associate it with the user
    const newPost = await prisma.post.create({
      data: {
        authorId: authorId,
        text: text,
        media: media,
      },
    });

    console.log("Post created successfully:", newPost);
    return newPost;
  } catch (error) {
    console.error("Error creating post:", error);
    throw new Error("Failed to create post");
  }
}

export const fetALlPost = async () => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true,
            username: true,
            picture: true,
          },
        },
      },
    });
    console.log("all posts were fetched");
    return posts;
  } catch (error) {
    console.log("Error fetching all posts ", error);
  }
};

export const fetchPostById = async (authorId) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        authorId: authorId,
      },
      include: {
        author: {
          select: {
            name: true,
            username: true,
            picture: true,
          },
        },
      },
    });
    console.log(
      "all posts were fetched of user",
      authorId,
      "were fetched",
      posts
    );
    return posts;
  } catch (error) {
    console.log("Error fetching all posts ", error);
  }
};

async function createComment({ text, postId, authorId, parentCommentId }) {
  try {
    const newComment = await prisma.comment.create({
      data: {
        text,
        postId,
        authorId,
        parentCommentId, // this links the comment to a parent if it's a reply
      },
    });
    console.log("Comment created successfully:", newComment);
    return newComment;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw new Error("Failed to create comment");
  }
}

export async function addCommentToPost({ postId, text, authorId, parentId }) {
  try {
    console.log("com", {
      postId,
      text,
      authorId,
      parentId,
    });
    // Create a new comment in the database
    const newComment = await prisma.comment.create({
      data: {
        text: text,
        postId: postId,
        authorId: authorId,
        parentCommentId: parentId || null, // Will be null for top-level comments
      },
    });

    console.log("Comment added successfully:", newComment);
    return {
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    return {
      success: false,
      message: "Failed to add comment",
      error: error.message,
    };
  }
}

export const fetchCommentsForPost = async (postId) => {
  console.log(`post with id ${postId} are being fetched ...`);

  try {
    const comments = await prisma.comment.findMany({
      where: {
        postId: postId,
      },
      include: {
        author: {
          select: {
            picture: true,
            name: true,
            username: true,
          },
        },
      },
    });

    console.log("comments fetched", comments);
    return comments;
  } catch (error) {
    console.log("error fetching post comments", error);
  }
};

// /scripts/migrateAuthorId.ts

export async function migrateAuthorId() {
  console.log("Starting migration of authorId in posts...");
  const posts = await prisma.post.findMany({
    select: { id: true, authorId: true }, // authorId contains username for now
  });

  let updated = 0;

  for (const post of posts) {
    const user = await prisma.user.findUnique({
      where: { username: post.authorId },
    });

    if (user) {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          authorId: user.id, // now an Int
        },
      });

      updated++;
    }
  }

  return { message: `Updated ${updated} posts.` };
}
