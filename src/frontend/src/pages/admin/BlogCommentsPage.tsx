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
import {
  useApproveBlogComment,
  useDeleteBlogComment,
  useGetAllBlogComments,
} from "@/hooks/useBlogComments";
import type { BlogComment } from "@/types/local";
import { useState } from "react";

type FilterType = "pending" | "approved" | "all";

export default function BlogCommentsPage() {
  const { data: comments = [], isLoading } = useGetAllBlogComments();
  const approveMutation = useApproveBlogComment();
  const deleteMutation = useDeleteBlogComment();

  const [filter, setFilter] = useState<FilterType>("pending");
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const pendingCount = comments.filter((c) => !c.approved).length;

  const filtered = comments.filter((c) => {
    if (filter === "pending") return !c.approved;
    if (filter === "approved") return c.approved;
    return true;
  });

  const commentToDelete = comments.find((c) => c.id === deleteId) ?? null;

  const formatDate = (ns: bigint) =>
    new Date(Number(ns) / 1_000_000).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const tabs: { label: string; value: FilterType }[] = [
    {
      label:
        pendingCount > 0
          ? `Menunggu Moderasi (${pendingCount})`
          : "Menunggu Moderasi",
      value: "pending",
    },
    { label: "Disetujui", value: "approved" },
    { label: "Semua", value: "all" },
  ];

  return (
    <div className="space-y-6" data-ocid="blog_comments.page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Komentar</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              filter === tab.value
                ? "bg-[#CC0000] text-white"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
            data-ocid={`blog_comments.filter.${tab.value}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-16 text-gray-400"
          data-ocid="blog_comments.empty_state"
        >
          Tidak ada komentar.
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Nama</TableHead>
                <TableHead>Komentar</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((comment: BlogComment, idx) => (
                <TableRow
                  key={comment.id.toString()}
                  data-ocid={`blog_comments.item.${idx + 1}`}
                >
                  {/* Nama + Email */}
                  <TableCell>
                    <p className="text-sm font-medium text-gray-900">
                      {comment.name}
                    </p>
                    <p className="text-xs text-gray-400">{comment.email}</p>
                  </TableCell>

                  {/* Komentar */}
                  <TableCell className="max-w-[280px]">
                    <p className="text-sm text-gray-600 truncate">
                      {comment.content.length > 100
                        ? `${comment.content.slice(0, 100)}…`
                        : comment.content}
                    </p>
                  </TableCell>

                  {/* Jenis */}
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {comment.parentId === null ? "Komentar" : "Balasan"}
                    </span>
                  </TableCell>

                  {/* Tanggal */}
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {comment.approved ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                        Disetujui
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
                        Menunggu
                      </Badge>
                    )}
                  </TableCell>

                  {/* Aksi */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!comment.approved && (
                        <button
                          type="button"
                          onClick={() => approveMutation.mutate(comment.id)}
                          disabled={approveMutation.isPending}
                          className="px-3 py-1 text-xs font-medium rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
                          data-ocid={`blog_comments.approve_button.${idx + 1}`}
                        >
                          Setujui
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteId(comment.id)}
                        className="px-3 py-1 text-xs font-medium rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        data-ocid={`blog_comments.delete_button.${idx + 1}`}
                      >
                        Hapus
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
        <AlertDialogContent data-ocid="blog_comments.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Komentar</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus komentar dari "
              {commentToDelete?.name}"? Tindakan ini juga akan menghapus semua
              balasan dan tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteId(null)}
              data-ocid="blog_comments.cancel_button"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId !== null) {
                  deleteMutation.mutate(deleteId, {
                    onSuccess: () => setDeleteId(null),
                  });
                }
              }}
              className="bg-red-600 text-white hover:bg-red-700"
              data-ocid="blog_comments.confirm_button"
            >
              {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
