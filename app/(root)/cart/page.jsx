"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AiFillDelete } from "react-icons/ai";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { MdDeleteForever, MdRemove } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { TiTick } from "react-icons/ti";
import { createOrder } from "@lib/actions/shops.prisma";
import { useSession } from "next-auth/react";
import socket from "@components/socket/Socket";
import { toast } from "sonner";
import { useCart } from "@components/providers/CartProvider";
import { rejectOrder } from "@lib/actions/order.prisma";

const CartPage = () => {
  const { cart, removeFromCart, clearShopCart, addToCart } = useCart();

  const { data: session } = useSession();
  const userId = parseFloat(session?.user.id);
  const [activeTab, setActiveTab] = useState("cart");

  useEffect(() => {
    console.log("cart-===", cart);
  }, [cart]);

  // useEffect(() => {
  //   const pendingOrders = shop.orders.filter(
  //     (order) => order.status === "Pending"
  //   ); // Filter only pending orders
  //   setOrders(pendingOrders);
  //   socket.on("new_order", (orderData) => {
  //     toast("A new order was placed ");

  //     setOrders((prevOrders) => [...prevOrders, orderData]);
  //   });
  // }, []);
  // console.log("orders", orders);

  const handleRequestClick = async (shopId, shopName) => {
    console.log("User A requests items from shop:", shopId);
    const items = cart[shopId].map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));
    const orderData = {
      orderId: `order_${Date.now()}`, // Generate a unique order ID
      totalAmount: parseFloat(calculateTotal(cart[shopId])), // Calculate the total from the cart
      orderDate: new Date(),
      status: "Pending", // Initial status
      userId: userId, // Add userId here
      shopId: shopName, // Include shopId as well
      items: { create: items },
    };

    try {
      const order = await createOrder(orderData); // Call the backend function to create an order
      console.log("Order created successfully!", order);
      toast("Order placed succesfully");
      socket.emit("place_order", {
        ...order, // Use the actual saved order data
        orderId: order.id, // Ensure the ID matches what the database generated
        items: items,
      });
    } catch (error) {
      console.error("Error creating order:", error);
      toast("something went wrong placing order");
    }
  };

  const handleRejectClick = async (orderId) => {
    const rejected = await rejectOrder(orderId, "Items not available");
    console.log("rejected", rejected);
  };

  const calculateTotal = (shopItems) => {
    return shopItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const calculateOrderTotal = (items) => {
    return items
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  // ]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const increaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  // const removeItem = (id) => {
  //   setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  // };

  // const subtotal = cart.reduce(
  //   (acc, item) => acc + item.price * item.quantity,
  //   0
  // );
  // const shipping = 2280;
  // const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 mb-10">
      <div className="flex w-full justify-around mb-4 border-b">
        <button
          className={`p-2 ${
            activeTab === "cart" ? "border-b-2 w-[150px] border-blue-500" : ""
          }`}
          onClick={() => handleTabChange("cart")}
        >
          Cart
        </button>
        <button
          className={`p-2 ${
            activeTab === "requests"
              ? "border-b-2 w-[150px] border-blue-500"
              : ""
          }`}
          onClick={() => handleTabChange("requests")}
        >
          Requests
        </button>
      </div>

      {/* {activeTab === "requests" && (
        <div className="w-full">
          {requests.map((request) => (
            <div
              key={request.id}
              className="p-2 border bg-white mb-2 rounded-lg flex items-center justify-between w-full"
            >
              <div className="flex w-full">
                <Image
                  src={request.image}
                  alt={request.name}
                  width={100}
                  height={100}
                  className="w-20 h-20 mr-4 rounded"
                />
                <div className="w-full flex flex-col gap-1">
                  <div className="flex justify-between">
                    <div className=" ">
                      <h3 className="font-semibold">
                        {request.name.length > 50
                          ? request.name.substring(0, 25) + "..."
                          : request.name}
                      </h3>
                      <p className="text-sm text-slate-700">
                        {request.description.length > 50
                          ? request.description.substring(0, 50) + "..."
                          : request.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex  items-center justify-between">
                    <p className="font-bold">₦{"155,000"}</p>
                    <p className="mx-2">x{request.quantity}</p>
                    <div className="">
                      <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2">
                        Accept
                      </button>
                      <button className=" text-black border border-black  px-2 py-1 rounded">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )} */}

      {activeTab === "cart" && (
        <div className="w-full">
          {Object.keys(cart).length === 0 && <p>The cart is empty</p>}

          {Object.entries(cart).map(([shopId, shopItems]) => (
            <div key={shopId} className="flex flex-col  rounded py-4 text-sm">
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold">
                  {shopItems[0].shop.name}
                </h3>
                <button
                  className="mt-2 bg-red-700 text-white text-xl rounded p-1"
                  onClick={() => clearShopCart(shopId)}
                >
                  <MdDeleteForever />
                </button>
              </div>

              {shopItems?.map((item) => (
                <div
                  key={item.id}
                  className="p-2 border bg-white mb-2 rounded-lg flex items-center justify-between w-full"
                >
                  <div className="flex w-full">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={100}
                      height={100}
                      className="w-20 h-20 mr-4 rounded"
                    />
                    <div className="w-full flex flex-col gap-1">
                      <div className="flex justify-between">
                        <div className=" ">
                          <h3 className="font-semibold">
                            {item.name.length > 50
                              ? item.name.substring(0, 25) + "..."
                              : item.name}
                          </h3>
                          <p className="text-sm text-slate-700">
                            {item.description.length > 50
                              ? item.description.substring(0, 50) + "..."
                              : item.description}
                          </p>
                        </div>
                        <button
                          // onClick={() => removeItem(item.id)}
                          className="text-red-500 text-xl order-1"
                        >
                          <AiFillDelete />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="font-bold">₦{item.price}</p>

                        <div className="flex items-center">
                          <button
                            onClick={() => removeFromCart(shopId, item.id)} // Decrease quantity
                            className="bg-gray-300 px-1  rounded"
                          >
                            <FaMinus />
                          </button>
                          <span className="mx-2">{item.quantity}</span>
                          <button
                            onClick={() => addToCart(shopId, item)} // Increase quantity
                            className="bg-gray-300 px-1 rounded"
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="p-4 ">
                <div className="flex justify-between font-bold">
                  <p>Total:</p>
                  <p className="font-bold">#{calculateTotal(shopItems)}</p>
                </div>
                <button
                  className="bg-blue-500 text-white w-full py-2 rounded-xl mt-2"
                  onClick={() =>
                    handleRequestClick(shopId, shopItems[0].shop.name)
                  }
                >
                  Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CartPage;
