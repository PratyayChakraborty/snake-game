import React, { useState, useEffect, useRef } from 'react';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const SNAKE_SIZE = 20;
const FOOD_SIZE = 20;

const SnakeGame = () => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([{ x: 100, y: 100 }]);
  const [food, setFood] = useState({ x: 200, y: 200 });
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameRunning, setGameRunning] = useState(false);
  const gameInterval = useRef(null);
  const savedPositions = useRef({ snake: [], food: {} });

  useEffect(() => {
    if (gameRunning) {
      const handleKeyPress = (e) => {
        e.preventDefault();
        if (e.key === 'ArrowUp' && direction !== 'DOWN') {
          setDirection('UP');
        } else if (e.key === 'ArrowDown' && direction !== 'UP') {
          setDirection('DOWN');
        } else if (e.key === 'ArrowLeft' && direction !== 'RIGHT') {
          setDirection('LEFT');
        } else if (e.key === 'ArrowRight' && direction !== 'LEFT') {
          setDirection('RIGHT');
        }
      };
      window.addEventListener('keydown', handleKeyPress);

      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [gameRunning, direction]);

  useEffect(() => {
    if (gameRunning) {
      const checkCollision = () => {
        const head = { x: snake[0].x, y: snake[0].y };
        if (
          head.x < 0 ||
          head.x >= CANVAS_WIDTH ||
          head.y < 0 ||
          head.y >= CANVAS_HEIGHT ||
          snake.slice(1).some((segment) => segment.x === head.x && segment.y === head.y)
        ) {
          setGameOver(true);
          stopGame();
        }
      };

      const moveSnake = () => {
        if (!gameOver) {
          const newSnake = [...snake];
          const head = { x: newSnake[0].x, y: newSnake[0].y };

          switch (direction) {
            case 'UP':
              head.y -= SNAKE_SIZE;
              break;
            case 'DOWN':
              head.y += SNAKE_SIZE;
              break;
            case 'LEFT':
              head.x -= SNAKE_SIZE;
              break;
            case 'RIGHT':
              head.x += SNAKE_SIZE;
              break;
            default:
              break;
          }

          newSnake.unshift(head);

          if (head.x === food.x && head.y === food.y) {
            setScore(score + 1);
            const newFood = {
              x: Math.floor(Math.random() * (CANVAS_WIDTH / FOOD_SIZE)) * FOOD_SIZE,
              y: Math.floor(Math.random() * (CANVAS_HEIGHT / FOOD_SIZE)) * FOOD_SIZE,
            };
            setFood(newFood);
          } else {
            newSnake.pop();
          }

          setSnake(newSnake);
          checkCollision();
        }
      };

      gameInterval.current = setInterval(moveSnake, 150);
      return () => clearInterval(gameInterval.current);
    }
  });

  useEffect(() => {
    const context = canvasRef.current.getContext('2d');
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (!gameOver) {
      context.fillStyle = 'black';
      snake.forEach((segment) => {
        context.fillRect(segment.x, segment.y, SNAKE_SIZE, SNAKE_SIZE);
      });

      context.fillStyle = 'orange';
      context.fillRect(food.x, food.y, FOOD_SIZE, FOOD_SIZE);
    } else {
      context.fillStyle = 'red';
      context.font = '40px Arial';
      context.fillText('Game Over', CANVAS_WIDTH / 2 - 100, CANVAS_HEIGHT / 2);
    }
  }, [snake, food, gameOver]);

  const startGame = () => {
    if (savedPositions.current.snake.length > 0) {
      setSnake(savedPositions.current.snake);
      setFood(savedPositions.current.food);
    } else {
      setSnake([{ x: 100, y: 100 }]);
      setFood({ x: 200, y: 200 });
    }
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setGameRunning(true);
  };

  const stopGame = () => {
    clearInterval(gameInterval.current);
    setGameRunning(false);
    savedPositions.current.snake = snake;
    savedPositions.current.food = food;
  };

  const resumeGame = () => {
    const randomX = Math.floor(Math.random() * (CANVAS_WIDTH / SNAKE_SIZE)) * SNAKE_SIZE;
    const randomY = Math.floor(Math.random() * (CANVAS_HEIGHT / SNAKE_SIZE)) * SNAKE_SIZE;
    const newSnake = [{ x: randomX, y: randomY }];
    const newFood = {
      x: Math.floor(Math.random() * (CANVAS_WIDTH / FOOD_SIZE)) * FOOD_SIZE,
      y: Math.floor(Math.random() * (CANVAS_HEIGHT / FOOD_SIZE)) * FOOD_SIZE,
    };

    setSnake(newSnake);
    setFood(newFood);
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setGameRunning(true);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>
        {!gameRunning && (
          <button onClick={startGame}>Start</button>
        )}
        {gameRunning && (
          <button onClick={stopGame}>Stop</button>
        )}
        {gameOver && (
          <button onClick={resumeGame}>Play Again</button>
        )}
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ border: '1px solid black' }}
        />
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p>Score: {score}</p>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
