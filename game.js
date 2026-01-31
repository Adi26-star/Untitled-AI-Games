// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Game state
let gameWon = false;
let currentLevel = 1;
const totalLevels = 2;

// Player object
const player = {
    x: 50,
    y: 300,
    width: 30,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    maxSpeed: 8,
    acceleration: 0.5,
    deceleration: 0.3,
    jumpPower: 15,
    onGround: false,
    color: '#FF6B6B'
};

// Physics constants
const gravity = 0.8;
const friction = 0.85;

// Level data
const levels = [
    // Level 1: Plain with flag on the right
    {
        platforms: [],
        goal: { x: 750, y: 500, width: 30, height: 50, color: '#4CAF50' }
    },
    // Level 2: Two stair blocks with flag on the last block at the rightmost edge
    {
        platforms: [
            { x: 300, y: 500, width: 200, height: 100, color: '#8B4513' },
            { x: 500, y: 450, width: 300, height: 100, color: '#8B4513' }
        ],
        goal: { x: 770, y: 400, width: 30, height: 50, color: '#4CAF50' }
    }
];

// Current level data
let platforms = [];
let goal = { x: 750, y: 500, width: 30, height: 50, color: '#4CAF50' };

// Load level function
function loadLevel(levelNumber) {
    if (levelNumber > totalLevels) {
        gameWon = true;
        document.getElementById('gameOver').classList.remove('hidden');
        return;
    }
    
    currentLevel = levelNumber;
    const levelData = levels[levelNumber - 1];
    platforms = levelData.platforms.map(p => ({ ...p }));
    goal = { ...levelData.goal };
    
    // Reset player position
    player.x = 50;
    player.y = 300;
    player.velocityX = 0;
    player.velocityY = 0;
    player.onGround = false;
    
    // Hide win screen if showing
    document.getElementById('gameOver').classList.add('hidden');
    gameWon = false;
}

// Input handling
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Check horizontal collision with a platform
function checkHorizontalCollision(platform) {
    return player.x < platform.x + platform.width &&
           player.x + player.width > platform.x &&
           player.y < platform.y + platform.height &&
           player.y + player.height > platform.y;
}

// Check vertical collision with a platform
function checkVerticalCollision(platform) {
    return player.x < platform.x + platform.width &&
           player.x + player.width > platform.x &&
           player.y < platform.y + platform.height &&
           player.y + player.height > platform.y;
}

// Update game state
function update() {
    if (gameWon) return;
    
    // Handle input with acceleration
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        // Accelerate left
        player.velocityX -= player.acceleration;
        if (player.velocityX < -player.maxSpeed) {
            player.velocityX = -player.maxSpeed;
        }
    } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        // Accelerate right
        player.velocityX += player.acceleration;
        if (player.velocityX > player.maxSpeed) {
            player.velocityX = player.maxSpeed;
        }
    } else {
        // Decelerate when no input
        if (player.velocityX > 0) {
            player.velocityX -= player.deceleration;
            if (player.velocityX < 0) player.velocityX = 0;
        } else if (player.velocityX < 0) {
            player.velocityX += player.deceleration;
            if (player.velocityX > 0) player.velocityX = 0;
        }
        // Apply friction when on ground
        if (player.onGround) {
            player.velocityX *= friction;
        }
    }
    
    // Jumping
    if ((keys['ArrowUp'] || keys['w'] || keys['W'] || keys[' ']) && player.onGround) {
        player.velocityY = -player.jumpPower;
        player.onGround = false;
    }
    
    // Apply gravity
    player.velocityY += gravity;
    
    // Update X position first and check horizontal collisions
    player.x += player.velocityX;
    for (let platform of platforms) {
        if (checkHorizontalCollision(platform)) {
            // Moving right into platform
            if (player.velocityX > 0) {
                player.x = platform.x - player.width;
                player.velocityX = 0;
            }
            // Moving left into platform
            else if (player.velocityX < 0) {
                player.x = platform.x + platform.width;
                player.velocityX = 0;
            }
        }
    }
    
    // Update Y position and check vertical collisions
    player.y += player.velocityY;
    for (let platform of platforms) {
        if (checkVerticalCollision(platform)) {
            // Falling onto platform from above
            if (player.velocityY > 0 && player.y < platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;
            }
            // Hitting platform from below
            else if (player.velocityY < 0 && player.y + player.height > platform.y) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
        }
    }
    
    // Check ground collision
    if (player.y + player.height >= canvas.height - 50) {
        player.y = canvas.height - 50 - player.height;
        player.velocityY = 0;
        player.onGround = true;
    }
    
    // Boundary checks
    if (player.x < 0) {
        player.x = 0;
        player.velocityX = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
        player.velocityX = 0;
    }
    
    // Check if player reached the goal
    if (checkCollision(player, goal)) {
        if (currentLevel < totalLevels) {
            // Advance to next level
            loadLevel(currentLevel + 1);
        } else {
            // All levels completed
            gameWon = true;
            const winMessage = document.getElementById('winMessage');
            winMessage.textContent = 'All Levels Complete!';
            document.getElementById('gameOver').classList.remove('hidden');
        }
    }
}

// Render game
function render() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    
    // Draw platforms
    platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        // Add a border for better visibility
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    });
    
    // Draw goal flag
    ctx.fillStyle = goal.color;
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
    // Draw flag pole
    ctx.fillStyle = '#333';
    ctx.fillRect(goal.x + 10, goal.y, 5, goal.height);
    // Draw flag
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.moveTo(goal.x + 15, goal.y);
    ctx.lineTo(goal.x + 15, goal.y + 20);
    ctx.lineTo(goal.x + 30, goal.y + 10);
    ctx.closePath();
    ctx.fill();
    
    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // Add eyes for character
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 5, player.y + 10, 5, 5);
    ctx.fillRect(player.x + 20, player.y + 10, 5, 5);
    
    // Draw instructions overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 200, 80);
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText('Arrow Keys or WASD', 20, 30);
    ctx.fillText('Reach the green flag!', 20, 50);
    ctx.fillText(`Level ${currentLevel}/${totalLevels}`, 20, 70);
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Initialize and start the game
loadLevel(1);
gameLoop();
