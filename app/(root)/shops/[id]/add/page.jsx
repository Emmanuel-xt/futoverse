"use client";
import BackNav from "@components/BackNav";
import {
  addShopItemsToShopId,
  fetchShopandItsUserId,
} from "@lib/actions/shops.prisma";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCamera } from "react-icons/fa6";

const AddProductPage = ({ params }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const userId = parseFloat(session?.user.id);

  const shopId = params.id.replace(/%20/g, " ");
  const [shop, setShop] = useState({});

  const [wasNewImageUploaded, setWasNewImageUploaded] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    image: "",
    description: "",
    quantity: "",
    price: "",
    category: "",
  });

  useEffect(() => {
    const fetchTheStore = async () => {
      const fetchedStore = await fetchShopandItsUserId(shopId);
      setShop(fetchedStore);
    };
    fetchTheStore();
  }, [shopId]);
  // console.log("Params id =", shopId);
  // console.log("SHop =", shop);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // only numbers are allowed for quantity and price fields but decimal is allowed
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    if (/^\d*\.?\d*$/.test(value)) {
      setProduct((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    // console.log("Product form", product);

    // console.log("Submitting data:", dataToSubmit);
    try {
      const result = await addShopItemsToShopId(shopId, product, userId);
      // console.log("items added successfully" , result)
      if (result.success) {
        router.back();
      }
    } catch (error) {
      // console.error("Error submmiting data :", error);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (event, formId) => {
    const file = event.target.files[0];
    if (file && file instanceof Blob) {
      // const formData = new FormData();
      // formData.append("file", file);
      // // formData.append("upload_preset", "your_preset");

      try {
        const base = await convertToBase64(file);
        // console.log("base =", base);

        const response = await fetch("/api/cloudinary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: base }),
        });
        const data = await response.json();
        setProduct((prev) => ({
          ...prev,
          image: data.url,
        }));
      } catch (error) {
        // console.error("Error uploading image:", error);
      }
    } else {
      // console.log("no form data");
    }
  };

  if (shop.userId != session.user.id) {
    return (
      <p className="text-2xl">
        Are you sure you are the owner of the shop you want to add Product to ,
        We found out what you were trying to do , and we strongly advise you
        dont try it again
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-4">
      <div className="w-full flex items-center mb-4">
        <BackNav />
      </div>

      <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded-3xl cursor-pointer mb-4 relative">
        {/* <div className="mt-6"> */}
        {/* <div className="flex justify-center items-center cursor-pointer"> */}
        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="file-input"
        />

        {/* Camera icon button to trigger file input */}
        <label htmlFor="file-input" className="absolute cursor-pointer">
          <FaCamera className="text-3xl text-gray-600" />
        </label>

        {/* Display the selected image */}
        {product.image && (
          <Image
            src={product.image}
            alt="Profile_image"
            layout="fill"
            className="w-full h-full object-cover"
          />
        )}
        {/* </div> */}
        {/* </div> */}
      </div>

      <input
        type="text"
        name="name"
        value={product.name}
        onChange={handleChange}
        placeholder="Name of Product"
        className="w-full p-2 border rounded mb-2"
      />
      <textarea
        name="description"
        value={product.description}
        onChange={handleChange}
        placeholder="Description"
        className="w-full p-2 border rounded mb-2"
      ></textarea>
      <input
        type="number"
        name="quantity"
        value={product.quantity}
        onChange={handleNumberChange}
        placeholder="Quantity in stock"
        className="w-full p-2 border rounded mb-2"
      />
      <input
        type="text"
        name="price"
        value={product.price}
        onChange={handleNumberChange}
        placeholder="#Price"
        className="w-full p-2 border rounded mb-2"
      />
      <input
        type="text"
        name="category"
        value={product.category}
        onChange={handleChange}
        placeholder="Category"
        className="w-full p-2 border rounded mb-4"
      />

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleSubmit}
      >
        Upload Product
      </button>
    </div>
  );
};

export default AddProductPage;
