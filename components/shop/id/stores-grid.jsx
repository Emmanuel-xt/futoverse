"use client";

import StoreCard from "./store-card";

export default function StoresGrid({ stores, onStoreClick }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stores.map((store) => (
        <StoreCard
          key={store.id}
          store={store}
          onClick={() => onStoreClick(store.name)}
        />
      ))}
    </div>
  );
}
