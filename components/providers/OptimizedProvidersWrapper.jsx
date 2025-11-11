"use client";

import React, { Suspense } from "react";
import { TanStackQueryProvider } from "@components/providers/TanstackQueryProvider";
import { CartProvider } from "@components/providers/CartProvider";

// These providers are always needed
export function CoreProviders({ children }) {
  return (
    <TanStackQueryProvider>
      <CartProvider>{children}</CartProvider>
    </TanStackQueryProvider>
  );
}

// These providers are lazy-loaded (only on specific pages that need real-time features)
const SocketProvider = React.lazy(() =>
  import("@components/providers/SocketProvider").then((mod) => ({
    default: mod.SocketProvider,
  }))
);
const OnlineUsersProvider = React.lazy(() =>
  import("@components/providers/OnlineUsersProvider").then((mod) => ({
    default: mod.OnlineUsersProvider,
  }))
);
const OnlineShopsProvider = React.lazy(() =>
  import("@components/providers/OnlineShopsProvider").then((mod) => ({
    default: mod.OnlineShopsProvider,
  }))
);

export function RealtimeProviders({ children }) {
  return (
    <Suspense fallback={children}>
      <SocketProvider>
        <OnlineUsersProvider>
          <OnlineShopsProvider>{children}</OnlineShopsProvider>
        </OnlineUsersProvider>
      </SocketProvider>
    </Suspense>
  );
}
