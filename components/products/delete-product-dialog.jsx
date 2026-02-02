"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@components/ui/alert-dialog";
import { deleteProduct } from "@lib/actions/product.prisma";

export function DeleteProductDialog({
  open,
  onOpenChange,
  productId,
  productName,
  userId,
  onDeleteSuccess,
  redirectPath = "/products",
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteProduct(productId, userId);

      if (!result.success) {
        throw new Error(result.error || "Failed to delete product");
      }

      toast.success("Product deleted successfully");
      onOpenChange(false);

      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        router.push(redirectPath);
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setError("Failed to delete product. Please try again.");
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (!isDeleting) {
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle
                className="h-6 w-6 text-red-600"
                aria-hidden="true"
              />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-left">
                Delete Product
              </AlertDialogTitle>
            </div>
          </div>

          <AlertDialogDescription className="text-left pt-2">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">"{productName}"</span>
            ?
            <br />
            <br />
            This action cannot be undone. The product will be permanently
            removed from your store and will no longer be visible to customers.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel
            onClick={handleCancel}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Product
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
