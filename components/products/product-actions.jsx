"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { useCart } from "@components/providers/CartProvider";
import { toast } from "sonner";
import {
  Heart,
  ShoppingCart,
  MessageCircle,
  Share2,
  MoreVertical,
  Edit,
  Trash2,
  Flag,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { DeleteProductDialog } from "./delete-product-dialog";

export function ProductActions({ product }) {
  const { data: session } = useSession();
  const { addToCart } = useCart();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isOwner = session?.user?.id === product.userId;

  const handleAddToCart = () => {
    if (product.shopId) {
      addToCart(product.shopId, product);
      toast.success("Product added to cart!");
    } else {
      toast.error("Unable to add to cart");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this product: ${product.name}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleAddToCart} className="flex-1" size="lg">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>

        <Button
          onClick={() => router.push(`/chat?receiverId=${product.userId}`)}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Contact Seller
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
          <Heart className="h-4 w-4 mr-2" />
          Save
        </Button>

        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwner && (
              <>
                <DropdownMenuItem
                  onClick={() => router.push(`/products/${product.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Product
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem>
              <Flag className="h-4 w-4 mr-2" />
              Report Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DeleteProductDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        productId={product.id}
        productName={product.name}
      />
    </div>
  );
}
