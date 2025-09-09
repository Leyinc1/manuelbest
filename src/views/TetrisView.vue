<template>
  <div class="tetris-container">
    <h1>Tetris</h1>
    <div class="game-area">
      <canvas id="tetris-canvas" width="200" height="400"></canvas>
      <div class="info-panel">
        <div class="score">Score: {{ score }}</div>
        <div class="next-piece">Next:</div>
        <canvas id="next-piece-canvas" width="80" height="80"></canvas>
        <button @click="startGame">Start Game</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TetrisView',
  data() {
    return {
      score: 0,
      // Game state variables
      canvas: null,
      ctx: null,
      nextCanvas: null,
      nextCtx: null,
      board: [],
      currentPiece: null,
      nextPiece: null,
      heldPiece: null, // Added for hold functionality
      canHold: true, // Added to limit hold to once per turn
      blockSize: 20,
      boardWidth: 10,
      boardHeight: 20,
      tetrominoes: {
        'I': {
          shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
          color: '#00ffff', // Neon Cyan
        },
        'J': {
          shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
          color: '#0000ff', // Neon Blue
        },
        'L': {
          shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
          color: '#ff7f00', // Neon Orange
        },
        'O': {
          shape: [[1, 1], [1, 1]],
          color: '#ffff00', // Neon Yellow
        },
        'S': {
          shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
          color: '#00ff00', // Neon Green
        },
        'T': {
          shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
          color: '#800080', // Neon Purple
        },
        'Z': {
          shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
          color: '#ff0000', // Neon Red
        },
      },
      gameInterval: null,
      dropInterval: 1000, // milliseconds
    };
  },
  methods: {
    startGame() {
      this.initBoard();
      this.score = 0;
      this.heldPiece = null; // Reset held piece on new game
      this.canHold = true; // Reset canHold on new game
      this.currentPiece = this.getRandomPiece();
      this.nextPiece = this.getRandomPiece();
      this.draw();
      this.drawNextPiece();
      this.gameInterval = setInterval(this.dropPiece, this.dropInterval);
      window.addEventListener('keydown', this.handleKeyPress);
      console.log('Game started!');
    },
    initBoard() {
      this.board = Array(this.boardHeight)
        .fill(0)
        .map(() => Array(this.boardWidth).fill(0));
    },
    getRandomPiece() {
      const keys = Object.keys(this.tetrominoes);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const piece = JSON.parse(JSON.stringify(this.tetrominoes[randomKey])); // Deep copy
      piece.x = Math.floor(this.boardWidth / 2) - Math.floor(piece.shape[0].length / 2);
      piece.y = 0;
      return piece;
    },
    draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // Draw board
      for (let row = 0; row < this.boardHeight; row++) {
        for (let col = 0; col < this.boardWidth; col++) {
          if (this.board[row][col]) {
            this.drawBlock(col, row, this.board[row][col]);
          }
        }
      }
      // Draw current piece
      if (this.currentPiece) {
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
          for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
            if (this.currentPiece.shape[row][col]) {
              this.drawBlock(
                this.currentPiece.x + col,
                this.currentPiece.y + row,
                this.currentPiece.color
              );
            }
          }
        }
      }
    },
    drawBlock(x, y, color) {
      const px = x * this.blockSize;
      const py = y * this.blockSize;

      // Main block color
      this.ctx.fillStyle = color;
      this.ctx.fillRect(px, py, this.blockSize, this.blockSize);

      // 3D effect
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'; // Lighter shade for top/left
      this.ctx.fillRect(px, py, this.blockSize, 2); // Top highlight
      this.ctx.fillRect(px, py, 2, this.blockSize); // Left highlight

      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Darker shade for bottom/right
      this.ctx.fillRect(px + this.blockSize - 2, py, 2, this.blockSize); // Right shadow
      this.ctx.fillRect(px, py + this.blockSize - 2, this.blockSize, 2); // Bottom shadow

      // Border
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.strokeRect(px, py, this.blockSize, this.blockSize);
    },
    drawNextPiece() {
      this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
      if (this.nextPiece) {
        const shape = this.nextPiece.shape;
        const color = this.nextPiece.color;
        for (let row = 0; row < shape.length; row++) {
          for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
              this.nextCtx.fillStyle = color;
              this.nextCtx.fillRect(
                col * (this.blockSize / 2),
                row * (this.blockSize / 2),
                this.blockSize / 2,
                this.blockSize / 2
              );
              this.nextCtx.strokeStyle = 'black';
              this.nextCtx.strokeRect(
                col * (this.blockSize / 2),
                row * (this.blockSize / 2),
                this.blockSize / 2,
                this.blockSize / 2
              );
            }
          }
        }
      }
    },
    isValidMove(newX, newY, newShape) {
      for (let row = 0; row < newShape.length; row++) {
        for (let col = 0; col < newShape[row].length; col++) {
          if (newShape[row][col]) {
            const boardX = newX + col;
            const boardY = newY + row;
            if (
              boardX < 0 ||
              boardX >= this.boardWidth ||
              boardY >= this.boardHeight ||
              (boardY >= 0 && this.board[boardY][boardX])
            ) {
              return false;
            }
          }
        }
      }
      return true;
    },
    dropPiece() {
      if (this.isValidMove(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.shape)) {
        this.currentPiece.y++;
      } else {
        this.lockPiece();
        this.clearLines();
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.getRandomPiece();
        this.drawNextPiece();
        this.canHold = true; // Allow hold again after piece locks
        if (!this.isValidMove(this.currentPiece.x, this.currentPiece.y, this.currentPiece.shape)) {
          this.gameOver();
          return;
        }
      }
      this.draw();
    },
    lockPiece() {
      for (let row = 0; row < this.currentPiece.shape.length; row++) {
        for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
          if (this.currentPiece.shape[row][col]) {
            const boardX = this.currentPiece.x + col;
            const boardY = this.currentPiece.y + row;
            if (boardY >= 0) {
              this.board[boardY][boardX] = this.currentPiece.color;
            }
          }
        }
      }
    },
    clearLines() {
      let linesCleared = 0;
      for (let row = this.boardHeight - 1; row >= 0; row--) {
        if (this.board[row].every((cell) => cell !== 0)) {
          this.board.splice(row, 1);
          this.board.unshift(Array(this.boardWidth).fill(0));
          linesCleared++;
          row++; // Check the new row at the same index
        }
      }
      if (linesCleared > 0) {
        this.score += linesCleared * 100; // Simple scoring
      }
    },
    rotatePiece() {
      const originalShape = this.currentPiece.shape;
      const rotatedShape = originalShape[0].map((_, index) =>
        originalShape.map((row) => row[originalShape.length - 1 - index])
      );

      // Try to rotate in place
      if (this.isValidMove(this.currentPiece.x, this.currentPiece.y, rotatedShape)) {
        this.currentPiece.shape = rotatedShape;
      } else {
        // Simple wall kick attempts
        const kickOffsets = [-1, 1, -2, 2]; // Try moving left/right by 1 or 2 blocks
        for (const offset of kickOffsets) {
          if (this.isValidMove(this.currentPiece.x + offset, this.currentPiece.y, rotatedShape)) {
            this.currentPiece.x += offset;
            this.currentPiece.shape = rotatedShape;
            break;
          }
        }
      }
      this.draw();
    },
    hardDrop() {
      while (this.isValidMove(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.shape)) {
        this.currentPiece.y++;
      }
      this.dropPiece(); // This will lock the piece and handle next steps
    },
    holdPiece() {
      if (!this.canHold) return;

      clearInterval(this.gameInterval); // Pause game loop

      if (this.heldPiece) {
        // Swap current piece with held piece
        const temp = this.currentPiece;
        this.currentPiece = this.heldPiece;
        this.heldPiece = temp;
        // Reset position of the swapped piece
        this.currentPiece.x = Math.floor(this.boardWidth / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
        this.currentPiece.y = 0;
      } else {
        // Hold current piece and get a new one
        this.heldPiece = this.currentPiece;
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.getRandomPiece();
        this.drawNextPiece();
      }
      this.canHold = false; // Can only hold once per turn
      this.draw();
      this.gameInterval = setInterval(this.dropPiece, this.dropInterval); // Resume game loop
    },
    handleKeyPress(event) {
      if (!this.currentPiece) return;

      let newX = this.currentPiece.x;
      let newY = this.currentPiece.y;
      let newShape = this.currentPiece.shape;

      switch (event.key) {
        case 'ArrowLeft':
          newX--;
          event.preventDefault(); // Prevent default scroll
          break;
        case 'ArrowRight':
          newX++;
          event.preventDefault(); // Prevent default scroll
          break;
        case 'ArrowDown':
          newY++;
          event.preventDefault(); // Prevent default scroll
          break;
        case 'ArrowUp':
          this.rotatePiece();
          event.preventDefault(); // Prevent default scroll
          return; // Rotation handles its own draw
        case ' ': // Spacebar for hard drop
          this.hardDrop();
          event.preventDefault();
          return;
        case 'c': // 'c' for hold
        case 'C':
          this.holdPiece();
          event.preventDefault();
          return;
        default:
          return;
      }

      if (this.isValidMove(newX, newY, newShape)) {
        this.currentPiece.x = newX;
        this.currentPiece.y = newY;
      }
      this.draw();
    },
    gameOver() {
      clearInterval(this.gameInterval);
      window.removeEventListener('keydown', this.handleKeyPress);
      alert('Game Over! Your score: ' + this.score);
      // Optionally reset game or show a restart button
    },
    resizeGame() {
      const gameArea = this.$el.querySelector('.game-area');
      if (!gameArea) return;

      const availableWidth = gameArea.clientWidth - 40; // Subtract padding
      const availableHeight = gameArea.clientHeight - 40; // Subtract padding

      // Calculate blockSize based on available space and board dimensions
      // We want to fit both the main board and leave space for the info panel
      // Let's assume info panel takes about 150px width + gap
      const maxBlockSizeX = (availableWidth - 150) / this.boardWidth;
      const maxBlockSizeY = availableHeight / this.boardHeight;

      this.blockSize = Math.floor(Math.min(maxBlockSizeX, maxBlockSizeY));

      // Ensure a minimum block size
      if (this.blockSize < 10) {
        this.blockSize = 10;
      }

      this.canvas.width = this.boardWidth * this.blockSize;
      this.canvas.height = this.boardHeight * this.blockSize;

      // Adjust next piece canvas size
      this.nextCanvas.width = 4 * (this.blockSize / 2);
      this.nextCanvas.height = 4 * (this.blockSize / 2);

      this.draw();
      this.drawNextPiece();
    },
  },
  mounted() {
    this.canvas = document.getElementById('tetris-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.nextCanvas = document.getElementById('next-piece-canvas');
    this.nextCtx = this.nextCanvas.getContext('2d');

    // Initial setup and resize
    this.resizeGame();
    window.addEventListener('resize', this.resizeGame);

    // Initial draw (empty board)
    this.draw();
  },
  beforeUnmount() {
    clearInterval(this.gameInterval);
    window.removeEventListener('keydown', this.handleKeyPress);
    window.removeEventListener('resize', this.resizeGame); // Remove resize listener
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.tetris-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #1a1a1a; /* Dark background */
  min-height: 100vh;
  font-family: 'Press Start 2P', cursive; /* Retro font */
}

h1 {
  color: #e0e0e0;
  text-shadow: 2px 2px 4px #000;
  margin-bottom: 20px;
  font-size: 2.5em;
}

.game-area {
  display: flex;
  gap: 30px;
  background-color: #2c2c2c; /* Darker panel background */
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  padding: 25px;
  border: 3px solid #444;
}

#tetris-canvas {
  border: 5px solid #000;
  background-color: #0d0d0d; /* Very dark canvas background */
  border-radius: 5px;
  box-shadow: inset 0 0 10px #000;
}

.info-panel {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center; /* Center content */
  gap: 20px;
  padding: 20px;
  border: 3px solid #444;
  border-radius: 10px;
  background-color: #1a1a1a;
  width: 150px; /* Fixed width for the panel */
}

.score,
.next-piece {
  font-size: 1em;
  font-weight: normal;
  color: #00ffde; /* Neon text color */
  text-align: center;
}

.score-value {
  font-size: 1.5em;
  color: #fff;
  margin-top: 5px;
}

#next-piece-canvas {
  border: 2px solid #555;
  background-color: #0d0d0d;
  border-radius: 5px;
  box-shadow: inset 0 0 5px #000;
}

button {
  padding: 15px 10px;
  width: 100%;
  background: linear-gradient(45deg, #ff00ff, #00ffde);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Press Start 2P', cursive;
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

/* Adding a class to the score display for better styling */
.score {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
