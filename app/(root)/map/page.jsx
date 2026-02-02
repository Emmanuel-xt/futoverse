"use client";

import CesiumMapBWrapper from "@components/cesium/CesiumWrapper";
import { CesiumViewerProvider } from "@components/providers/CesiumViewerProvider";
import React from "react";

// Never cache map - always render fresh
export const dynamic = "force-dynamic";

const page = () => {
  return (
    <CesiumViewerProvider>
      <CesiumMapBWrapper />
    </CesiumViewerProvider>
  );
};

export default page;
