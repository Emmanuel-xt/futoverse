import { notFound } from "next/navigation";
// import { prisma } from "@lib/prisma"
import { PostCard } from "@components/post/post-card";
import prisma from "@prisma/prisma";

export async function generateMetadata({ params }) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      creator: {
        select: {
          name: true,
          username: true,
          picture: true,
        },
      },
      media: {
        select: {
          url: true,
          type: true,
        },
        orderBy: {
          id: "asc",
        },
      },
    },
  });

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  // console.log("Post", post);

  const title =
    post.title || `Post by ${post.creator.name || post.creator.username}`;
  const description = post.content.slice(0, 160);

  // Select first image URL if available (and is image type)
  const ogImage = post.media?.find((m) => m.type.startsWith("image"))?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      authors: [post.creator.name || post.creator.username],
      images: ogImage
        ? [
            {
              url: ogImage,
              alt: title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function PostPage({ params }) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          name: true,
          picture: true,
        },
      },
      media: {
        select: {
          id: true,
          url: true,
          type: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
          views: true,
        },
      },
    },
  });

  if (!post || !post.isApproved) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <PostCard post={post} userId={1} />
    </div>
  );
}
