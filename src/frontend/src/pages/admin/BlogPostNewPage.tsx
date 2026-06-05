import BlogPostDialog from "@/components/admin/BlogPostDialog";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export default function BlogPostNewPage() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

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
      blogPost={null}
      onSuccess={() => navigate({ to: "/admin/blog" })}
    />
  );
}
