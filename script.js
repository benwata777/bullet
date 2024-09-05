const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ขนาดของเฟรมแต่ละตัวละคร
const frameWidth = 48;
const frameHeight = 48;

// ตัวละคร
const player = {
  x: 50,
  y: 50,
  width: frameWidth,
  height: frameHeight,
  speed: 5,
  frameX: 0,
  frameY: 0,
  sprite: new Image(),
  moving: false,
  health: 100,
};

player.sprite.src = "assets/images/sketch1694440010910.png";

// กระสุน
const bullets = [];
let bulletSpeed = 3;
let bulletInterval = 2000; // Interval สำหรับการยิงกระสุน (มิลลิวินาที)
let bulletsPerInterval = 1; // จำนวนกระสุนที่ยิงออกไปในแต่ละครั้ง

let startTime = Date.now(); // เวลาที่เริ่มเกม
let highScore = parseInt(localStorage.getItem("highScore")) || 0; // โหลดคะแนนสูงสุดจาก localStorage
let score = 0; // คะแนนปัจจุบัน

// บอส
const boss = {
  x: canvas.width / 2 - 48, // ตำแหน่งเริ่มต้นของบอส
  y: -96, // เริ่มต้นนอกจอ
  width: 96,
  height: 96,
  sprite: new Image(),
  appearing: false,
  frameX: 0,
  frameY: 0,
  speed: 2,
  bulletSize: 10, // ขนาดของกระสุนบอส
};

boss.sprite.src = "assets/images/boss.png";

// อัปเดตการแสดงผล HP
function updateHPDisplay() {
  const hpDisplay = document.getElementById("hpDisplay");
  hpDisplay.textContent = `HP: ${player.health}`;
}

// อัปเดตการแสดงผลคะแนน
function updateScoreDisplay() {
  const scoreDisplay = document.getElementById("scoreDisplay");
  scoreDisplay.textContent = `Score: ${score}`;
}

// อัปเดตการแสดงผลคะแนนสูงสุด
function updateHighScoreDisplay() {
  const highScoreDisplay = document.getElementById("highScoreDisplay");
  highScoreDisplay.textContent = `High Score: ${highScore}`;
}

// วาดตัวละคร
function drawPlayer() {
  ctx.drawImage(
    player.sprite,
    player.frameX * frameWidth,
    player.frameY * frameHeight,
    frameWidth,
    frameHeight,
    player.x,
    player.y,
    player.width,
    player.height
  );
}

// วาดกระสุน
function drawBullets() {
  ctx.fillStyle = "red"; // สีของกระสุน
  for (let bullet of bullets) {
    ctx.fillRect(bullet.x, bullet.y, bullet.size, bullet.size); // ขนาดของกระสุน
  }
}

// วาดบอส
function drawBoss() {
  if (boss.appearing) {
    ctx.drawImage(
      boss.sprite,
      boss.frameX * frameWidth,
      boss.frameY * frameHeight,
      frameWidth,
      frameHeight,
      boss.x,
      boss.y,
      boss.width,
      boss.height
    );
  }
}

// สร้างกระสุนพิเศษของบอส
function shootBossBullets() {
  const bulletPatterns = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
    { dx: 0.7, dy: 0.7 },
    { dx: -0.7, dy: -0.7 },
    { dx: 0.7, dy: -0.7 },
    { dx: -0.7, dy: 0.7 },
  ];

  for (let pattern of bulletPatterns) {
    const bullet = {
      x: boss.x + boss.width / 2,
      y: boss.y + boss.height / 2,
      dx: pattern.dx * 4, // ขนาดของกระสุนบอส
      dy: pattern.dy * 4,
      size: boss.bulletSize,
    };

    bullets.push(bullet);
  }
}

// อัปเดตตำแหน่งของบอส
function updateBoss() {
  if (boss.appearing) {
    if (boss.y < canvas.height / 2 - boss.height / 2) {
      boss.y += boss.speed;
    } else {
      const dx = player.x + player.width / 2 - (boss.x + boss.width / 2);
      const dy = player.y + player.height / 2 - (boss.y + boss.height / 2);
      const magnitude = Math.sqrt(dx * dx + dy * dy);
      const normalizedDx = dx / magnitude;
      const normalizedDy = dy / magnitude;

      boss.x += normalizedDx * boss.speed;
      boss.y += normalizedDy * boss.speed;

      if (!boss.lastShootTime) {
        boss.lastShootTime = Date.now();
      }

      if (Date.now() - boss.lastShootTime > 2000) {
        shootBossBullets();
        boss.lastShootTime = Date.now();
      }
    }
  }
}

// อัปเดตเกม
function update() {
  player.moving = false;

  if (keys.ArrowUp && player.y > 0) {
    player.y -= player.speed;
    player.frameY = 3;
    player.moving = true;
  }
  if (keys.ArrowDown && player.y + player.height < canvas.height) {
    player.y += player.speed;
    player.frameY = 0;
    player.moving = true;
  }
  if (keys.ArrowLeft && player.x > 0) {
    player.x -= player.speed;
    player.frameY = 1;
    player.moving = true;
  }
  if (keys.ArrowRight && player.x + player.width < canvas.width) {
    player.x += player.speed;
    player.frameY = 2;
    player.moving = true;
  }

  if (player.moving) {
    player.frameX = (player.frameX + 1) % 3;
  } else {
    player.frameX = 0;
  }

  // อัปเดตตำแหน่งของกระสุน
  for (let bullet of bullets) {
    bullet.x += bullet.dx;
    bullet.y += bullet.dy;
  }

  // ลบกระสุนที่ออกจากฉาก
  for (let i = bullets.length - 1; i >= 0; i--) {
    if (
      bullets[i].x < 0 ||
      bullets[i].x > canvas.width ||
      bullets[i].y < 0 ||
      bullets[i].y > canvas.height
    ) {
      bullets.splice(i, 1);
    }
  }

  // ตรวจสอบการชนกัน
  for (let bullet of bullets) {
    if (
      bullet.x < player.x + player.width &&
      bullet.x + bullet.size > player.x &&
      bullet.y < player.y + player.height &&
      bullet.y + bullet.size > player.y
    ) {
      player.health -= 10;
      bullets.splice(bullets.indexOf(bullet), 1);
      updateHPDisplay();
      if (player.health <= 0) {
        endGame();
      }
    }
  }

  // อัปเดตคะแนน
  const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // เวลาผ่านไปเป็นวินาที
  score = elapsedTime * 2; // คูณเวลารอดชีวิตเพื่อคำนวณคะแนน
  updateScoreDisplay(); // อัปเดตคะแนนปัจจุบันในหน้าจอ

  // อัปเดตบอส
  updateBoss();
}

// สิ้นสุดเกมและแสดงคะแนน
function endGame() {
  const survivalTime = Math.floor((Date.now() - startTime) / 1000); // เวลารอดชีวิตเป็นวินาที
  const finalScore = survivalTime * 2; // คูณเวลารอดชีวิตเพื่อคำนวณคะแนน

  if (finalScore > highScore) {
    highScore = finalScore;
    localStorage.setItem("highScore", highScore); // บันทึกคะแนนสูงสุดลงใน localStorage
    updateHighScoreDisplay(); // อัปเดตคะแนนสูงสุดในหน้าจอ
  }

  alert(`Game Over\nYour Score: ${finalScore}\nHigh Score: ${highScore}`);
  document.location.reload(); // รีเฟรชหน้าเว็บเพื่อเริ่มเกมใหม่
}

// เคลียร์ canvas และวาดใหม่
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawBullets();
  drawBoss();
  update();
  requestAnimationFrame(gameLoop);
}

// การสร้างกระสุนแบบสุ่มจากขอบจอ
function shootBullet() {
  for (let i = 0; i < bulletsPerInterval; i++) {
    let startX, startY;

    const edge = Math.floor(Math.random() * 4);
    if (edge === 0) {
      startX = 0;
      startY = Math.random() * canvas.height;
    } else if (edge === 1) {
      startX = canvas.width;
      startY = Math.random() * canvas.height;
    } else if (edge === 2) {
      startX = Math.random() * canvas.width;
      startY = 0;
    } else {
      startX = Math.random() * canvas.width;
      startY = canvas.height;
    }

    const angle = Math.atan2(player.y - startY, player.x - startX);
    const bullet = {
      x: startX,
      y: startY,
      dx: Math.cos(angle) * bulletSpeed,
      dy: Math.sin(angle) * bulletSpeed,
      size: 5, // ขนาดของกระสุน
    };

    bullets.push(bullet);
  }
}

// กำหนดปุ่มควบคุม
const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// เริ่มเกม
updateHPDisplay();
updateScoreDisplay();
updateHighScoreDisplay();
gameLoop();

// เริ่มยิงกระสุนแบบสุ่มทุกๆ 1 วินาที
setInterval(shootBullet, 1000);

// เริ่มบอสทุกๆ 30 วินาที
setInterval(() => {
  if (!boss.appearing) {
    boss.appearing = true;
    boss.x = canvas.width / 2 - boss.width / 2;
    boss.y = -boss.height;
    boss.lastShootTime = Date.now(); // รีเซ็ตเวลาสำหรับการยิงกระสุนของบอส
  }
}, 30000);
