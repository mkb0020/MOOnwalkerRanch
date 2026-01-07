//MOONwalker Ranch V2
const starsDiv = document.getElementById('stars');
for (let i = 0; i < 200; i++) {
  const star = document.createElement('div');
  star.className = 'star';
  star.style.width = star.style.height = Math.random() * 2 + 'px';
  star.style.left = Math.random() * 100 + '%';
  star.style.top = Math.random() * 100 + '%';
  star.style.animationDelay = Math.random() * 4 + 's';
  starsDiv.appendChild(star);
}


function isMobile() {
    return window.matchMedia("(max-width: 1500px)").matches;
  }

  setInterval(() => {
    if (!isMobile()) return;  
    if (Math.random() < 0.35) {
      const star = document.createElement('div');
      star.className = 'shooting-star';
      document.body.appendChild(star);
      setTimeout(() => star.remove(), 1500);
    }
}, 12000);


const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  const container = canvas.parentElement;
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
  setTimeout(resizeCanvas, 100);
});

const levelWidth = 5000;
const COW_WIDTH = 80;
const COW_HEIGHT = 80;
const COW_MIN_SPACING = 140;

let score = 0;
let totalCows = 0;
let currentMessage = '';
let messageAlpha = 0;
let messageTimer = 0;
let camera = { x: 0 };
let cows = [];
let particles = [];
const keys = {};
let spaceJustPressed = false;
let joystickActive = false;
let joystickX = 0;
let joystickY = 0;

const bgMusic = new Audio('assets/sounds/decoherence.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.4;
let musicStarted = false;

function startMusicIfNeeded() {
  if (!musicStarted) {
    bgMusic.play().catch(() => {});
    musicStarted = true;
  }
}

const ufoSprite = new Image();
ufoSprite.src = 'assets/images/UFO3.png';

const cowSpriteSheet = new Image();
cowSpriteSheet.src = 'assets/images/cow.png';

const mooSprite = new Image();
mooSprite.src = 'assets/images/moo.png';

let cowFrameWidth = 0;
let cowFrameHeight = 0;
let spritesLoaded = false;

cowSpriteSheet.onload = () => {
  cowFrameWidth = cowSpriteSheet.width / 9;
  cowFrameHeight = cowSpriteSheet.height;
  spritesLoaded = true;
  console.log('✅ Cow sprite loaded!', cowFrameWidth, 'x', cowFrameHeight);
};

ufoSprite.onload = () => {
  console.log('✅ UFO sprite loaded!');
};

let ufo = {
  x: 500,
  y: 250,
  vx: 0,
  vy: 0,
  w: 140,
  h: 55,
  angle: 0,
  targetVx: 0,
  targetVy: 0
};

const abductionMessages = [
  "Moo-velous! 🐄",
  "Udderly amazing! ✨",
  "Beam me up! 🛸",
  "To the moon! 🌙",
  "Cow-abunga! 🌊",
  "LegenDARY! ⭐",
  "Moo-gnificent! 💫",
  "Space cow! 🚀",
  "Cosmic! 🌟",
  "Out of this world! 🌌"
];

const cowFacts = [
  "Cows have best friends!",
  "Cows can see almost 360°!",
  "Cows produce 200K glasses of milk per year!",
  "Cows have unique moo accents!",
  "Cows sleep standing up!",
  "Cows can smell things 6 miles away!"
];

window.addEventListener('keydown', e => {
  startMusicIfNeeded();
  if (e.code === 'Space') {
    e.preventDefault();
    if (!keys.space) spaceJustPressed = true;
    keys.space = true;
  } else {
    keys[e.key.toLowerCase()] = true;
  }
});

window.addEventListener('keyup', e => {
  if (e.code === 'Space') {
    keys.space = false;
  } else {
    keys[e.key.toLowerCase()] = false;
  }
});

window.addEventListener('keydown', e => {
  if (e.key.toLowerCase() === 'm') {
    bgMusic.muted = !bgMusic.muted;
    showMessage(bgMusic.muted ? '🔇 Music Off' : '🎵 Music On');
    updateMusicButton();
  }
});

// MUSIC
const musicBtn = document.getElementById('musicBtn');

function updateMusicButton() {
  if (musicBtn) {
    musicBtn.textContent = bgMusic.muted ? '🔇' : '🔊';
  }
}

function toggleMusic() {
  bgMusic.muted = !bgMusic.muted;
  showMessage(bgMusic.muted ? '🔇 Music Off' : '🎵 Music On');
  updateMusicButton();
}

if (musicBtn) {
  musicBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    toggleMusic();
  });
  
  musicBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMusic();
  });
}

// JOYSTICK
const joystick = document.getElementById('joystick');
const joystickKnob = document.getElementById('joystickKnob');
const abductBtn = document.getElementById('abductBtn');

function handleJoystickMove(clientX, clientY) {
  const rect = joystick.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  let deltaX = clientX - centerX;
  let deltaY = clientY - centerY;

  const maxDistance = 35;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  if (distance > maxDistance) {
    deltaX = (deltaX / distance) * maxDistance;
    deltaY = (deltaY / distance) * maxDistance;
  }

  joystickKnob.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;

  joystickX = deltaX / maxDistance;
  joystickY = deltaY / maxDistance;
}

function resetJoystick() {
  joystickKnob.style.transform = 'translate(-50%, -50%)';
  joystickX = 0;
  joystickY = 0;
  joystickActive = false;
  joystick.classList.remove('active');
}

joystick.addEventListener('touchstart', (e) => {
  startMusicIfNeeded();
  e.preventDefault();
  joystickActive = true;
  joystick.classList.add('active');
  const touch = e.touches[0];
  handleJoystickMove(touch.clientX, touch.clientY);
});

joystick.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (joystickActive) {
    const touch = e.touches[0];
    handleJoystickMove(touch.clientX, touch.clientY);
  }
});

joystick.addEventListener('touchend', (e) => {
  e.preventDefault();
  resetJoystick();
});

joystick.addEventListener('mousedown', (e) => {
  joystickActive = true;
  joystick.classList.add('active');
  handleJoystickMove(e.clientX, e.clientY);
});

document.addEventListener('mousemove', (e) => {
  if (joystickActive) {
    handleJoystickMove(e.clientX, e.clientY);
  }
});

document.addEventListener('mouseup', () => {
  if (joystickActive) {
    resetJoystick();
  }
});

// ABDUCT
abductBtn.addEventListener('touchstart', (e) => {
  startMusicIfNeeded();
  e.preventDefault();
  if (!keys.space) spaceJustPressed = true;
  keys.space = true;
});

abductBtn.addEventListener('touchend', (e) => {
  e.preventDefault();
  keys.space = false;
});

abductBtn.addEventListener('mousedown', (e) => {
  e.preventDefault();
  if (!keys.space) spaceJustPressed = true;
  keys.space = true;
});

abductBtn.addEventListener('mouseup', (e) => {
  e.preventDefault();
  keys.space = false;
});

//HELPERS
function showMessage(text) {
  currentMessage = text;
  messageAlpha = 1;
  messageTimer = 2;
}

function createParticles(x, y, color) {
  for (let i = 0; i < 20; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 200,
      vy: (Math.random() - 0.5) * 200 - 100,
      life: 1,
      decay: Math.random() * 0.02 + 0.01,
      size: Math.random() * 4 + 2,
      color
    });
  }
}

function spawnCows() {
  cows = [];
  const numCows = 8 + Math.floor(Math.random() * 5);
  const usedPositions = [];
  const currentGroundY = canvas.height - 100;

  for (let i = 0; i < numCows; i++) {
    let x;
    let attempts = 0;

    do {
      x = 100 + Math.random() * (levelWidth - 200);
      attempts++;
    } while (
      usedPositions.some(px => Math.abs(px - x) < COW_MIN_SPACING) &&
      attempts < 50
    );

    usedPositions.push(x);
    const vx = (Math.random() - 0.5) * 50;

    cows.push({
      x,
      y: currentGroundY - COW_HEIGHT / 2,
      vx,
      state: 'idle',
      frame: 0,
      animTime: 0,
      scared: false,
      idleTime: Math.random() * 3,
      facingRight: vx < 0,
      mooTime: Math.random() * 8 + 5,
      showingMoo: false,
      mooTimer: 0
    });
  }
}

function drawCow(cow, x, y) {
  const isScared = cow.scared || cow.state === 'abducting';
  const frameIndex = cow.state === 'idle' ? 0 : Math.min(cow.frame, 8);

  ctx.save();

  if (cow.facingRight) {
    ctx.translate(x, y);
  } else {
    ctx.translate(x + COW_WIDTH, y);
    ctx.scale(-1, 1);
  }

  if (spritesLoaded && cowFrameWidth > 0) {
    ctx.drawImage(
      cowSpriteSheet,
      frameIndex * cowFrameWidth,
      0,
      cowFrameWidth,
      cowFrameHeight,
      0,
      0,
      COW_WIDTH,
      COW_HEIGHT
    );
  } else {
    ctx.fillStyle = isScared ? '#FF69B4' : '#FFB6C1';
    ctx.fillRect(10, 30, 50, 30);
    ctx.fillRect(45, 15, 20, 20);

    const legOffset = Math.sin(cow.animTime * 10) * 3;
    ctx.fillRect(15, 60 + legOffset, 8, 10);
    ctx.fillRect(28, 60 - legOffset, 8, 10);
    ctx.fillRect(38, 60 + legOffset, 8, 10);
    ctx.fillRect(48, 60 - legOffset, 8, 10);

    ctx.fillStyle = '#000';
    ctx.fillRect(20, 35, 8, 8);
    ctx.fillRect(35, 42, 10, 10);
    ctx.fillRect(50, 20, 3, 3);
    ctx.fillRect(58, 20, 3, 3);

    if (isScared) {
      ctx.fillStyle = '#FF0000';
      ctx.font = '14px Arial';
      ctx.fillText('!', 30, 15);
    }
  }

  ctx.restore();

  if (cow.scared && cow.state === 'idle') {
    ctx.font = '20px Arial';
    ctx.fillText('😱', x + 25, y - 5);
  }

  if (cow.showingMoo && mooSprite.complete && mooSprite.naturalWidth > 0) {
    ctx.drawImage(mooSprite, x + 10, y - 40, 60, 30);
  }
}

function drawUFO() {
  ctx.save();
  ctx.translate(ufo.x, ufo.y);
  ctx.rotate(ufo.angle);

  if (ufoSprite.complete && ufoSprite.naturalWidth > 0) {
    ctx.drawImage(ufoSprite, -ufo.w / 2, -ufo.h / 2, ufo.w, ufo.h);
  } else {
    ctx.fillStyle = '#4dd9a8';
    ctx.beginPath();
    ctx.ellipse(0, 5, 70, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#67FEBD';
    ctx.beginPath();
    ctx.ellipse(0, -5, 40, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.ellipse(0, -5, 15, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const time = Date.now() / 200;
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + time;
    const x = Math.cos(angle) * 80;
    const y = Math.sin(angle) * 25 + 5;
    ctx.fillStyle = `hsl(${(time * 50 + i * 72) % 360}, 100%, 70%)`;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function update(dt) {
  const speed = 500;
  const acceleration = 0.03;
  const currentGroundY = canvas.height - 50;

  // INPUT HANDLING
  ufo.targetVx = ufo.targetVy = 0;
  if (keys.a || keys.arrowleft) ufo.targetVx = -speed;
  if (keys.d || keys.arrowright) ufo.targetVx = speed;
  if (keys.w || keys.arrowup) ufo.targetVy = -speed;
  if (keys.s || keys.arrowdown) ufo.targetVy = speed;

  // JOYSTICK OVERRIDES KEYBOARD
  if (joystickActive || Math.abs(joystickX) > 0.1 || Math.abs(joystickY) > 0.1) {
    ufo.targetVx = joystickX * speed;
    ufo.targetVy = joystickY * speed;
  }

  // FLOATIER PHYSICS
  ufo.vx += (ufo.targetVx - ufo.vx) * acceleration;
  ufo.vy += (ufo.targetVy - ufo.vy) * acceleration;

  if (Math.abs(ufo.targetVx) < 10 && Math.abs(ufo.targetVy) < 10) {
    ufo.vx *= 1;
    ufo.vy *= 1;
  }

  ufo.x += ufo.vx * dt;
  ufo.y += ufo.vy * dt;
  ufo.x = Math.max(70, Math.min(levelWidth - 70, ufo.x));
  ufo.y = Math.max(30, Math.min(currentGroundY - 50, ufo.y));
  ufo.angle = ufo.vx * 0.0003;

  // CAMERA
  const targetCameraX = ufo.x - canvas.width / 2;
  camera.x += (targetCameraX - camera.x) * 0.1;
  camera.x = Math.max(0, Math.min(levelWidth - canvas.width, camera.x));

  // ABDUCTION
  if (spaceJustPressed && keys.space) {
    spaceJustPressed = false;
    for (let cow of cows) {
      if (cow.state !== 'idle') continue;
      const dx = Math.abs(ufo.x - cow.x);
      if (dx < 80 && ufo.y < cow.y) {
        cow.state = 'abducting';
        cow.frame = 1;
        cow.beamX = ufo.x; // LOCK BEAM POSITION
        createParticles(cow.x, cow.y, '#67FEBD');
        break;
      }
    }
  }

  // UPDATE COWS
  cows = cows.filter(cow => {
    cow.animTime += dt;

    if (cow.state === 'idle') {
      cow.idleTime -= dt;
      if (cow.idleTime <= 0) {
        cow.vx = (Math.random() - 0.5) * 50;
        if (cow.vx > 0) cow.facingRight = false;
        else if (cow.vx < 0) cow.facingRight = true;
        cow.idleTime = Math.random() * 3 + 1;
      }

      cow.mooTime -= dt;
      if (cow.mooTime <= 0) {
        cow.showingMoo = true;
        cow.mooTimer = 2;
        cow.mooTime = Math.random() * 10 + 8;
      }

      if (cow.showingMoo) {
        cow.mooTimer -= dt;
        if (cow.mooTimer <= 0) cow.showingMoo = false;
      }

      cow.x += cow.vx * dt;
      cow.x = Math.max(50, Math.min(levelWidth - 50, cow.x));

      const dist = Math.abs(ufo.x - cow.x);
      cow.scared = dist < 150 && ufo.y < cow.y - 50;
      cow.y = currentGroundY - COW_HEIGHT / 2;

    } else if (cow.state === 'abducting') {
      if (cow.animTime >= 0.1) {
        cow.animTime = 0;
        cow.frame++;
        if (cow.frame > 8) cow.frame = 1;
      }

      cow.y -= 200 * dt;
      
      // MOVE COWS HORIZONTALLY TOWARDS BEAM CENTER
      if (cow.beamX !== null) {
        const pullSpeed = 100; // ABDUCT SPEED
        const dx = cow.beamX - cow.x;
        if (Math.abs(dx) > 5) {
          cow.x += Math.sign(dx) * pullSpeed * dt;
        } else {
          cow.x = cow.beamX; // SNAP TO CENTER
        }
      }

      if (Math.random() < 0.3) {
        createParticles(cow.x, cow.y, '#ffffff');
      }

      if (cow.y <= ufo.y + 20) {
        score++;
        const msg = Math.random() < 0.3
          ? cowFacts[Math.floor(Math.random() * cowFacts.length)]
          : abductionMessages[Math.floor(Math.random() * abductionMessages.length)];
        showMessage(msg);
        createParticles(cow.x, cow.y, '#dc4ce8');

        setTimeout(() => {
          const spawnX = Math.random() * levelWidth;
          const spawnVx = (Math.random() - 0.5) * 50;
          const currentGroundY = canvas.height - 50;
          cows.push({
            x: spawnX,
            y: currentGroundY - COW_HEIGHT / 2,
            vx: spawnVx,
            state: 'idle',
            frame: 0,
            animTime: 0,
            scared: false,
            idleTime: Math.random() * 3,
            facingRight: spawnVx < 0,
            mooTime: Math.random() * 8 + 5,
            showingMoo: false,
            mooTimer: 0,
            beamX: null
          });
          totalCows++;
        }, 2000);

        return false;
      }
    }

    return true;
  });

  if (messageTimer > 0) {
    messageTimer -= dt;
    if (messageTimer <= 0) {
      messageAlpha = 0;
    } else if (messageTimer < 0.3) {
      messageAlpha = messageTimer / 0.3;
    }
  }

  particles = particles.filter(p => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 300 * dt;
    p.life -= p.decay;
    return p.life > 0;
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const currentGroundY = canvas.height - 50;
  const currentGroundHeight = 100;

  ctx.save();
  ctx.translate(-camera.x, 0);

  const gradient = ctx.createLinearGradient(0, currentGroundY, 0, canvas.height);
  gradient.addColorStop(0, '#2d5016');
  gradient.addColorStop(1, '#1a2f0d');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, currentGroundY, levelWidth, currentGroundHeight);

  ctx.fillStyle = '#3d6020';
  for (let i = 0; i < 100; i++) {
    const x = (i / 100) * levelWidth;
    ctx.fillRect(x, currentGroundY + 10, 30, 5);
    ctx.fillRect(x + 20, currentGroundY + 30, 40, 3);
  }

  particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  });
  ctx.globalAlpha = 1;

  cows.forEach(cow => {
    if (cow.state === 'abducting') {
      const beamCenterX = cow.beamX !== null ? cow.beamX : ufo.x;
      const beamTop = ufo.y + 30;
      const beamHeight = cow.y - beamTop;
      const beamWidth = 70;

      const glow = ctx.createLinearGradient(beamCenterX, beamTop, beamCenterX, cow.y);
      glow.addColorStop(0, 'rgba(103, 254, 189, 0.1)');
      glow.addColorStop(1, 'rgba(103, 254, 189, 0.4)');
      ctx.fillStyle = glow;
      ctx.fillRect(beamCenterX - beamWidth * 0.6, beamTop, beamWidth * 1.2, beamHeight);

      const beam = ctx.createLinearGradient(beamCenterX, beamTop, beamCenterX, cow.y);
      beam.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
      beam.addColorStop(1, 'rgba(0, 255, 255, 0.6)');
      ctx.fillStyle = beam;
      ctx.fillRect(beamCenterX - beamWidth / 2, beamTop, beamWidth, beamHeight);

      for (let i = 0; i < 5; i++) {
        const y = beamTop + Math.random() * beamHeight;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(beamCenterX + (Math.random() - 0.5) * beamWidth, y, 3, 3);
      }
    }

    drawCow(cow, cow.x - COW_WIDTH / 2, cow.y - COW_HEIGHT / 2);
  });

  drawUFO();
  ctx.restore();

  // HUD
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, 50);

  ctx.font = 'bold 18px Orbitron';
  ctx.fillStyle = '#67FEBD';
  ctx.textAlign = 'left';
  ctx.fillText(`COWS ABDUCTED: `, 20, 30);
  ctx.fillStyle = '#dc4ce8';
  ctx.fillText(score, 230, 30);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#67FEBD';
  ctx.fillText(`COWS LEFT: `, 20, 50);
  ctx.fillStyle = '#dc4ce8';
  ctx.fillText(cows.length, 230, 50);

  if (messageAlpha > 0 && currentMessage) {
    ctx.globalAlpha = messageAlpha;
    ctx.font = 'bold 18px Orbitron';
    ctx.textAlign = 'center';

    const textMetrics = ctx.measureText(currentMessage);
    const textWidth = textMetrics.width;
    const textHeight = 20;
    const padding = 20;
    const msgX = (canvas.width / 2) + 100;
    const msgY = 30;

    ctx.fillStyle = 'rgba(219, 76, 232, 0.36)';
    ctx.fillRect(
      msgX - textWidth / 2 - padding,
      msgY - textHeight / 2 - padding / 2,
      textWidth + padding * 2,
      textHeight + padding,
    );

    ctx.strokeStyle = 'rgba(219, 76, 232, 0.58)';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      msgX - textWidth / 2 - padding,
      msgY - textHeight / 2 - padding / 2,
      textWidth + padding * 2,
      textHeight + padding
    );

    ctx.fillStyle = '#fff';
    ctx.fillText(currentMessage, msgX, msgY + 5);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }
}

let lastTime = Date.now();
function loop() {
  const now = Date.now();
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  update(dt);
  draw();
  requestAnimationFrame(loop);
}

spawnCows();
showMessage("Welcome to MOOnwalker Ranch! 🐄");
loop();