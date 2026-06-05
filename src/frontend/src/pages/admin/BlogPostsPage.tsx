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
import { Badge } from "@/components/ui/badge";
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
import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

export default function BlogPostsPage() {
  const { data: posts = [], isLoading } = useGetAllBlogPosts();
  const deleteBlogPost = useDeleteBlogPost();
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const postToDelete = posts.find((p) => p.id === deleteId) ?? null;

  const totalCount = posts.length;
  const publishedCount = posts.filter((p) => p.published).length;
  const draftCount = posts.filter((p) => !p.published).length;

  const handleDeleteConfirm = () => {
    if (deleteId !== null) {
      deleteBlogPost.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const formatDate = (ns: bigint) =>
    new Date(Number(ns) / 1_000_000).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="space-y-6" data-ocid="blog_posts.page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Blog</h1>
        <Link
          to="/admin/blog/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#CC0000] text-white text-sm font-medium rounded-lg hover:bg-[#AA0000] transition-colors"
          data-ocid="blog_posts.add_button"
        >
          <span className="text-lg leading-none">+</span>
          Tambah Post Baru
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Post", value: totalCount, color: "text-gray-900" },
          {
            label: "Published",
            value: publishedCount,
            color: "text-green-600",
          },
          { label: "Draft", value: draftCount, color: "text-gray-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
          >
            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div
          className="text-center py-16 text-gray-400"
          data-ocid="blog_posts.empty_state"
        >
          Belum ada post blog.
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-16">Gambar</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Penulis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>
                  <Heart className="h-3.5 w-3.5 inline" />
                </TableHead>
                <TableHead>
                  <MessageCircle className="h-3.5 w-3.5 inline" />
                </TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post: BlogPost, idx) => (
                <TableRow
                  key={post.id.toString()}
                  data-ocid={`blog_posts.item.${idx + 1}`}
                >
                  {/* Thumbnail */}
                  <TableCell>
                    {post.coverImageId ? (
                      <img
                        src={post.coverImageId}
                        alt={post.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-300 text-xs">—</span>
                      </div>
                    )}
                  </TableCell>

                  {/* Judul */}
                  <TableCell className="max-w-[220px]">
                    <Link
                      to="/admin/blog/edit/$id"
                      params={{ id: post.id.toString() }}
                      className="font-medium text-gray-900 hover:text-[#CC0000] truncate block transition-colors"
                    >
                      {post.title}
                    </Link>
                  </TableCell>

                  {/* Kategori */}
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {post.category || "—"}
                    </span>
                  </TableCell>

                  {/* Penulis */}
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {post.author || "—"}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {post.published ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                        Terbit
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-gray-500">
                        Draft
                      </Badge>
                    )}
                  </TableCell>

                  {/* Tanggal */}
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {formatDate(post.createdAt)}
                    </span>
                  </TableCell>

                  {/* Like */}
                  <TableCell>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Heart className="h-3 h-3 text-rose-400" />
                      {Number(post.likeCount)}
                    </span>
                  </TableCell>

                  {/* Comment */}
                  <TableCell>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <MessageCircle className="h-3 w-3 text-blue-400" />
                      {Number(post.commentCount)}
                    </span>
                  </TableCell>

                  {/* Aksi */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to="/admin/blog/edit/$id"
                        params={{ id: post.id.toString() }}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                        data-ocid={`blog_posts.edit_button.${idx + 1}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteId(post.id)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                        data-ocid={`blog_posts.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent data-ocid="blog_posts.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus post "{postToDelete?.title}"?
              Tindakan ini akan menghapus semua komentar terkait dan tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteId(null)}
              data-ocid="blog_posts.cancel_button"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 text-white hover:bg-red-700"
              data-ocid="blog_posts.confirm_button"
            >
              {deleteBlogPost.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
