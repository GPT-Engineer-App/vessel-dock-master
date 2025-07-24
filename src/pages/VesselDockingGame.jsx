import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Anchor, Trophy, RotateCcw, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import vesselImage from "/public/images/vessel.png";

const VesselDockingGame = () => {
  const [vesselPosition, setVesselPosition] = useState({ top: 10, left: 10 });
  const [vesselVelocity, setVesselVelocity] = useState({ top: 0, left: 0 });
  const [isDocked, setIsDocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [collisions, setCollisions] = useState(0);
  const [difficulty, setDifficulty] = useState('easy');
  const [gameStatus, setGameStatus] = useState('ready'); // ready, playing, docked, failed
  const gameAreaRef = useRef(null);

  
  // Difficulty settings
  const difficultySettings = {
    easy: { speed: 0.8, obstacles: 3, dockSize: 20, timeBonus: 1 },
    medium: { speed: 1.2, obstacles: 5, dockSize: 15, timeBonus: 2 },
    hard: { speed: 1.8, obstacles: 8, dockSize: 12, timeBonus: 3 }
  };

  // Generate obstacles based on difficulty
  const [obstacles, setObstacles] = useState([]);

  const generateObstacles = useCallback(() => {
    const count = difficultySettings[difficulty].obstacles;
    const newObstacles = [];
    for (let i = 0; i < count; i++) {
      newObstacles.push({
        id: i,
        top: Math.random() * 70 + 10,
        left: Math.random() * 70 + 10,
        width: 8 + Math.random() * 4,
        height: 8 + Math.random() * 4
      });
    }
    setObstacles(newObstacles);
  }, [difficulty]);

  const handleKeyDown = (e) => {
    if (!isPlaying || isDocked) return;

    const speed = difficultySettings[difficulty].speed;
    setVesselVelocity((prevVelocity) => {
      const newVelocity = { ...prevVelocity };
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          newVelocity.top = -speed;
          break;
        case "ArrowDown":
        case "s":
        case "S":
          newVelocity.top = speed;
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          newVelocity.left = -speed;
          break;
        case "ArrowRight":
        case "d":
        case "D":
          newVelocity.left = speed;
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
        case "w":
        case "W":
        case "s":
        case "S":
          newVelocity.top = 0;
          break;
        case "ArrowLeft":
        case "ArrowRight":
        case "a":
        case "A":
        case "d":
        case "D":
          newVelocity.left = 0;
          break;
        default:
          break;
      }
      return newVelocity;
    });
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (isPlaying && !isDocked) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isDocked]);

  useEffect(() => {
    const handleKeyDownWrapper = (e) => handleKeyDown(e);
    const handleKeyUpWrapper = (e) => handleKeyUp(e);
    window.addEventListener("keydown", handleKeyDownWrapper);
    window.addEventListener("keyup", handleKeyUpWrapper);
    return () => {
      window.removeEventListener("keydown", handleKeyDownWrapper);
      window.removeEventListener("keyup", handleKeyUpWrapper);
    };
  }, [isPlaying, isDocked, difficulty]);

  // Collision detection with obstacles
  const checkCollisions = useCallback((position) => {
    for (let obstacle of obstacles) {
      if (
        position.left < obstacle.left + obstacle.width &&
        position.left + 8 > obstacle.left &&
        position.top < obstacle.top + obstacle.height &&
        position.top + 8 > obstacle.top
      ) {
        return true;
      }
    }
    return false;
  }, [obstacles]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setVesselPosition((prevPosition) => {
        const newPosition = {
          top: Math.min(Math.max(prevPosition.top + vesselVelocity.top, 0), 92),
          left: Math.min(Math.max(prevPosition.left + vesselVelocity.left, 0), 92),
        };
        
        // Check for collisions
        if (checkCollisions(newPosition)) {
          setCollisions(prev => prev + 1);
          setScore(prev => Math.max(0, prev - 50));
          toast.error("Collision! -50 points");
          return prevPosition; // Don't move if collision
        }
        
        return newPosition;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [vesselVelocity, isPlaying, checkCollisions]);

  // Docking detection
  useEffect(() => {
    const dockSize = difficultySettings[difficulty].dockSize;
    const dockArea = { top: 90 - dockSize, left: 90 - dockSize };
    
    if (
      vesselPosition.top >= dockArea.top &&
      vesselPosition.top <= 90 &&
      vesselPosition.left >= dockArea.left &&
      vesselPosition.left <= 90 &&
      isPlaying
    ) {
      setIsDocked(true);
      setIsPlaying(false);
      setGameStatus('docked');
      
      // Calculate final score
      const timeBonus = Math.max(0, (120 - timeElapsed) * difficultySettings[difficulty].timeBonus);
      const collisionPenalty = collisions * 50;
      const finalScore = Math.max(0, 1000 + timeBonus - collisionPenalty);
      setScore(finalScore);
      
      toast.success(`Successfully docked! Final score: ${finalScore}`);
    }
  }, [vesselPosition, isPlaying, timeElapsed, collisions, difficulty]);

  const startGame = () => {
    setIsPlaying(true);
    setGameStatus('playing');
    setTimeElapsed(0);
    setScore(0);
    setCollisions(0);
    setVesselPosition({ top: 10, left: 10 });
    setVesselVelocity({ top: 0, left: 0 });
    setIsDocked(false);
    generateObstacles();
    toast.success("Game started! Navigate to the docking area!");
  };

  const pauseGame = () => {
    setIsPlaying(false);
  };

  const resetGame = () => {
    setIsPlaying(false);
    setGameStatus('ready');
    setVesselPosition({ top: 10, left: 10 });
    setVesselVelocity({ top: 0, left: 0 });
    setIsDocked(false);
    setTimeElapsed(0);
    setScore(0);
    setCollisions(0);
    generateObstacles();
  };

  const changeDifficulty = (newDifficulty) => {
    setDifficulty(newDifficulty);
    resetGame();
  };

  // Initialize obstacles on mount
  useEffect(() => {
    generateObstacles();
  }, [generateObstacles]);

  const dockSize = difficultySettings[difficulty].dockSize;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6 p-4">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold flex items-center gap-2 justify-center">
          <Anchor className="h-8 w-8" />
          Vessel Docking Simulator
        </h1>
        <p className="text-muted-foreground">Navigate your vessel safely to the docking area!</p>
      </div>

      {/* Game Stats */}
      <div className="flex gap-4 flex-wrap justify-center">
        <Badge variant="secondary" className="text-sm">
          <Trophy className="h-4 w-4 mr-1" />
          Score: {score}
        </Badge>
        <Badge variant="secondary" className="text-sm">
          Time: {timeElapsed}s
        </Badge>
        <Badge variant="secondary" className="text-sm">
          Collisions: {collisions}
        </Badge>
        <Badge variant={difficulty === 'easy' ? 'default' : difficulty === 'medium' ? 'secondary' : 'destructive'}>
          {difficulty.toUpperCase()}
        </Badge>
      </div>

      {/* Game Area */}
      <div 
        ref={gameAreaRef} 
        className="relative w-[500px] h-[500px] border-4 border-primary/20 rounded-lg overflow-hidden bg-gradient-to-br from-blue-400/20 to-blue-600/30"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(120, 180, 255, 0.2) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(100, 200, 255, 0.2) 0%, transparent 50%),
                           radial-gradient(circle at 40% 40%, rgba(200, 255, 255, 0.1) 0%, transparent 50%)`
        }}
      >
        {/* Water waves effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
        </div>

        {/* Obstacles */}
        {obstacles.map((obstacle) => (
          <div
            key={obstacle.id}
            className="absolute bg-red-500/80 border-2 border-red-600 rounded-sm shadow-lg"
            style={{
              top: `${obstacle.top}%`,
              left: `${obstacle.left}%`,
              width: `${obstacle.width}%`,
              height: `${obstacle.height}%`,
            }}
          />
        ))}

        {/* Docking Area */}
        <div 
          className="absolute bg-green-500/60 border-4 border-green-400 rounded-lg shadow-inner animate-pulse"
          style={{
            top: `${90 - dockSize}%`,
            left: `${90 - dockSize}%`,
            width: `${dockSize}%`,
            height: `${dockSize}%`,
          }}
        >
          <div className="absolute inset-2 border-2 border-green-300 rounded bg-green-400/30" />
          <Anchor className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-green-700" />
        </div>

        {/* Vessel */}
        <div
          className={`absolute transition-all duration-75 ${isDocked ? 'animate-bounce' : ''}`}
          style={{ 
            top: `${vesselPosition.top}%`, 
            left: `${vesselPosition.left}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <img
            src={vesselImage}
            alt="Vessel"
            className="w-12 h-12 drop-shadow-lg"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              transform: `rotate(${vesselVelocity.left * 15}deg)`
            }}
          />
        </div>

        {/* Game Status Overlay */}
        {gameStatus === 'ready' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-4">Ready to Start!</h2>
              <p className="mb-4">Use arrow keys or WASD to navigate</p>
              <p className="mb-4">Avoid red obstacles and reach the green docking area</p>
            </div>
          </div>
        )}

        {gameStatus === 'docked' && (
          <div className="absolute inset-0 bg-green-900/80 flex items-center justify-center">
            <div className="text-center text-white">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
              <h2 className="text-3xl font-bold mb-2">Successfully Docked!</h2>
              <p className="text-xl">Final Score: {score}</p>
              <p>Time: {timeElapsed}s | Collisions: {collisions}</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4 flex-wrap justify-center">
        {gameStatus === 'ready' && (
          <Button onClick={startGame} className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Start Game
          </Button>
        )}
        
        {isPlaying && (
          <Button onClick={pauseGame} variant="secondary" className="flex items-center gap-2">
            <Pause className="h-4 w-4" />
            Pause
          </Button>
        )}
        
        <Button onClick={resetGame} variant="outline" className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {/* Difficulty Selection */}
      <div className="flex gap-2">
        <Button 
          onClick={() => changeDifficulty('easy')}
          variant={difficulty === 'easy' ? 'default' : 'outline'}
          size="sm"
        >
          Easy
        </Button>
        <Button 
          onClick={() => changeDifficulty('medium')}
          variant={difficulty === 'medium' ? 'default' : 'outline'}
          size="sm"
        >
          Medium
        </Button>
        <Button 
          onClick={() => changeDifficulty('hard')}
          variant={difficulty === 'hard' ? 'default' : 'outline'}
          size="sm"
        >
          Hard
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground max-w-md">
        <p>Use Arrow Keys or WASD to control your vessel.</p>
        <p>Avoid red obstacles and dock at the green area for maximum points!</p>
      </div>
    </div>
  );
};

export default VesselDockingGame;