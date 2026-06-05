import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteBlogPost, useGetAllBlogPosts } from "@/hooks/useBlogPosts";
import type { BlogPost } from "@/types/local";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface BlogPostListProps {
  onEdit: (blogPost: BlogPost) => void;
}

export default function BlogPostList({ onEdit }: BlogPostListProps) {
  const { data: blogPosts, isLoading } = useGetAllBlogPosts();
  const deleteBlogPost = useDeleteBlogPost();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);

  const handleDeleteClick = (post: BlogPost) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (postToDelete) {
      deleteBlogPost.mutate(postToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setPostToDelete(null);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!blogPosts || blogPosts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Belum ada artikel. Klik tombol "Tambah Artikel" untuk menambahkan.
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Judul</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blogPosts.map((post) => (
            <TableRow key={post.id.toString()}>
              <TableCell className="font-medium">{post.title}</TableCell>
              <TableCell>
                {new Date(Number(post.createdAt) / 1000000).toLocaleDateString(
                  "id-ID",
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {post.published ? "Dipublikasi" : "Draft"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(post)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(post)}
                    disabled={deleteBlogPost.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus artikel "{postToDelete?.title}"?
              <br />
              <br />
              <strong>Peringatan:</strong> Menghapus artikel ini juga akan
              menghapus semua komentar terkait.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
