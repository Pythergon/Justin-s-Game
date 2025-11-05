// Get Canvas Details
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const button = document.getElementById("myButton");
const stopButton = document.getElementById("Stop");

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getCoinPos(num) {
    return 20 + Math.floor(Math.random() * num - 20);
}

class Game {
    constructor(drawCanvas) {
        this.drawCanvas = drawCanvas;
        this.currentTime = 0;
        this.player = undefined;
        this.coins = [];
        this.running = true;
        // Stage information
        this.stageTime = 25;
        this.won = false;
    }

    handleInput() {
        const playerSpeed = 1.6;
        if (
            (this.player.worldX <= 0) || // Left
            (this.player.worldX >= 80 - (this.player.width / 10)) || // Right
            (this.player.worldY <= 0) || // Top
            (this.player.worldY >= 60 - (this.player.height / 10)) // Bottom
        ) {
            console.log("Touched Wall in Handle Input");
            this.player.touchingWall = true;
        } else {
            this.player.touchingWall = false;
        }

        if (this.player.touchingWall) {
            if (keyState['d']) {
                this.player.Xvelocity = 1 * playerSpeed;
                this.player.Yvelocity = 0;
            } else if (keyState['a']) {
                this.player.Xvelocity = -1 * playerSpeed;
                this.player.Yvelocity = 0;
            } else if (keyState['w']){
                this.player.Xvelocity = 0;
                this.player.Yvelocity = 1 * playerSpeed;
            } else if (keyState['s']) {
                this.player.Xvelocity = 0;
                this.player.Yvelocity = -1 * playerSpeed;
            }
        }
    }

    update(deltaTime) {
        // Check if won!
        if (this.player.coinCount >= this.coins.length) {
            this.won = true;
            console.log("you won!");
        }

        // Update Time
        this.currentTime += deltaTime;
        this.stageTime -= deltaTime;

        // Update Player Position
        this.player.worldX += this.player.Xvelocity;
        this.player.worldY += this.player.Yvelocity;

        // Left-Right Border collision detection
        if (this.player.worldX < 0) { // Left
            this.player.worldX = 0;
            this.player.Xvelocity = -this.player.Xvelocity;
        } else if (this.player.worldX > 80 - (this.player.width / 10)) { // Right
            this.player.worldX = 80 - (this.player.width / 10);
            this.player.Xvelocity = -this.player.Xvelocity;
        }

        // Top-Bottom Border collision detection
        if (this.player.worldY < 0) {
            this.player.worldY = 0;
            this.player.Yvelocity = -this.player.Yvelocity;
        } else if (this.player.worldY > 60 - (this.player.height / 10)) {
            this.player.worldY = 60 - (this.player.height / 10);
            this.player.Yvelocity = -this.player.Yvelocity;
        }

        // Coin Collecting
        for (let i = 0; i < this.coins.length; i++) {
            if (
                (!this.coins[i].collected) &&
                (this.coins[i].centerX >= this.player.pixelX) &&
                (this.coins[i].centerX <= this.player.pixelX + this.player.width) &&
                (this.coins[i].centerY >= this.player.pixelY) &&
                (this.coins[i].centerY <= this.player.pixelY + this.player.height)
        ) {
                this.coins[i].render = false;
                this.coins[i].collected = true;
                this.player.coinCount++;
            }
        }

        // Convert player world position to pixel position
        this.player.pixelX = this.player.worldX * 10;
        this.player.pixelY = (600 - this.player.worldY * 10) - this.player.height;
    }

    render() {
        this.drawCanvas.clearRect(0, 0, canvas.width, canvas.height);
        this.drawCanvas.fillStyle = 'black';
        this.drawCanvas.font = "bold 32px Arial";
        // this.drawCanvas.fillText(`Time Elapsed (seconds): ${Number(this.currentTime.toFixed(2))}`, 10, 30);
        this.drawCanvas.fillText(`Seconds Left: ${Number(this.stageTime.toFixed(1))}`, 10, 30);
        this.drawCanvas.fillText(`Coins Collected: ${this.player.coinCount} / ${this.coins.length}`, 400, 30);
        if (this.won) {
            this.drawCanvas.font = "128px Arial";
            this.drawCanvas.fillText("You Won!", 150, 300);
        }
        if (this.stageTime <= 0) {
            this.drawCanvas.font = "128px Arial";
            this.drawCanvas.fillText("You Lost!", 150, 300);
            this.running = false;
        }
        for (let i = 0; i < this.coins.length; i++) {
            this.coins[i].draw(this.drawCanvas);
        }
        this.player.draw(this.drawCanvas);
    }
}

class Coin {
    constructor(game, pixelX, pixelY) {
        // Positional Data
        this.pixelX = pixelX;
        this.pixelY = pixelY;
        this.centerX = pixelX + (10 / 2);
        this.centerY = pixelY + (10 / 2);
        // Image Data
        this.img = new Image();
        this.img.src = 'coin.png';
        // Collection Data
        this.render = true;
        this.collected = false;
        // Add to coins list in the game class so that it may be used throughout the game class functions
        game.coins.push(this);
    }

    draw(drawCanvas) {
        if (this.render) {
            drawCanvas.drawImage(this.img, this.pixelX, this.pixelY);
        }
    }
}

class Player {
    constructor(game, worldX, worldY) {
        // Positional Data
        this.worldX = worldX;
        this.worldY = worldY;
        this.width = 65;
        this.height = 65;
        this.pixelX = worldX * 10; // math
        this.pixelY = (600 - worldY * 10) - this.height; // math
        this.touchingWall = false;
        // Velocity Data
        this.Xvelocity = 0;
        this.Yvelocity = 0;
        // Coin data
        this.coinCount = 0;
        // Picture Data
        this.img = new Image();
        this.img.src = 'character2.png';
        // Add player to game and game state
        game.player = this;
    }

    draw(drawCanvas) {
        // drawCanvas.fillStyle = 'red';
        // drawCanvas.fillRect(this.pixelX, this.pixelY, this.width, this.height);
        drawCanvas.drawImage(this.img, this.pixelX, this.pixelY);
    }
}

// Key Press Logic
const keyState = {};
document.addEventListener('keydown', (event) => {
    keyState[event.key] = true;
});
document.addEventListener('keyup', (event) => {
    keyState[event.key] = false;
});

// Initialize
var myGame = new Game(ctx);
var myPlayer = new Player(myGame, 10, 0);

for (let i = 0; i < 10; i++) {
    let newCoin = new Coin(myGame, getCoinPos(800), getCoinPos(600));
    // newCoin.render = false;
}

// Initial Render
myGame.render();

// Game Loop
let lastTime = 0;
function gameLoop(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    myGame.handleInput();
    myGame.update(deltaTime);
    myGame.render();

    // Re-queue the game loop
    if (!myGame.won && myGame.running) {
        requestAnimationFrame(gameLoop);
    }
}

// Start the loop
// requestAnimationFrame(gameLoop);
// With button
button.addEventListener('click', event => {
    requestAnimationFrame(gameLoop);
    myPlayer.Xvelocity = 1;
});

stopButton.addEventListener('click', event => {
    myGame.running = false;
})

