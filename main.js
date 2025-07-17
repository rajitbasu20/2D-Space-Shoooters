// 2D Space Shooter using Three.js - Mobile Compatible

// --- Game Constants ---
let GAME_WIDTH = window.innerWidth;
let GAME_HEIGHT = window.innerHeight;
const PLAYER_SPEED = 8;
const BULLET_SPEED = 12;
const ENEMY_SPEED = 2;
const ENEMY_SPAWN_INTERVAL = 60; // frames

// --- Three.js Setup ---
const scene = new THREE.Scene();
let camera, renderer;

// --- Game State ---
let player, bullets = [], enemies = [], score = 0, gameOver = false;
let frameCount = 0;
let isMobile = window.innerWidth <= 768;

// --- UI Elements ---
const scoreDiv = document.getElementById('score');
const gameOverDiv = document.getElementById('gameOver');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const shootBtn = document.getElementById('shootBtn');

// --- Input Handling ---
const keys = {};
const touchControls = {
  left: false,
  right: false,
  shoot: false
};

// Keyboard events
document.addEventListener('keydown', (e) => { 
  keys[e.code] = true; 
  e.preventDefault();
});
document.addEventListener('keyup', (e) => { 
  keys[e.code] = false; 
  e.preventDefault();
});

// Touch events for mobile controls
function setupTouchControls() {
  if (!isMobile) return;
  
  // Left button
  leftBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchControls.left = true;
  });
  leftBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    touchControls.left = false;
  });
  
  // Right button
  rightBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchControls.right = true;
  });
  rightBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    touchControls.right = false;
  });
  
  // Shoot button
  shootBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchControls.shoot = true;
  });
  shootBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    touchControls.shoot = false;
  });
  
  // Prevent context menu on long press
  [leftBtn, rightBtn, shootBtn].forEach(btn => {
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  });
}

// --- Responsive Setup ---
function setupResponsive() {
  GAME_WIDTH = window.innerWidth;
  GAME_HEIGHT = window.innerHeight;
  isMobile = GAME_WIDTH <= 768;
  
  // Update camera
  camera.left = GAME_WIDTH / -2;
  camera.right = GAME_WIDTH / 2;
  camera.top = GAME_HEIGHT / 2;
  camera.bottom = GAME_HEIGHT / -2;
  camera.updateProjectionMatrix();
  
  // Update renderer
  renderer.setSize(GAME_WIDTH, GAME_HEIGHT);
  
  // Update player position if exists
  if (player) {
    player.position.y = -GAME_HEIGHT / 2 + 40;
  }
}

// --- Player Setup ---
function createPlayer() {
  const geometry = new THREE.BoxGeometry(40, 20, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00fffc });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, -GAME_HEIGHT / 2 + 40, 0);
  scene.add(mesh);
  return mesh;
}

// --- Bullet Setup ---
function createBullet(x, y) {
  const geometry = new THREE.BoxGeometry(6, 16, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y + 20, 0);
  scene.add(mesh);
  return mesh;
}

// --- Enemy Setup ---
function createEnemy() {
  const geometry = new THREE.BoxGeometry(36, 18, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0033 });
  const mesh = new THREE.Mesh(geometry, material);
  const x = Math.random() * (GAME_WIDTH - 60) - (GAME_WIDTH / 2 - 30);
  mesh.position.set(x, GAME_HEIGHT / 2 - 30, 0);
  scene.add(mesh);
  return mesh;
}

// --- Shooting ---
let canShoot = true;
function handleShooting() {
  const shouldShoot = (keys['Space'] || keys['ArrowUp'] || touchControls.shoot) && canShoot && !gameOver;
  
  if (shouldShoot) {
    bullets.push(createBullet(player.position.x, player.position.y));
    canShoot = false;
  }
  
  if (!keys['Space'] && !keys['ArrowUp'] && !touchControls.shoot) {
    canShoot = true;
  }
}

// --- Collision Detection ---
function isColliding(a, b, ax, ay, bx, by) {
  ax = ax !== undefined ? ax : a.position.x;
  ay = ay !== undefined ? ay : a.position.y;
  bx = bx !== undefined ? bx : b.position.x;
  by = by !== undefined ? by : b.position.y;
  return (
    Math.abs(ax - bx) < 30 &&
    Math.abs(ay - by) < 20
  );
}

// --- Game Loop ---
function animate() {
  if (gameOver) return;
  requestAnimationFrame(animate);
  frameCount++;

  // Player movement
  const moveLeft = keys['ArrowLeft'] || keys['KeyA'] || touchControls.left;
  const moveRight = keys['ArrowRight'] || keys['KeyD'] || touchControls.right;
  
  if (moveLeft) {
    player.position.x = Math.max(player.position.x - PLAYER_SPEED, -GAME_WIDTH / 2 + 20);
  }
  if (moveRight) {
    player.position.x = Math.min(player.position.x + PLAYER_SPEED, GAME_WIDTH / 2 - 20);
  }

  handleShooting();

  // Move bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].position.y += BULLET_SPEED;
    if (bullets[i].position.y > GAME_HEIGHT / 2) {
      scene.remove(bullets[i]);
      bullets.splice(i, 1);
    }
  }

  // Spawn enemies
  if (frameCount % ENEMY_SPAWN_INTERVAL === 0) {
    enemies.push(createEnemy());
  }

  // Move enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].position.y -= ENEMY_SPEED;
    // Check collision with player
    if (isColliding(enemies[i], player)) {
      endGame();
      return;
    }
    // Remove if off screen
    if (enemies[i].position.y < -GAME_HEIGHT / 2 - 20) {
      scene.remove(enemies[i]);
      enemies.splice(i, 1);
    }
  }

  // Bullet-enemy collisions
  for (let i = bullets.length - 1; i >= 0; i--) {
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (isColliding(bullets[i], enemies[j])) {
        scene.remove(bullets[i]);
        scene.remove(enemies[j]);
        bullets.splice(i, 1);
        enemies.splice(j, 1);
        score++;
        scoreDiv.textContent = `Score: ${score}`;
        break;
      }
    }
  }

  renderer.render(scene, camera);
}

function endGame() {
  gameOver = true;
  gameOverDiv.style.display = 'block';
}

// --- Init ---
function init() {
  // Setup Three.js
  camera = new THREE.OrthographicCamera(
    GAME_WIDTH / -2, GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_HEIGHT / -2, 0.1, 1000
  );
  camera.position.z = 10;
  
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(GAME_WIDTH, GAME_HEIGHT);
  renderer.setClearColor(0x000000);
  document.getElementById('gameContainer').appendChild(renderer.domElement);
  
  // Setup touch controls
  setupTouchControls();
  
  // Setup responsive handling
  window.addEventListener('resize', setupResponsive);
  window.addEventListener('orientationchange', () => {
    setTimeout(setupResponsive, 100);
  });
  
  // Create player and start game
  player = createPlayer();
  animate();
}

// Prevent default touch behaviors
document.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

init(); 
