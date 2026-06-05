import BlogPostDialog from "@/components/admin/BlogPostDialog";
import { useGetAllBlogPosts } from "@/hooks/useBlogPosts";
import type { BlogPost } from "@/types/local";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";

export default function BlogPostEditPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const { data: allPosts } = useGetAllBlogPosts();
  const post: BlogPost | null =
    allPosts?.find((p) => String(p.id) === id) ?? null;
  const [open, setOpen] = useState(true);

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      navigate({ to: "/admin/blog" });
    }
  };

  return (
    <BlogPostDialog
      open={open}
      onOpenChange={handleClose}
      blogPost={post}
      onSuccess={() => navigate({ to: "/admin/blog" })}
    />
  );
}
