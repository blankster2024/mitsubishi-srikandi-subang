import BlogPostDialog from "@/components/admin/BlogPostDialog";
import BlogPostList from "@/components/admin/BlogPostList";
import { Button } from "@/components/ui/button";
import type { BlogPost } from "@/types/local";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function BlogPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const queryClient = useQueryClient();

  const handleAdd = () => {
    setSelectedPost(null);
    setDialogOpen(true);
  };

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    console.log("[BlogPage] Invalidating blogPosts cache");
    queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Artikel Blog</h1>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Artikel
        </Button>
      </div>

      <BlogPostList onEdit={handleEdit} />

      <BlogPostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        blogPost={selectedPost}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
