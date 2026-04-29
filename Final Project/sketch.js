// 
let maze = [
[1,1,1,1,1,1,1,1,1,1,1,1],
[1,2,0,0,1,0,0,0,0,0,0,1],
[1,1,1,0,1,0,1,1,1,1,0,1],
[1,0,0,0,1,0,0,0,0,1,0,1],
[1,0,1,1,1,1,1,1,0,1,0,1],
[1,0,0,0,0,0,0,1,0,0,0,1],
[1,1,1,1,1,1,0,1,1,1,0,1],
[1,0,0,0,0,1,0,0,0,1,0,1],
[1,0,1,1,0,1,1,1,0,1,0,1],
[1,0,0,1,0,0,0,1,0,0,0,1],
[1,1,0,0,0,1,0,0,0,1,3,1],
[1,1,1,1,1,1,1,1,1,1,1,1]
];

let tileSize = 40;
let player = { x: 1, y: 1 };
let exit = { x: 10, y: 10 };

let osc;
let gameWon = false;
let sonarUses = 2;
let resetting = false;
let resetBtn;

// Correct path
let correctPath = [
[1,1],[2,1],[3,1],
[3,2],[3,3],
[2,3],[1,3],
[1,4],
[2,4],[3,4],[4,4],[5,4],
[5,5],
[5,6],
[4,6],[3,6],
[3,7],
[4,7],[5,7],
[5,8],
[6,8],[7,8],
[7,9]
];

let pathIndex = 0;

// Melody notes
let melody = [261, 330, 392, 494];

// Sonar
let sonarActive = false;
let sonarRadius = 0;

function setup() {
  createCanvas(480, 480);

  osc = new p5.Oscillator();
  osc.start();
  osc.amp(0);
  // I worked on styling my restart button here so that you can reset the game once completed 
  resetBtn = createButton('Play Again');
  resetBtn.position(10, height + 10);
  resetBtn.mousePressed(fullReset);
  resetBtn.style('background', '#00ff96');
  resetBtn.style('color', '#0a0a0a');
  resetBtn.style('border', '2px solid #00c777');
  resetBtn.style('border-radius', '10px');
  resetBtn.style('padding', '10px 16px');
  resetBtn.style('font-size', '16px');
  resetBtn.style('font-weight', '700');
  resetBtn.style('font-family', 'monospace');
  resetBtn.style('cursor', 'pointer');
  resetBtn.style('box-shadow', '0 0 12px rgba(0, 255, 150, 0.5)');
  resetBtn.hide();
}

function draw() {
  background(10);

  let pulse = map(sin(frameCount * 0.1) + 1, 0, 2, 100, 255);

  if (gameWon) {
    resetBtn.show();

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("ESCAPED", width / 2, height / 2);
    return;
  }

  resetBtn.hide();

  // SONAR VISUAL
  if (sonarActive) {
    drawMaze();
    noFill();
    stroke(200, 50, 50);
    ellipse(
      player.x * tileSize + tileSize/2,
      player.y * tileSize + tileSize/2,
      sonarRadius
    );

    sonarRadius += 10;

    if (sonarRadius > 200) {
      sonarActive = false;
      sonarRadius = 0;
    }
  }

  drawPlayer();
}

function drawPlayer() {
  let px = player.x * tileSize + tileSize / 2;
  let py = player.y * tileSize + tileSize / 2;

  // Pulsating size
  let pulseSize = map(sin(frameCount * 0.15), -1, 1, 8, 16);

  // Core
  noStroke();
  fill(0, 255, 150);
  ellipse(px, py, pulseSize);

  // Outer ring
  noFill();
  stroke(0, 255, 150, 120);
  ellipse(px, py, pulseSize * 2);
}

function drawMaze() {
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {

      if (maze[y][x] === 1) {
        fill(50);
      } else {
        fill(20);
      }

      rect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
}

// MOVEMENT
function keyPressed() {
  if (gameWon || resetting) return;

  if (key === 'w') move(0, -1);
  if (key === 's') move(0, 1);
  if (key === 'a') move(-1, 0);
  if (key === 'd') move(1, 0);

  // SONAR
  if (key === ' ' && sonarUses > 0 && !sonarActive) {
    sonarActive = true;
    sonarRadius = 0;
    sonarUses--;
  }
}

function move(dx, dy) {

  if (resetting) return;

  let newX = player.x + dx;
  let newY = player.y + dy;

  if (maze[newY][newX] !== 1) {
    player.x = newX;
    player.y = newY;

    checkCorrectPath();
    playHotCold();
    checkExit();
  } else {
    resetPlayer(); // wall hit
  }
}

// CORRECT PATH SYSTEM
function checkCorrectPath() {

  if (
    pathIndex < correctPath.length &&
    player.x === correctPath[pathIndex][0] &&
    player.y === correctPath[pathIndex][1]
  ) {
    let note = melody[pathIndex % melody.length];

    osc.freq(note);
    osc.amp(0.3, 0.05);
    osc.amp(0, 0.2);

    pathIndex++;

  } else {
    osc.freq(120);
    osc.amp(0.4, 0.05);
    osc.amp(0, 0.2);
  }
}

// HOT / COLD
function playHotCold() {
  let d = dist(player.x, player.y, exit.x, exit.y);

  let freq = map(d, 0, 15, 800, 150);
  let pan = map(player.x, 0, 11, -1, 1);

  osc.freq(freq);
  osc.pan(pan);

  osc.amp(0.1, 0.1);
}

// RESET SYSTEM
function resetPlayer() {
  if (resetting) return;

  resetting = true;

  osc.freq(70);
  osc.amp(0.6, 0.05);
  osc.amp(0, 0.3);

  setTimeout(() => {
    player.x = 1;
    player.y = 1;

    pathIndex = 0;

    sonarUses = 2;
    sonarActive = false;

    resetting = false;
  }, 300);
}

// EXIT
function checkExit() {
  if (maze[player.y][player.x] === 3) {
    gameWon = true;

    osc.freq(900);
    osc.amp(0.5, 0.1);
    osc.amp(0, 1);
  }
}

function fullReset() {
  player.x = 1;
  player.y = 1;

  pathIndex = 0;
  sonarUses = 2;
  sonarActive = false;
  sonarRadius = 0;

  gameWon = false;
  resetting = false;

  resetBtn.hide();
}

