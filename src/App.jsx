import React, { useState, useEffect, useRef } from "react";

export default function FlappyBirdGame() {
  const [birdY, setBirdY] = useState(250);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [SPEED, setSpeed] = useState(5);
  const [GRAVITY, setGravity] = useState(.5);
  const [JUMP_STRENGTH, setJumpStrength] = useState(-5)
  const [bestScore, setBestScore] = useState(
    parseInt(localStorage.getItem('bestScore')) || 0
  );
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const gameOverRef = useRef(false);
  const audioRef = useRef(null);

  const GAME_HEIGHT = 500;
  const GAME_WIDTH = Math.min(window.innerWidth, 800);
  const PIPE_WIDTH = 50;
  const GAP_HEIGHT = 150;

  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);

  function jump() {
    if (!started) return; // ignore jump if not started
    if (!gameOverRef.current) {
      setVelocity(JUMP_STRENGTH);
    }
  }

  function restartGame() {
    setBirdY(250);
    setVelocity(0);
    setPipes([]);
    setScore(0);
    setGameOver(false);
    setSpeed(5)
    setGravity(.5)
    setJumpStrength(-5)
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  }

  function startGame() {
    setStarted(true);
    setGameOver(false);
    setScore(0);
    setPipes([]);
    setBirdY(250);
    setVelocity(0);
    setSpeed(5)
    setGravity(.5)
    setJumpStrength(-5)
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  }

  // Controls
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [started]);

  // Game loop
  useEffect(() => {
    if (gameOver || !started) return;
    const interval = setInterval(() => {
      // Move bird
      setBirdY((prev) => {
        let newY = prev + velocity;
        if (newY < 0) newY = 0;
        if (newY > GAME_HEIGHT - 30) {
          newY = GAME_HEIGHT - 30;
          setGameOver(true);
        }
        return newY;
      });
      setVelocity((v) => v + GRAVITY);

      // Move pipes
      setPipes((prev) => {
        let newPipes = prev
          .map((p) => ({ ...p, x: p.x - SPEED }))
          .filter((p) => p.x + PIPE_WIDTH > 0);

        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < GAME_WIDTH - 300) {
          const topHeight = 50 + Math.random() * (GAME_HEIGHT - GAP_HEIGHT - 100);
          newPipes.push({ x: GAME_WIDTH, topHeight });
        }
        return newPipes;
      });

      setScore((s) => s + 1);
    }, 30);
    return () => clearInterval(interval);
  }, [velocity, gameOver, started]);

  // Collision detection
  useEffect(() => {
    if (!started) return;
    for (const p of pipes) {
      if (
        p.x < 100 && p.x + PIPE_WIDTH > 70 // birdX=70
      ) {
        if (
          birdY < p.topHeight ||
          birdY + 30 > p.topHeight + GAP_HEIGHT
        ) {
          setGameOver(true);
        }
      }
    }
  }, [pipes, birdY, started]);

  // Update best score
  useEffect(() => {
    if (gameOver) {
      if (score > bestScore) {
        setBestScore(score);
        localStorage.setItem('bestScore', score);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [gameOver, score, bestScore]);

  useEffect(() => {
      if (score % 100 === 0 && score !== 0) { 
        setSpeed(s => Math.min(s + 0.3, 15));
        setGravity(g => Math.min(g + 0.05, .8));
        setJumpStrength(j => Math.max(j - 0.2, -12));
      }
      
    }, [score]);

  return (
    <div
      onClick={jump}
      className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden"
    >
      {/* Fond animé */}
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-neon-pink/10 via-black to-neon-green/10"></div>

      {/* Particules */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-neon-blue rounded-full opacity-20 animate-ping"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${1 + Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Audio */}
      <audio ref={audioRef} loop src="/flappy-ball/game.mp3" />

      <div className="relative max-w-[800px] w-full" style={{ height: GAME_HEIGHT }}>
        {/* Score */}
        {started && !gameOver && (
          <div className="absolute top-3 left-3 text-neon-green text-xl font-mono select-none">
            ⚡ Score: {score} | 🏆 Best: {bestScore}
          </div>
        )}

        {/* Bird avec glow */}
        {started && (
          <div
            className="absolute bg-neon-yellow rounded shadow-lg"
            style={{
              top: birdY,
              left: 70,
              width: 35,
              height: 35,
              borderRadius: '100%',
              boxShadow: '0 0 10px #FF1493, 0 0 20px #FF1493',
            }}
          ></div>
        )}

        {/* Pipes */}
        {started && pipes.map((p, i) => (
          <React.Fragment key={i}>
            <div
              className="absolute bg-neon-green rounded shadow"
              style={{
                left: p.x,
                top: 0,
                width: PIPE_WIDTH,
                height: p.topHeight,
                boxShadow: '0 0 10px #39FF14',
              }}
            ></div>
            <div
              className="absolute bg-neon-green rounded shadow"
              style={{
                left: p.x,
                top: p.topHeight + GAP_HEIGHT,
                width: PIPE_WIDTH,
                height: GAME_HEIGHT - p.topHeight - GAP_HEIGHT,
                boxShadow: '0 0 10px #39FF14',
              }}
            ></div>
          </React.Fragment>
        ))}

        {/* Écran d'accueil */}
        {!started && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-neon-blue">
            <h1 className="text-4xl font-bold mb-4">🚀Flappy * Ball🚀</h1>
            <p className="mb-4">Clique ou appuie sur espace pour sauter</p>
            <button
              onClick={startGame}
              className="px-4 py-2 bg-neon-pink rounded hover:bg-pink-400 transition"
            >
              Jouer
            </button>
          </div>
        )}

        {/* Game Over */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 text-center text-neon-pink">
            <h1 className="text-4xl font-bold mb-4">💀 GAME OVER</h1>
            <p className="mb-2">Score: {score} | Best: {bestScore}</p>
            <button
              onClick={restartGame}
              className="px-4 py-2 bg-neon-green rounded hover:bg-green-400 transition"
            >
              Rejouer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}