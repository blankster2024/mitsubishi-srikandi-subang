import { Badge } from "@/components/ui/badge";
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
import { useGetAllTestimonials } from "@/hooks/useTestimonials";
import type { Testimonial } from "@/types/local";
import { Pencil, Plus, Trash2 } from "lucide-react";

interface TestimonialListProps {
  onAdd: () => void;
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (testimonial: Testimonial) => void;
  onError?: () => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-sm" aria-label={`${rating} dari 5 bintang`}>
      {([1, 2, 3, 4, 5] as const).map((star) => (
        <span
          key={star}
          className={star <= rating ? "text-yellow-400" : "text-gray-300"}
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-gray-500 text-xs">{rating}/5</span>
    </span>
  );
}

export default function TestimonialList({
  onAdd,
  onEdit,
  onDelete,
  onError,
}: TestimonialListProps) {
  const { data: testimonials, isLoading, isError } = useGetAllTestimonials();

  // Notify parent of error so it can display a safe error banner
  if (isError && onError) {
    onError();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">
          Daftar Testimoni
        </h2>
        <Button onClick={onAdd} data-ocid="testimonial.open_modal_button">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Testimoni
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {(["a", "b", "c", "d"] as const).map((k) => (
            <Skeleton key={k} className="h-14 w-full rounded" />
          ))}
        </div>
      ) : !testimonials || testimonials.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20"
          data-ocid="testimonial.empty_state"
        >
          Belum ada testimoni. Klik &ldquo;Tambah Testimoni&rdquo; untuk
          menambahkan.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nama Pelanggan</TableHead>
                <TableHead>Kota</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Kendaraan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.map((testimonial, idx) => (
                <TableRow
                  key={testimonial.id.toString()}
                  data-ocid={`testimonial.item.${idx + 1}`}
                >
                  <TableCell className="font-medium">
                    {testimonial.customerName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {testimonial.customerCity || "—"}
                  </TableCell>
                  <TableCell>
                    <StarRating rating={testimonial.rating} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                    {testimonial.vehicleName || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={testimonial.active ? "default" : "secondary"}
                    >
                      {testimonial.active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(testimonial)}
                        data-ocid={`testimonial.edit_button.${idx + 1}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(testimonial)}
                        data-ocid={`testimonial.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
