import CesiumMapBWrapper from "@components/cesium/CesiumWrapper";
import { CesiumViewerProvider } from "@components/providers/CesiumViewerProvider";
import React from "react";

const page = () => {
  return (
    <CesiumViewerProvider>
      <CesiumMapBWrapper />
    </CesiumViewerProvider>
  );
};

export default page;
