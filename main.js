// 2D Space Shooter using Three.js

// --- Game Constants ---
const GAME_WIDTH = 480;
const GAME_HEIGHT = 720;
const PLAYER_SPEED = 8;
const BULLET_SPEED = 12;
const ENEMY_SPEED = 2;
const ENEMY_SPAWN_INTERVAL = 60; // frames

// --- Three.js Setup ---
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
  GAME_WIDTH / -2, GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_HEIGHT / -2, 0.1, 1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(GAME_WIDTH, GAME_HEIGHT);
document.body.appendChild(renderer.domElement);

// --- Game State ---
let player, bullets = [], enemies = [], score = 0, gameOver = false;
let frameCount = 0;

// --- UI Elements ---
const scoreDiv = document.getElementById('score');
const gameOverDiv = document.getElementById('gameOver');

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

// --- Input Handling ---
const keys = {};
document.addEventListener('keydown', (e) => { keys[e.code] = true; });
document.addEventListener('keyup', (e) => { keys[e.code] = false; });

// --- Shooting ---
let canShoot = true;
function handleShooting() {
  if ((keys['Space'] || keys['ArrowUp']) && canShoot && !gameOver) {
    bullets.push(createBullet(player.position.x, player.position.y));
    canShoot = false;
  }
  if (!keys['Space'] && !keys['ArrowUp']) {
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
  if (keys['ArrowLeft'] || keys['KeyA']) {
    player.position.x = Math.max(player.position.x - PLAYER_SPEED, -GAME_WIDTH / 2 + 20);
  }
  if (keys['ArrowRight'] || keys['KeyD']) {
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
  camera.position.z = 10;
  player = createPlayer();
  animate();
}

init(); 