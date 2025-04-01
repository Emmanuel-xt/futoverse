"use client";

import { useState, useEffect } from "react";
import { Cartesian3, HeadingPitchRoll, Transforms } from "cesium";
import { Button } from "@components/ui/button";
import { Slider } from "@components/ui/slider";
import { Input } from "@components/ui/input";

const TerrainPositioner = ({ viewer, modelUrl }) => {
  // State for Model Properties
  const [latitude, setLatitude] = useState(5.3823293861);
  const [longitude, setLongitude] = useState(6.9955297993);
  const [height, setHeight] = useState(0);
  const [heading, setHeading] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [scale, setScale] = useState(2.0803245856);
  const [modelEntity, setModelEntity] = useState(null);

  // Update model function
  const updateModel = () => {
    if (!viewer) return;

    const position = Cartesian3.fromDegrees(longitude, latitude, height);
    const hpr = HeadingPitchRoll.fromDegrees(heading, pitch, roll);
    const rotation = Transforms.headingPitchRollQuaternion(position, hpr);

    if (modelEntity) {
      modelEntity.position = position;
      modelEntity.orientation = rotation;
      modelEntity.model.scale = scale;
    } else {
      const entity = viewer.entities.add({
        position: position,
        orientation: rotation,
        model: {
          uri: modelUrl,
          scale: scale,
          minimumPixelSize: 128,
        },
      });
      setModelEntity(entity);
    }
  };

  // Run updateModel on state change
  useEffect(() => {
    updateModel();
  }, [latitude, longitude, height, heading, pitch, roll, scale]);

  // Movement handlers
  const moveUp = () => setLatitude((lat) => lat + 0.0001); // Move north
  const moveDown = () => setLatitude((lat) => lat - 0.0001); // Move south
  const moveLeft = () => setLongitude((lng) => lng - 0.0001); // Move west
  const moveRight = () => setLongitude((lng) => lng + 0.0001); // Move east

  return (
    <div className="p-4 flex mt-20 bg-gray-800 text-white rounded-lg shadow-lg w-full">
      <div className="w-1/2">
        <h2 className="text-lg font-bold mb-2">Adjust Terrain Position</h2>
        {/* Position Controls */}
        {/* <label>Latitude</label>
        <Input
          type="number"
          value={latitude}
          onChange={(e) => setLatitude(parseFloat(e.target.value))}
        />
        <label>Longitude</label>
        <Input
          type="number"
          value={longitude}
          onChange={(e) => setLongitude(parseFloat(e.target.value))}
        /> */}
        <label>Height</label>
        <Slider
          value={[height]}
          min={-100}
          max={100}
          step={1}
          onValueChange={(v) => setHeight(v[0])}
        />

        {/* Rotation Controls */}
        <label>Heading</label>
        <Slider
          value={[heading]}
          min={0}
          max={360}
          step={1}
          onValueChange={(v) => setHeading(v[0])}
        />
        <label>Pitch</label>
        <Slider
          value={[pitch]}
          min={-90}
          max={90}
          step={1}
          onValueChange={(v) => setPitch(v[0])}
        />
        <label>Roll</label>
        <Slider
          value={[roll]}
          min={-180}
          max={180}
          step={1}
          onValueChange={(v) => setRoll(v[0])}
        />

        {/* Scale Control */}
        <label>Scale</label>
        <Slider
          value={[scale]}
          min={0.1}
          max={10}
          step={0.1}
          onValueChange={(v) => setScale(v[0])}
        />
      </div>

      {/* Movement Buttons */}
      <div className="flex flex-col items-center gap-2 mt-4">
        <Button onClick={moveUp} className="w-full">
          ⬆️ Move Up
        </Button>
        <div className="flex gap-2 w-full">
          <Button onClick={moveLeft} className="w-1/2">
            ⬅️ Move Left
          </Button>
          <Button onClick={moveRight} className="w-1/2">
            ➡️ Move Right
          </Button>
        </div>
        <Button onClick={moveDown} className="w-full">
          ⬇️ Move Down
        </Button>

        <Button
          className="mt-4 w-full"
          onClick={() =>
            console.log({
              latitude,
              longitude,
              height,
              heading,
              pitch,
              roll,
              scale,
            })
          }
        >
          Save Position
        </Button>
      </div>
    </div>
  );
};

export default TerrainPositioner;
