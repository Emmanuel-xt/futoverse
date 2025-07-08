import { Wrench, Clock, RefreshCw } from "lucide-react";

export default function MapMaintenance() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 text-gray-800">
      <div className="max-w-md text-center px-6 py-10 bg-white shadow-2xl rounded-2xl border border-gray-100">
        <div className="flex justify-center mb-6 text-blue-600">
          <Wrench className="w-14 h-14 animate-pulse" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Map is Under Maintenance</h1>
        <p className="text-gray-600 mb-6 text-sm">
          We're currently upgrading the 3D Map to serve you better. Please check
          back soon.
        </p>

        <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          {/* <span>Estimated Downtime: ~2Da</span> */}
        </div>

        {/* <div className="mt-8">
          <button
            onClick={() => location.back()}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-200"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
            Alright
          </button>
        </div> */}
      </div>
    </div>
  );
}
