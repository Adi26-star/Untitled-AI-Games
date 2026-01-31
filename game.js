// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Game state
let gameWon = false;

// Player object
const player = {
    x: 50,
    y: 300,
    width: 30,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    jumpPower: 15,
    onGround: false,
    color: '#FF6B6B'
};

// Physics constants
const gravity = 0.8;
const friction = 0.9;

// Platforms array
const platforms = [
    { x: 0, y: 550, width: 200, height: 50, color: '#8B4513' },
    { x: 250, y: 500, width: 150, height: 50, color: '#8B4513' },
    { x: 450, y: 450, width: 150, height: 50, color: '#8B4513' },
    { x: 650, y: 400, width: 150, height: 50, color: '#8B4513' },
    { x: 200, y: 350, width: 100, height: 50, color: '#8B4513' },
    { x: 350, y: 300, width: 100, height: 50, color: '#8B4513' },
    { x: 500, y: 250, width: 100, height: 50, color: '#8B4513' },
    { x: 650, y: 200, width: 100, height: 50, color: '#8B4513' },
    { x: 750, y: 100, width: 50, height: 50, color: '#8B4513' }
];

// Goal flag
const goal = {
    x: 750,
    y: 50,
    width: 30,
    height: 50,
    color: '#4CAF50'
};

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

// Check if player is on a platform
function checkPlatformCollision() {
    player.onGround = false;
    
    for (let platform of platforms) {
        if (checkCollision(player, platform)) {
            // Check if player is above the platform (falling onto it)
            if (player.velocityY > 0 && player.y < platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;
            }
            // Check if player hits platform from below
            else if (player.velocityY < 0 && player.y + player.height > platform.y) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
            // Check side collisions
            else if (player.velocityX > 0) {
                player.x = platform.x - player.width;
                player.velocityX = 0;
            }
            else if (player.velocityX < 0) {
                player.x = platform.x + platform.width;
                player.velocityX = 0;
            }
        }
    }
    
    // Ground collision
    if (player.y + player.height >= canvas.height - 50) {
        player.y = canvas.height - 50 - player.height;
        player.velocityY = 0;
        player.onGround = true;
    }
}

// Update game state
function update() {
    if (gameWon) return;
    
    // Handle input
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.velocityX = -player.speed;
    } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.velocityX = player.speed;
    } else {
        player.velocityX *= friction;
    }
    
    // Jumping
    if ((keys['ArrowUp'] || keys['w'] || keys['W'] || keys[' ']) && player.onGround) {
        player.velocityY = -player.jumpPower;
        player.onGround = false;
    }
    
    // Apply gravity
    player.velocityY += gravity;
    
    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Check collisions
    checkPlatformCollision();
    
    // Boundary checks
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    
    // Check if player reached the goal
    if (checkCollision(player, goal)) {
        gameWon = true;
        document.getElementById('gameOver').classList.remove('hidden');
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
    ctx.fillRect(10, 10, 200, 60);
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText('Arrow Keys or WASD', 20, 30);
    ctx.fillText('Reach the green flag!', 20, 50);
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
