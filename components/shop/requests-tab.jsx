"use client";

import Image from "next/image";

export default function RequestsTab({ orders }) {
  const handleAcceptOrder = async (orderId) => {
    // Implement accept order logic
    console.log("Accepting order:", orderId);
  };

  const handleRejectOrder = async (orderId) => {
    // Implement reject order logic
    console.log("Rejecting order:", orderId);
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="h-20 text-slate-300 flex flex-col items-center justify-center">
        <p>You Don&apos;t have any Pending Orders</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <div className="w-full">
        {orders.map((order) => (
          <div key={order.id} className="mb-4">
            <p className="text-slate-600 font-semibold px-2 text-lg">
              {order.user.username}
            </p>

            <div className="p-2 border mb-2 rounded-lg flex flex-col gap-1 items-center justify-between w-full">
              {order.items.map((item, i) => (
                <div className="flex w-full bg-white p-2 rounded" key={i}>
                  <Image
                    src={item.image || "/assets/IceHomeImage1.jpg"}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 mr-4 rounded object-cover"
                  />
                  <div className="w-full flex flex-col gap-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {item.name.length > 25
                            ? item.name.substring(0, 25) + "..."
                            : item.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="font-bold">₦{item.price.toFixed(2)}</p>
                      <p className="mx-2">x{item.quantity}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptOrder(order.id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectOrder(order.id)}
                          className="text-black border border-black px-3 py-1 rounded text-sm hover:bg-gray-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
