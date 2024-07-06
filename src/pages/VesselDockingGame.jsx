import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const VesselDockingGame = () => {
  const [vesselPosition, setVesselPosition] = useState({ top: 50, left: 50 });
  const [isDocked, setIsDocked] = useState(false);

  const handleKeyDown = (e) => {
    if (isDocked) return;

    setVesselPosition((prevPosition) => {
      const newPosition = { ...prevPosition };
      switch (e.key) {
        case "ArrowUp":
          newPosition.top = Math.max(prevPosition.top - 5, 0);
          break;
        case "ArrowDown":
          newPosition.top = Math.min(prevPosition.top + 5, 95);
          break;
        case "ArrowLeft":
          newPosition.left = Math.max(prevPosition.left - 5, 0);
          break;
        case "ArrowRight":
          newPosition.left = Math.min(prevPosition.left + 5, 95);
          break;
        default:
          break;
      }
      return newPosition;
    });
  };

  useEffect(() => {
    const handleKeyDownWrapper = (e) => handleKeyDown(e);
    window.addEventListener("keydown", handleKeyDownWrapper);
    return () => {
      window.removeEventListener("keydown", handleKeyDownWrapper);
    };
  }, [isDocked]);

  useEffect(() => {
    if (
      vesselPosition.top >= 80 &&
      vesselPosition.top <= 90 &&
      vesselPosition.left >= 80 &&
      vesselPosition.left <= 90
    ) {
      setIsDocked(true);
    } else {
      setIsDocked(false);
    }
  }, [vesselPosition]);

  const resetGame = () => {
    setVesselPosition({ top: 50, left: 50 });
    setIsDocked(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <h1 className="text-3xl font-bold">Vessel Docking Game</h1>
      <div className="relative w-[400px] h-[400px] border-2 border-gray-500">
        <div
          className="absolute w-10 h-10 bg-blue-500"
          style={{ top: `${vesselPosition.top}%`, left: `${vesselPosition.left}%` }}
        />
        <div className="absolute w-20 h-20 bg-green-500 top-[80%] left-[80%]" />
      </div>
      <div className="flex space-x-4">
        <Button onClick={resetGame}>Reset</Button>
      </div>
      {isDocked && <p className="text-green-500">Vessel Successfully Docked!</p>}
    </div>
  );
};

export default VesselDockingGame;