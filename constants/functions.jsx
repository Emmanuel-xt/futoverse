import React, { useEffect, useState } from "react";
import {
  Viewer,
  Cartesian3,
  Rectangle,
  Color,
  ColorMaterialProperty,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
  Terrain,
  HeightReference,
  Ion,
  JulianDate,
  Model, // Import the Model class
  Cesium3DTileset,
  Transforms,
  Entity,
  PointGraphics,
  LabelStyle,
  VerticalOrigin,
  BoundingSphere,
  HeadingPitchRange,
  Math,
  HeadingPitchRoll,
  Cartesian2,
  DistanceDisplayCondition,
  HorizontalOrigin,
  IonResource,
  Cartographic,
  Matrix4,
} from "cesium";
import { concatPlaces, groupedPlaces, places } from "./places";
import { toast } from "sonner";

const alignTilesetBaseToGround = async (tileset) => {
  // Wait for the tileset to be ready
  // await tileset.readyPromise;

  // Get the bounding sphere (center and radius)
  const boundingSphere = tileset.boundingSphere;
  const boundingCenter = boundingSphere.center;
  const radius = boundingSphere.radius;

  // Convert to Cartographic coordinates
  const cartographic = Cartographic.fromCartesian(boundingCenter);

  // Calculate the base height (center height minus radius)
  const baseHeight = cartographic.height - radius;

  // Log the current base height for debugging
  console.log(`Original base height of tileset: ${baseHeight}`);

  // Set the base height to 0 (flat ground)
  const heightOffset = -baseHeight; // Offset to bring the base to 0
  const newPosition = Cartesian3.fromDegrees(
    Math.toDegrees(cartographic.longitude),
    Math.toDegrees(cartographic.latitude),
    heightOffset
  );

  // Calculate the translation matrix
  const translation = Cartesian3.subtract(
    newPosition,
    boundingCenter,
    new Cartesian3()
  );

  // Apply the translation to the tileset's model matrix
  const newModelMatrix = Matrix4.fromTranslation(translation);
  tileset.modelMatrix = newModelMatrix;

  console.log("Tileset base aligned to ground successfully!");
};
// Example usage
const loadAndAlignTileset = async (viewer, assetId) => {
  const tileset = await Cesium3DTileset.fromIonAssetId(assetId);
  viewer.scene.primitives.add(tileset);
};

export const loadNewBuildingTileset = async (cesiumViewer) => {
  // Array of tileset IDs and corresponding names for better debugging
  const tilesets = [
    { id: 3278963, name: "map" },
    // { id: 3268940, name: "map" },
    { id: 2593928, name: "senate" },
    { id: 2593447, name: "roundabout" },
    { id: 2975229, name: "NDDC" },
    { id: 2975246, name: "tetFunds" },
    { id: 2975953, name: "tetFunds2" },
    { id: 2975261, name: "guestHouse" },
    { id: 2975960, name: "chemical" },
    { id: 2975964, name: "besideChemical" },
    { id: 2975969, name: "mechanical" },
    { id: 2975970, name: "mechanicalGlab" },
    { id: 2975973, name: "hostelC" },
    { id: 2975991, name: "predegress" },
    { id: 2975993, name: "hostelB" },
    { id: 2975995, name: "girlsHostel1" },
    { id: 2976005, name: "girlsHostel2" },
    { id: 2976009, name: "sugResource" },
    { id: 2977043, name: "backOfSEET" },
    { id: 2977045, name: "christEmbassy" },
    { id: 2977047, name: "deeperLife" },
    { id: 2977048, name: "besideDeeperLife" },
    { id: 2977049, name: "oldEatery" },
    { id: 2977053, name: "workshop1" },
    { id: 2977054, name: "automotiveWS" },
    { id: 2977055, name: "SOPsExtend" },
    { id: 2977058, name: "physicsPractExt" },
    { id: 2977060, name: "physicsPractical" },
    { id: 2977061, name: "physicsPracticalNew" },
    { id: 2977063, name: "SOPS" },
    { id: 2977064, name: "oppositeSOPS" },
    { id: 2977065, name: "ICT" },
    { id: 2977066, name: "besideICT" },
    { id: 2977067, name: "SIWES" },
    { id: 2977068, name: "besideJUPEB" },
    { id: 2977070, name: "jupeb1" },
    { id: 2977097, name: "workshop2" },
    { id: 2977629, name: "jupeb2" },
    { id: 2977630, name: "jupeb3" },
    { id: 2979429, name: "stacc" },
    { id: 2979430, name: "oldUCC" },
    { id: 2979435, name: "HallOFMercy" },
    { id: 2979439, name: "500caps" },
    { id: 2979441, name: "hallOFExcellence" },
    { id: 2979443, name: "futowa1" },
    { id: 2979447, name: "backofHOM" },
    { id: 2979449, name: "750caps" },
    { id: 2979454, name: "futowa2" },
    { id: 2979455, name: "ucc" },
    { id: 2979457, name: "backofLib" },
    { id: 2979460, name: "library" },
    { id: 2979463, name: "ACOL" },
    { id: 2979465, name: "ALl saints" },
    { id: 2979474, name: "statistics" },
    { id: 2979491, name: "BeforeSOBS" },
    { id: 2979493, name: "SOBS" },
    { id: 2979494, name: "SOES" },
    { id: 2979496, name: "BackOFSOES" },
    { id: 2979497, name: "BesideDGS" },
    { id: 3266179, name: "DGS" },
    { id: 3266239, name: "afterDGS" },
    { id: 3266277, name: "hostelC" },
  ];

  try {
    // Load all tilesets sequentially to ensure smooth loading and debug visibility
    for (const { id, name } of tilesets) {
      console.log(`Loading tileset: ${name} (ID: ${id})`);
      const tileset = await Cesium3DTileset.fromIonAssetId(id);
      cesiumViewer.scene.primitives.add(tileset);

      // Wait for the tileset to be ready before proceeding
      await tileset.readyPromise;
      // console.log(`Successfully loaded tileset: ${name}`);
      // await alignTilesetBaseToGround(tileset);

      // Adjust height offset
    }

    console.log("All tilesets loaded successfully!");
  } catch (error) {
    console.error("An error occurred while loading tilesets:", error);
  }
};

export const createTileWithProperties = (
  cesiumViewer,
  x,
  y,
  size,
  properties,
  color = Color.GREEN.withAlpha(0.5)
) => {
  return cesiumViewer.entities.add({
    position: Cartesian3.fromDegrees(x, y, 0),
    rectangle: {
      coordinates: Rectangle.fromDegrees(x, y, x + size, y + size),
      material: new ColorMaterialProperty(color),
      extrudedHeight: 0,
      heightReference: HeightReference.CLAMP_TO_GROUND,
      outline: true,
      outlineColor: Color.BLACK,
      outlineWidth: 2.0,
    },
    properties: properties,
  });
};

export const callTHeCreateTIles = (cesiumViewer) => {
  const west = 6.984172042631101;
  const south = 5.357306567461418;
  const east = 7.024156834792838;
  const north = 5.413929176525564;

  const tileSize = 0.0007; // Adjusted size of each tile in degrees

  let tileID = 1;
  for (let lon = west; lon < east; lon += tileSize) {
    for (let lat = south; lat < north; lat += tileSize) {
      createTileWithProperties(cesiumViewer, lon, lat, tileSize, {
        tileId: tileID++,
        type: "tile",
        coordinates: { lon, lat, size: tileSize },
      });
    }
  }
};

export const addPlacesToViewer = async (viewer) => {
  if (!viewer) return [];

  const labelEntities = []; // Store references to labels

  const createEntity = (place, minDist, maxDist, fontSize) => {
    const { latitude, longitude, placeName } = place;
    const lon = parseFloat(longitude);
    const lat = parseFloat(latitude);

    const entity = viewer.entities.add({
      position: Cartesian3.fromDegrees(
        parseFloat(longitude),
        parseFloat(latitude)
      ),
      id: `label-${placeName}`, // Unique ID for this tile
      name: `label ${placeName}`,
      properties: {
        type: "label",
        name: placeName,
        coordinates: { lon, lat }, // Store coordinates for reference
      },
      label: {
        text: placeName,
        font: `900 ${fontSize}px Roboto, sans-serif`,
        fillColor: Color.WHITESMOKE,
        outlineColor: Color.BLACK,
        outlineWidth: 4,
        style: LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: VerticalOrigin.BOTTOM,
        eyeOffset: new Cartesian3(0.0, 0.0, -70.0),
        distanceDisplayCondition: new DistanceDisplayCondition(
          minDist,
          maxDist
        ),
        show: true, // Default visibility
      },
    });
    labelEntities.push(entity);
  };

  places.forEach((place) => createEntity(place, 0.0, 400.0, 18));
  groupedPlaces.forEach((place) => createEntity(place, 501.0, 2000.0, 12));
  concatPlaces.forEach((place) => createEntity(place, 2000.0, 10000.0, 20));

  return labelEntities;
};

export const load3DModel = async (cesiumViewer, shopName, lon, lat, tileId) => {
  const position = Cartesian3.fromDegrees(lon, lat);
  const modelMatrix = Transforms.eastNorthUpToFixedFrame(position);

  console.log("ell entities =", cesiumViewer.entities);
  cesiumViewer.entities.add({
    id: `shop-${tileId}`, // Unique ID for this tile
    name: `shop ${tileId}`,
    position: position, // Use the same position as the model
    properties: {
      type: "shop",

      tileId: tileId, // Link this entity to the tile ID
      shopId: shopName, // Shop name or unique identifier
      coordinates: { lon, lat }, // Store coordinates for reference
    },
    model: {
      uri: "/shops/food_shop.glb", // Model file
      modelMatrix: modelMatrix,
      scale: 2,
    },
    label: {
      text: shopName, // Use the shop name from the mock data
      font: "18px sans-serif",
      fillColor: Color.WHITE,
      outlineColor: Color.BLACK,
      outlineWidth: 2,
      style: LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: VerticalOrigin.BOTTOM, // Move the label just above the model
      horizontalOrigin: HorizontalOrigin.CENTER, // Keep label centered horizontally
      eyeOffset: new Cartesian3(0.0, 0.0, -70.0), // Move the label in front of the model
      distanceDisplayCondition: new DistanceDisplayCondition(0.0, 400.0), // Display label within a certain distance
    },
  });
  console.log("SHop 3d model addded");
};

export const load3DModelForShop = async (
  cesiumViewer,
  shopName,
  lon,
  lat,
  tileId,
  category
) => {
  if (isNaN(lon) || isNaN(lat)) {
    console.error(
      `Invalid coordinates for ${shopName}: longitude=${lon}, latitude=${lat}`
    );
    return;
  }

  // Define a mapping of categories to model URLs
  const categoryModelMap = {
    "Food & Beverage": "/shops/cane.glb",
    "Clothing & Accessories": "/shops/candy.glb",
    // "Electronics & Accessories": "/shops/elctronics.glb",
    // "Books & Stationery": "/shops/pizza.glb",
    default: "/shops/food_shop.glb", // Default model for undefined categories
  };

  // Get the model URL based on the category, falling back to the default
  const modelUrl = categoryModelMap[category] || categoryModelMap.default;

  // Get the position for the model
  const position = Cartesian3.fromDegrees(lon, lat);
  const modelMatrix = Transforms.eastNorthUpToFixedFrame(position);

  // Load the model asynchronously
  const model = await Model.fromGltfAsync({
    url: modelUrl, // Dynamic model URL based on the category
    modelMatrix: modelMatrix,
    scale: 2,
  });

  // Add the model to the scene (uncomment if you want primitives)
  // cesiumViewer.scene.primitives.add(model);

  // Create an entity for the tile, which includes both the model and the label
  const tileEntity = cesiumViewer.entities.add({
    id: `tile-${tileId}`, // Unique ID for this tile
    name: `Tile ${tileId}`,
    position: position, // Position of the model/tile
    properties: {
      type: "shop",
      tileId: tileId, // Link this entity to the tile ID
      shopId: shopName, // Shop name or unique identifier
      category: category, // Store category for reference
      coordinates: { lon, lat }, // Store coordinates for reference
    },
    model: {
      uri: modelUrl, // Dynamic model URL based on the category
      modelMatrix: modelMatrix,
      scale: 2,
    },
    label: {
      text: shopName, // The shop's name
      font: "18px sans-serif",
      fillColor: Color.WHITE,
      outlineColor: Color.BLACK,
      outlineWidth: 2,
      style: LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: VerticalOrigin.BOTTOM, // Position the label above the model
      horizontalOrigin: HorizontalOrigin.CENTER, // Center the label horizontally
      eyeOffset: new Cartesian3(0.0, 0.0, -70.0), // Move the label in front of the model
      distanceDisplayCondition: new DistanceDisplayCondition(0.0, 400.0), // Set display range
    },
  });

  // console.log("Tile Entity Loaded:", tileEntity);
};

// Function to check if a tile is occupied based on longitude and latitude
export const checkIfTileOccupied = (tileId, shops) => {
  // console.log("tile Id gotten @ occupied tile checker", tileId);
  // console.log("shops gotten from occupied checker", shops);
  const occupiedTile = shops.find((shop) => {
    return shop.id == tileId;
  });

  console.log("Occupied Tile Object", occupiedTile);

  // If the tile is occupied, return an object with occupied status and the shop.user
  return occupiedTile
    ? { occupied: true, details: occupiedTile }
    : { occupied: false };
};

export const drawLineBetweenPoints = async (
  viewer,
  startLocation,
  endLocation
) => {
  const startPoint = Cartesian3.fromDegrees(
    startLocation.longitude,
    startLocation.latitude
  );
  const endPoint = Cartesian3.fromDegrees(
    endLocation.longitude,
    endLocation.latitude
  );
  const waypoints = await getMapboxDirections(
    startLocation.longitude,
    startLocation.latitude,
    endLocation.longitude,
    endLocation.latitude
  );

  if (waypoints && waypoints.length > 0) {
    // Draw the polyline following the road
    const positions = waypoints.map(([longitude, latitude]) =>
      Cartesian3.fromDegrees(longitude, latitude)
    );

    viewer.entities.add({
      polyline: {
        positions: positions,
        width: 3,
        material: Color.RED,
      },
    });

    // Fly to the destination (last waypoint)
    const [destinationLon, destinationLat] = waypoints[waypoints.length - 1];
    viewer.camera.flyToBoundingSphere(
      new BoundingSphere(
        Cartesian3.fromDegrees(destinationLon, destinationLat, 0),
        500
      ), // 500 meters offset
      {
        duration: 2,
        offset: new HeadingPitchRange(0, Math.toRadians(-30), 500),
      }
    );
  } else {
    viewer.entities.add({
      polyline: {
        positions: [startPoint, endPoint],
        width: 3,
        material: Color.RED,
      },
    });
  }
};

// function to log and see view orientations

export const flytoDestination = (viewer, lon, lat) => {
  // Fly to the bounding sphere at the specified longitude and latitude
  viewer.camera.flyToBoundingSphere(
    new BoundingSphere(Cartesian3.fromDegrees(lon, lat, 0), 500), // 500 meters offset from the object
    {
      duration: 2, // Fly duration in seconds
      offset: new HeadingPitchRange(0, Math.toRadians(-30), 500), // Adjust the range to maintain the object in the center
    }
  );

  // Add a 3D model entity that "hangs" in the air above the target location
  const pointerHeightOffset = 10; // Adjust the height above the 3D object (in meters)
  const position = Cartesian3.fromDegrees(lon, lat, pointerHeightOffset);

  // Define the model's rotation (Heading, Pitch, Roll)
  const heading = Math.toRadians(50); // Heading (rotation around the vertical axis)
  const pitch = Math.toRadians(0); // Pitch (tilt up/down)
  const roll = Math.toRadians(0); // Roll (rotation around the forward axis)
  const hpr = new HeadingPitchRoll(heading, pitch, roll);

  // Compute the quaternion for the orientation based on position
  const orientation = Transforms.headingPitchRollQuaternion(position, hpr);

  // const pointerEntity = viewer.entities.add({
  //   position: Cartesian3.fromDegrees(lon, lat, pointerHeightOffset), // Add a height offset
  //   orientation: orientation, // Set the orientation
  //   model: {
  //     uri: "/models/pointer.glb", // Path or URL to your 3D model file
  //     scale: 1.0, // Scale the model if needed
  //     minimumPixelSize: 64, // Ensures the model is visible even at lower zoom levels
  //     maximumScale: 200, // Optional: to limit scaling at higher zoom
  //   },
  // });

  // Optionally, zoom to the new entity
  // viewer.zoomTo(pointerEntity);
};

export const userModelAdd = (viewer, long, lat) => {
  viewer.entities.add({
    position: Cartesian3.fromDegrees(longitude, latitude), // Initial position
    model: {
      uri: "path/to/your/model.glb", // URL to your .glb/.gltf model file
      minimumPixelSize: 64, // Ensures model is always visible at small scales
      maximumScale: 2000, // Adjust based on how large you want the model to appear
    },
  });
};

export const getMapboxDirections = async (
  startLon,
  startLat,
  endLon,
  endLat
) => {
  const accessToken =
    "pk.eyJ1IjoiZWF6eiIsImEiOiJjbTM5ZTVqeXUxMHJuMnBzY3Jpa3RpcjV6In0.4jWwsMi42zaIedqwlmVjXg";
  const profile = "walking"; // Options: driving, walking, cycling
  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${startLon},${startLat};${endLon},${endLat}?geometries=geojson&access_token=${accessToken}`;

  try {
    console.log("sending this url to mapbox", url);
    const response = await fetch(url);
    const data = await response.json();
    console.log("got", data);

    if (data.code === "Ok") {
      return data.routes[0].geometry.coordinates; // Returns an array of [longitude, latitude] waypoints
    } else {
      console.error("Mapbox Directions request failed:", data.message);
    }
  } catch (error) {
    console.error("Error fetching directions:", error);
  }

  return null; // Return null if there's an error
};

export const formatRelativeTime = (timestamp) => {
  const now = new Date();
  const postDate = new Date(timestamp);
  const diffInSeconds = globalThis.Math.floor((now - postDate) / 1000); // Explicitly use global Math

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = globalThis.Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = globalThis.Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = globalThis.Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  // If more than a month ago, return the formatted date (e.g., 03 Nov)
  const options = { day: "2-digit", month: "short" };
  return new Intl.DateTimeFormat("en-US", options).format(postDate);
};

export const generateLocationLink = (longitude, latitude) => {
  const baseUrl = window.location.origin + window.location.pathname;
  const shareableLink = `${baseUrl}?lat=${latitude}&lng=${longitude}`;

  navigator.clipboard
    .writeText(shareableLink)
    .then(() => toast("Link copied! Share it with others."))
    .catch((err) => console.error("Failed to copy link:", err));
};
export const generateProfileLink = () => {
  const baseUrl = window.location.origin + window.location.pathname;

  navigator.clipboard
    .writeText(baseUrl)
    .then(() => toast("Link copied! Share it with others."))
    .catch((err) => console.error("Failed to copy link:", err));
};

export function extractTime(dateString) {
  const date = new Date(dateString);
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  return `${hours}:${minutes}`;
}
// Helper function to pad single-digit numbers with a leading zero
function padZero(number) {
  return number.toString().padStart(2, "0");
}
