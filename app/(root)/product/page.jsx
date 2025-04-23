import Image from "next/image";
import { Star, MessageCircle, Flame, Tag, Search, ChevronDown, MapPin } from "lucide-react";

const products = [
  {
    id: 1,
    name: "Lexus ES 2019",
    price: "\u20a63,054,000",
    location: "Lagos, Ikeja",
    condition: "Brand New",
    rating: 5,
    isPopular: false,
    image: "/assets/IceHomeImage1.jpg"
  },
  {
    id: 2,
    name: "Rolls Royce Phantom",
    price: "\u20a6860,000",
    location: "Lagos, Ikeja",
    condition: "Used",
    rating: 5,
    isPopular: true,
    image: "/assets/IceHomeImage1.jpg"
  },
  {
    id: 3,
    name: "Mercedes-Benz C-Class AMG",
    price: "\u20a6350,000",
    location: "Lagos, Ikeja",
    condition: "Used",
    rating: 4,
    isPopular: true,
    image: "/assets/IceHomeImage1.jpg"
  },
  {
    id: 4,
    name: "Lamborghini Aventador SVJ",
    price: "\u20a6560,000",
    location: "Lagos, Ikeja",
    condition: "Used",
    rating: 4,
    isPopular: true,
    image: "/assets/IceHomeImage1.jpg"
  }
];

export default function ProductPage() {
  return (
    <div className="p-2 bg-white min-h-screen">
      <div className="flex items-center gap-2 border rounded-full px-4 py-2 mb-4">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search in Laptops & Computers"
          className="flex-1 outline-none"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto mb-4 whitespace-nowrap text-sm">
        <button className="border px-3 py-1 rounded-full flex items-center gap-1">
          All filters <ChevronDown size={14} />
        </button>
        <button className="border px-3 py-1 rounded-full flex items-center gap-1">
          Region <ChevronDown size={14} />
        </button>
        <button className="border px-3 py-1 rounded-full flex items-center gap-1">
          Price, \u20a6 <ChevronDown size={14} />
        </button>
        <button className="border px-3 py-1 rounded-full flex items-center gap-1">
          Type <ChevronDown size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {products.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-2 relative shadow-sm"
          >
            {item.isPopular && (
              <div className="absolute top-2 right-2 text-xs bg-white px-2 py-1 rounded-full border flex items-center gap-1 shadow">
                <Flame size={12} className="text-orange-500" />
                POPULAR
              </div>
            )}

            <Image
              src={item.image}
              alt={item.name}
              width={200}
              height={150}
              className="w-full h-32 object-cover rounded"
            />

            <div className="text-green-600 font-semibold mt-2">{item.price}</div>
            <div className="text-sm font-medium line-clamp-2">{item.name}</div>

            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <MapPin size={14} /> {item.location}
            </div>
            <div className="inline-block mt-1 text-xs border px-2 py-1 rounded-full bg-gray-100">
              {item.condition}
            </div>
          </div>
        ))}
      </div>

      <nav className="fixed bottom-0 left-0 w-full bg-white border-t grid grid-cols-5 text-xs text-center py-2">
        <div>Home</div>
        <div>Saved</div>
        <div>Sell</div>
        <div>Messages</div>
        <div>Profile</div>
      </nav>
    </div>
  );
}
