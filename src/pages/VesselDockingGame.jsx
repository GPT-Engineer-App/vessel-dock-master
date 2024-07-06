import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import vesselImage from "/public/images/vessel.png";

const VesselDockingGame = () => {
  const [vesselPosition, setVesselPosition] = useState({ top: 50, left: 50 });
  const [vesselVelocity, setVesselVelocity] = useState({ top: 0, left: 0 });
  const [isDocked, setIsDocked] = useState(false);
  const gameAreaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (isDocked) return;

    setVesselVelocity((prevVelocity) => {
      const newVelocity = { ...prevVelocity };
      switch (e.key) {
        case "ArrowUp":
          newVelocity.top = -1;
          break;
        case "ArrowDown":
          newVelocity.top = 1;
          break;
        case "ArrowLeft":
          newVelocity.left = -1;
          break;
        case "ArrowRight":
          newVelocity.left = 1;
          break;
        default:
          break;
      }
      return newVelocity;
    });
  };

  const handleKeyUp = (e) => {
    setVesselVelocity((prevVelocity) => {
      const newVelocity = { ...prevVelocity };
      switch (e.key) {
        case "ArrowUp":
        case "ArrowDown":
          newVelocity.top = 0;
          break;
        case "ArrowLeft":
        case "ArrowRight":
          newVelocity.left = 0;
          break;
        default:
          break;
      }
      return newVelocity;
    });
  };

  useEffect(() => {
    const handleKeyDownWrapper = (e) => handleKeyDown(e);
    const handleKeyUpWrapper = (e) => handleKeyUp(e);
    window.addEventListener("keydown", handleKeyDownWrapper);
    window.addEventListener("keyup", handleKeyUpWrapper);
    return () => {
      window.removeEventListener("keydown", handleKeyDownWrapper);
      window.removeEventListener("keyup", handleKeyUpWrapper);
    };
  }, [isDocked]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVesselPosition((prevPosition) => {
        const newPosition = {
          top: Math.min(Math.max(prevPosition.top + vesselVelocity.top, 0), 95),
          left: Math.min(Math.max(prevPosition.left + vesselVelocity.left, 0), 95),
        };
        return newPosition;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [vesselVelocity]);

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
      <div ref={gameAreaRef} className="relative w-[400px] h-[400px] border-2 border-gray-500">
        <img
          src={vesselImage}
          alt="Vessel"
          className="absolute w-10 h-10"
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