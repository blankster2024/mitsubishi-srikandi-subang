import { ErrorBoundary } from "@/components/ErrorBoundary";
import TestimonialDialog from "@/components/admin/TestimonialDialog";
import TestimonialList from "@/components/admin/TestimonialList";
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
import { useDeleteTestimonial } from "@/hooks/useTestimonials";
import type { Testimonial } from "@/types/local";
import { useState } from "react";

export default function TestimonialsPage() {
  const [hasError, setHasError] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] =
    useState<Testimonial | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] =
    useState<Testimonial | null>(null);

  const deleteTestimonial = useDeleteTestimonial();

  const handleAdd = () => {
    setHasError(false);
    setSelectedTestimonial(null);
    setDialogOpen(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setDialogOpen(true);
  };

  const handleDeleteClick = (testimonial: Testimonial) => {
    setTestimonialToDelete(testimonial);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!testimonialToDelete) return;
    deleteTestimonial.mutate(testimonialToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setTestimonialToDelete(null);
      },
    });
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedTestimonial(null);
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {hasError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Terjadi kesalahan saat memuat testimoni. Coba refresh halaman.
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Testimoni</h1>
          <p className="text-muted-foreground mt-1">
            Kelola testimoni pelanggan yang ditampilkan di halaman publik.
          </p>
        </div>

        <TestimonialList
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onError={() => setHasError(true)}
        />

        <TestimonialDialog
          isOpen={dialogOpen}
          onClose={handleDialogClose}
          testimonial={selectedTestimonial}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent data-ocid="testimonial.dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus testimoni dari &ldquo;
                {testimonialToDelete?.customerName}&rdquo;? Tindakan ini tidak
                dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-ocid="testimonial.cancel_button">
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-ocid="testimonial.confirm_button"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ErrorBoundary>
  );
}
