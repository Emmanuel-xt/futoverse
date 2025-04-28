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
  PolylineOutlineMaterialProperty,
  CallbackProperty,
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
  // console.log(`Original base height of tileset: ${baseHeight}`);

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

  // console.log("Tileset base aligned to ground successfully!");
};
// Example usage
const loadAndAlignTileset = async (viewer, assetId) => {
  const tileset = await Cesium3DTileset.fromIonAssetId(assetId);
  viewer.scene.primitives.add(tileset);
};

export const loadNewBuildingTileset = async (cesiumViewer) => {
  // Array of tileset IDs and corresponding names for better debugging
  const tilesets = [
    // { id: 3278963, name: "map" },
    { id: 3268940, name: "map" },
    // { id: 3268940, name: "map" },
    // { id: 2593928, name: "senate" },
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
    // { id: 2977058, name: "physicsPractExt" },
    // { id: 2977060, name: "physicsPractical" },
    // { id: 2977061, name: "physicsPracticalNew" },
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
    { id: 3280046, name: "Architecture-Short" },
    { id: 3280049, name: "infront-Archi" },
    // { id: 3280050, name: "ArchitectureHall" },
    { id: 3280053, name: "opposite_archi" },
    { id: 3280054, name: "beforeSOES" },
    { id: 3280055, name: "be4Archi-short" },
    { id: 3280061, name: "backofArchiHall" },
    { id: 3280063, name: "ArchitectureSecondBuilding" },
    { id: 3280089, name: "Agri-Econs" },
    { id: 3280093, name: "AEX" },
    { id: 3280094, name: "beforeFUTOWA" },
    { id: 3280122, name: "NuclearEnergy" },
    { id: 3280139, name: "ift-buidling" },
    { id: 3280154, name: "csc_manual" },
    { id: 3280169, name: "csc" },
    { id: 3280170, name: "besideIFT" },
    { id: 3280179, name: "smat_3" },
    { id: 3280191, name: "smat_1" },
    { id: 3280193, name: "smat-2" },
    { id: 3280199, name: "smat_22" },
    { id: 3280248, name: "SEET" },
    { id: 3280321, name: "SEET_2" },
    { id: 3280369, name: "SEET_3" },
    { id: 3280461, name: "Stac" },
    { id: 3280704, name: "futo-cafe" },
    { id: 3284551, name: "after-press" },
    { id: 3284552, name: "press" },
    { id: 3284555, name: "geology" },
    { id: 3284557, name: "architecture-hall" },
    { id: 3284561, name: "biochem" },
    { id: 3284564, name: "sat-new-lecture-hall" },
    { id: 3284605, name: "physics-new" },
    { id: 3284608, name: "colledge-of-medicine" },
    { id: 3284609, name: "beside-physics-new" },
    { id: 3284611, name: "physics-textbook" },
    { id: 3284613, name: "SOPS-theatre" },
    { id: 3284616, name: "micro-bio" },
    { id: 3284618, name: "last-sat-building" },
    { id: 3284620, name: "logistics" },
    { id: 3284622, name: "ENS" },
    { id: 3284624, name: "Bank" },
    { id: 3284626, name: "dental" },
    { id: 3284627, name: "optometry" },
    { id: 3284629, name: "beside-dental" },
    { id: 3284633, name: "SOHT-hall" },
    { id: 3284638, name: "prostetics" },
    { id: 3284646, name: "beside-prostetics" },
  ];

  try {
    // Load all tilesets sequentially to ensure smooth loading and debug visibility
    for (const { id, name } of tilesets) {
      // console.log(`Loading tileset: ${name} (ID: ${id})`);
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
    // console.error("An error occurred while loading tilesets:", error);
  }
};

const material = new ColorMaterialProperty(Color.GREEN.withAlpha(0.1));
export const createTileWithProperties = (viewer, x, y, size, properties) => {
  return viewer.entities.add({
    name: `Tile_${x}_${y}`,
    position: Cartesian3.fromDegrees(x + size / 2, y + size / 2),
    rectangle: {
      coordinates: Rectangle.fromDegrees(x, y, x + size, y + size),
      material: material,
      heightReference: HeightReference.CLAMP_TO_GROUND,
      extrudedHeight: 0,
      outline: true,
      outlineColor: Color.BLACK,
      outlineWidth: 1.0,
    },
    properties,
  });
};

export const callTHeCreateTIles = (cesiumViewer) => {
  // const west = 6.984172042631101;
  // const south = 5.357306567461418;
  // const east = 7.024156834792838;
  // const north = 5.413929176525564;

  const west = 6.993498287022618;
  const south = 5.3600319870711814;
  const east = 7.012325243502062;
  const north = 5.394281689328309;

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
        show: false, // Default visibility
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

  // console.log("ell entities =", cesiumViewer.entities);
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
  // console.log("SHop 3d model addded");
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
    // console.error(
    //   `Invalid coordinates for ${shopName}: longitude=${lon}, latitude=${lat}`
    // );
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
  const occupiedTile = shops?.find((shop) => {
    return shop.id == tileId;
  });

  // console.log("Occupied Tile Object", occupiedTile);

  // If the tile is occupied, return an object with occupied status and the shop.user
  return occupiedTile
    ? { occupied: true, details: occupiedTile }
    : { occupied: false };
};

export const drawLineBetweenPoints = async (
  viewer,
  getCurrentPosition, // <-- function that returns live position
  endLocation
) => {
  try {
    const waypoints = await getMapboxDirections(
      getCurrentPosition().longitude,
      getCurrentPosition().latitude,
      endLocation.longitude,
      endLocation.latitude
    );
    const positions = new CallbackProperty(() => {
      const current = getCurrentPosition();
      const updatedStart = Cartesian3.fromDegrees(
        current.longitude,
        current.latitude,
        5
      );
      const updatedEnd = Cartesian3.fromDegrees(
        endLocation.longitude,
        endLocation.latitude,
        5
      );
      return [
        updatedStart,
        ...waypoints.map(([lon, lat]) => Cartesian3.fromDegrees(lon, lat, 5)),
        updatedEnd,
      ];
    }, false);

    const existingEntity = viewer.entities.getById("direction-line");
    if (existingEntity) viewer.entities.remove(existingEntity);

    viewer.entities.add({
      id: "direction-line",
      polyline: {
        positions,
        width: 5,
        material: new PolylineOutlineMaterialProperty({
          color: Color.BLUE.withAlpha(0.9),
          outlineColor: Color.BLUE.withAlpha(0.6),
          outlineWidth: 2,
        }),
      },
    });
  } catch (error) {
    // console.log("Error getting directions", error);
  }
};

// function to log and see view orientations

// Hold the pointer entity outside the function (only one at a time)

export const flytoDestination = (viewer, lon, lat) => {
  // Fly to the bounding sphere at the specified location
  viewer.camera.flyToBoundingSphere(
    new BoundingSphere(Cartesian3.fromDegrees(lon, lat, 0), 500),
    {
      duration: 2,
      offset: new HeadingPitchRange(0, Math.toRadians(-30), 500),
    }
  );

  const pointerHeightOffset = 40;
  const position = Cartesian3.fromDegrees(lon, lat, pointerHeightOffset);

  const orientation = Transforms.headingPitchRollQuaternion(
    position,
    new HeadingPitchRoll(Math.toRadians(50), 0, 0)
  );

  const existingEntity = viewer.entities.getById("pointer1");
  if (existingEntity) {
    existingEntity.position = position;
  } else {
    // Add new pointer
    viewer.entities.add({
      position,
      orientation,
      id: `pointer1`, // Unique ID for this tile
      properties: {
        type: "pointer",
        coordinates: { longitude: lon, latitude: lat },
      },
      model: {
        uri: "/models/pointer.glb",
        scale: 5.0,
        minimumPixelSize: 64,
        maximumScale: 200,
      },
    });
  }

  // Optional: fly to the pointer
  // viewer.zoomTo(currentPointerEntity);
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
    // console.log("sending this url to mapbox", url);
    const response = await fetch(url);
    const data = await response.json();
    // console.log("got", data);

    if (data.code === "Ok") {
      return data.routes[0].geometry.coordinates; // Returns an array of [longitude, latitude] waypoints
    } else {
      // console.error("Mapbox Directions request failed:", data.message);
    }
  } catch (error) {
    // console.error("Error fetching directions:", error);
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
export const generateMyProfileLink = (username) => {
  const baseUrl =
    window.location.origin + window.location.pathname + "/" + username;

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

// utils/groupMessagesByDate.ts
import { format, isToday, isYesterday } from "date-fns";

export const groupMessagesByDate = (messages) => {
  const groups = {};

  messages.forEach((msg) => {
    const date = new Date(msg.createdAt);

    let groupLabel;
    if (isToday(date)) {
      groupLabel = "Today";
    } else if (isYesterday(date)) {
      groupLabel = "Yesterday";
    } else {
      groupLabel = format(date, "MMMM d, yyyy");
    }

    if (!groups[groupLabel]) {
      groups[groupLabel] = [];
    }

    groups[groupLabel].push(msg);
  });

  return groups;
};
