import { CiLocationOn } from "react-icons/ci";

export default function ShopInfoTab({ shop }) {
  return (
    <div className="p-4 space-y-6">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-3">Shop Information</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Description
            </label>
            <p className="text-gray-800">
              {shop.description || "No description available"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Category
            </label>
            <p className="text-gray-800">{shop.category || "Uncategorized"}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Location
            </label>
            <div className="flex items-center gap-1 text-gray-800">
              <CiLocationOn className="w-4 h-4" />
              <span>{shop.locationDesc || "Location not specified"}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Status</label>
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                shop.isOpen
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {shop.isOpen ? "Open" : "Closed"}
            </span>
          </div>

          {shop.rating && (
            <div>
              <label className="text-sm font-medium text-gray-600">
                Rating
              </label>
              <p className="text-gray-800">
                {shop.rating}/5 ({shop.reviewCount || 0} reviews)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
