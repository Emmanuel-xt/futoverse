"use client";
import Modal from "@components/modals/Modal";
import { useCart } from "@components/providers/CartProvider";
import { generateProfileLink } from "@constants/functions";
import { deleteProduct, fetchProductById } from "@lib/actions/product.prisma";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { HiDotsVertical } from "react-icons/hi";
import { toast } from "sonner";

const products = [
  {
    id: "1",
    name: "Product Name",
    description: "Product Full Description",
    price: "$20.00",
    image: "/assets/IceHomeImage1.jpg",
    relatedImages: [
      "/assets/IceHomeImage1.jpg",
      "/assets/IceHomeImage1.jpg",
      "/assets/IceHomeImage1.jpg",
      "/assets/IceHomeImage1.jpg",
    ],
  },
];

const ProductDynamicPage = ({ params }) => {
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addToCart } = useCart();
  const productId = params.id.replace(/%20/g, " ");
  const [deleteError, setdeleteError] = useState("");
  const [deleteLoading, setdeleteLoading] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const { data: session } = useSession();
  const userId = session?.user.id;

  const isProductMyOwn = product?.userId == userId;

  useEffect(() => {
    const fetchProduct = async () => {
      // setLoading(true)
      try {
        const fetchedProduct = await fetchProductById(productId);
        setProduct(fetchedProduct);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching is complete
      }
    };
    fetchProduct();
  }, [productId]);
  console.log("PrOdUct ", product);

  const handleAddToCart = (item) => {
    // console.log("item", item);
    console.log("product.shopId", product);
    addToCart(product.shopId, item);
    toast("Items added to cart ✅");
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeleteProduct = async () => {
    setdeleteError("");
    setdeleteLoading(true);
    try {
      const success = await deleteProduct(productId);
      if (success) {
        router.back();
      }
      setdeleteError(
        "There was a problem Deletinng this Product , Please try Again"
      );
    } catch (error) {
      console.log("Error deleting product", error);
    } finally {
      setdeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-500">Loading Product with details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-red-500">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center mb-10">
      <div className="w-full p-4 flex items-center">
        <AiOutlineArrowLeft
          className="text-2xl cursor-pointer"
          onClick={() => router.back()}
        />
      </div>

      <div className="flex fixed top-5 right-5 z-50 ">
        <HiDotsVertical
          className="rounded-full text-3xl text-black cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
        />

        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute right-5 top-3 mt-2 w-52 bg-white shadow-md rounded-md "
          >
            {isProductMyOwn && (
              <>
                <Link
                  href={`${params.id}/edit`}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Edit Product
                </Link>
                <button
                  onClick={() => setOpenDeleteModal(true)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Delete Product
                </button>
              </>
            )}
            <button
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
              onClick={() => generateProfileLink()}
            >
              Share Product
            </button>
            <Link
              href={`/shops/${product.shop.name}`}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              View Vendor's Store
            </Link>
            <button className="block px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-left">
              Flag Product
            </button>
          </div>
        )}
      </div>
      {/* recent changes */}
      <div className="w-full flex justify-center bg-gray-100 p-6 relative h-[40vh] ">
        <Image
          src={product.image}
          alt={product.name}
          // layout="fill" /* Makes the image take full width & height */
          objectFit="contain" /* Ensures the image covers the entire space */
          className=""
        />
      </div>

      <div className="p-4 w-full">
        <h2 className="text-lg font-semibold capitalize">{product.name}</h2>

        <div className="flex flex-col gap-1 mt-3">
          <h2 className="text-lg font-semibold capitalize">
            product Description
          </h2>
          <p className="text-gray-600 text-sm break-words whitespace-pre-wrap">
            {product?.description}
          </p>
        </div>
      </div>
      <div className="flex gap-3 px-1">
        <div
          className={`flex-1 min-w-[190pxpx] flex flex-col gap-2 border-l-[3px] rounded bg-slate-100 px-5 py-4 border-primary border-1 `}
        >
          <div className="flex gap-3">
            <p className="text-base text-black-100">Price</p>
            <Image
              src={"/assets/price-tag.svg"}
              alt={"price tag"}
              width={16}
              height={16}
            />{" "}
          </div>
          <div className="flex gap-1">
            <p className="text-2xl font-bold text-secondary">
              ₦{product.price}
            </p>
          </div>
        </div>

        <div
          className={`flex-1 min-w-[180px] flex flex-col gap-2 border-l-[3px] rounded bg-slate-100 px-5 py-4 border-primary border-1 `}
        >
          <div className="flex gap-3">
            <p className="text-base text-black-100">Quantity</p>
            <Image
              src={"/assets/price-tag.svg"}
              alt={"price tag"}
              width={16}
              height={16}
            />{" "}
          </div>
          <div className="flex gap-1">
            <p className="text-2xl font-bold text-secondary">
              {product.quantity}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 w-full">
        <div className="flex justify-center w-full space-x-4 mt-2">
          <button
            className="border border-blue-700 text-blue-700 px-4 py-2 rounded-lg w-full"
            onClick={() => handleAddToCart(product)}
          >
            Add to Cart
          </button>
          <Link
            className="bg-blue-700 text-center text-white px-4 py-2 rounded-lg w-full"
            href={`/chat?receiverId=${product?.userId}`}
          >
            Buy Now
          </Link>
        </div>
      </div>

      {/* <div className="p-4 w-full">
        <div className="grid grid-cols-4 gap-2">
          {products.relatedImages?.map((img, index) => (
            <Image
              key={index}
              src={img}
              alt="related product"
              width={80}
              height={80}
              className="rounded-lg"
            />
          ))}
        </div>
      </div> */}

      {openDeleteModal && (
        <Modal
          open={openDeleteModal}
          onClose={() => setOpenDeleteModal(false)}
          width="350px"
          height="fit"
          className="border"
        >
          <div className=""></div>
          <h6 className="text-lg font-semibold text-center">Delete Product</h6>
          <div className="flex flex-col gap-4 items-center justify-center">
            <p className="text-sm text-slate-700 text-center">
              Are you sure you want to complete this action?
              <p className=" text-slate-700 text-center">
                This action cannot be undone
              </p>
            </p>
            {deleteError && (
              <p className="text-[10px] text-red-600">{deleteError}</p>
            )}
            <div className="flex gap-2 text-sm">
              <button
                onClick={() => handleDeleteProduct()}
                className="bg-blue-600 p-1 rounded-lg px-4"
              >
                {deleteLoading ? "Deleting.." : "Delete"}
              </button>
              <button
                className="bg-transparent border border-primary text-black p-1 rounded-lg px-4"
                onClick={() => setOpenLogOutModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProductDynamicPage;
