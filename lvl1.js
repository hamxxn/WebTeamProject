var canvas, canvasContext;
var LEVEL;

//level check
const urlParams = new URLSearchParams(window.location.search);
LEVEL = urlParams.get("value");
let backgroundMusic = document.getElementById('background-music');

const monsterImg = new Image();
monsterImg.src = "img/spider.png";
const monsterHeight = 80;
const monsterWidth = 80;
var monsterX = 450;
var monsterY = 420;
var monsterSpeedX = 5;

const BrickCollisionSound = new Audio("sound/BrickCollision1.mp3");
const PaddleCollisionSound = new Audio("sound/PaddleCollision.mp3");
const CoinSound = new Audio("sound/coin.mp3");
const BombSound = new Audio("sound/bomb.mp3");

var soundimg = document.getElementById('playbtn');
      soundimg.addEventListener('click', function() {
          var audio = document.getElementById('background-music');

          if (audio.muted) {
            audio.muted = false;
            soundimg.src = "img/soundbtn2.png";
          } else {
            audio.muted = true;
            soundimg.src = "img/soundbtn.png";
          }

          audio.play().then(() => {
              
          }).catch(error => {
              console.log('Audio playback issue: ', error);
          });
      });

//ball variables
var ballX = 500;
var ballSpeedX = 0;
var ballY = 550;
var ballSpeedY = 0;
var ballColor = "white"; // Default ball color
var ballImage = new Image();
ballImage.src = ballColor;

var isBrickCollision = false;

//paddle variables and constants
var PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 10;
const PADDLE_DIST_FROM_EDGE = 60;
var paddleX = 450;

//mouse variables;
var mouseX;
var mouseY;

//bricks variables and constants
const BRICK_WIDTH = 59;
const BRICK_HEIGHT = 45;
const BRICK_COLS = 17;
const BRICK_ROWS = 9; //11
var brickGrid = new Array(BRICK_COLS * BRICK_ROWS);
var bricksLeft = 0;

//score variables
var maximumScore = 0;
var playerScore = 0;
var attempts = 10;
var playerAttempts = attempts;
var showEndingScreen = false;
var isNextScenario = false;

var brickImages = [];

function updateMousePosition(evt) {
  var rect = canvas.getBoundingClientRect();
  var root = document.documentElement;

  mouseX = evt.clientX - rect.left - root.scrollLeft;
  mouseY = evt.clientY - rect.top - root.scrollTop;

  paddleX = mouseX - PADDLE_WIDTH / 2;
}

function handleMouseClick(evt) {
  if (showEndingScreen) {
    playerScore = 0;
    maximumScore = 0;
    playerAttempts = attempts;
    brickReset();
    ballReset();
    showEndingScreen = false;
  }

  if (ballSpeedX == 0 && ballSpeedY == 0) {
    ballSpeedX = 0;
    ballSpeedY = 7;
  }
}

window.onload = function () {
  canvas = document.getElementById("gameCanvas");
  canvasContext = canvas.getContext("2d");

  var framesPerSecond = 30;
  updateAll();
  setInterval(updateAll, 1000 / framesPerSecond);
  setInterval(ballEvent, 20);

  if(LEVEL == 3) {
    backgroundMusic.src = "sound/TragicStory.mp3";
  }

  if (LEVEL == 4) {
    setInterval(NightmareBricks, 2000);
    backgroundMusic.src = "sound/TragicStory.mp3";
  }

  canvas.addEventListener("mousedown", handleMouseClick);
  canvas.addEventListener("mousemove", updateMousePosition);

  brickReset();
  loadSettings();
};

function loadSettings() {
  // Load ball color
  let savedColor = localStorage.getItem("ballColor");
  if (savedColor) {
    let colorMapping = {
      CDBB5B5: "#DBB5B5",
      C01204E: "#01204E",
      CFFA27F: "#FFA27F",
      C799351: "#799351",

      Cca8787: "#ca8787",
      Ce1afd1: "#e1afd1",
      C4a55a2: "#4a55a2",
      C03aed2: "#03aed2",

      Cc5dff8: "#c5dff8",
      Cbff6c3: "#bff6c3",
      Cffff80: "#ffff80",
      C15F5BA: "#15F5BA",

      Cwhite: "white",
      Cred: "red",
      Cblue: "blue",
      Cblack: "black",
    };
    if (savedColor && colorMapping[savedColor]) {
      ballColor = colorMapping[savedColor]; // Set the ball color
    }
  }

  // Load volume settings
  let backgroundVolume = localStorage.getItem("backgroundVolume");
  let ballSoundVolume = localStorage.getItem("ballSoundVolume");
  if (backgroundVolume !== null) {
    // Assuming you have a background music element
    // document.getElementById('backgroundMusic').volume = backgroundVolume / 10;
  }
  if (ballSoundVolume !== null) {
    // Assuming you have a ball sound element
    // ballSound.volume = ballSoundVolume / 10;
  }
}

function updateAll() {
  moveAll();
  drawAll();
}

function ballEvent() {
  ballMovement();
  ballBrickCollision();

  if (isBrickCollision) {
    //
    isBrickCollision = false;
  } else {
    isBrickCollision = true;
  }
}

function ballReset() {
  if (playerAttempts <= 0) {
    showEndingScreen = true;
  }

  ballX = canvas.width / 2;
  ballY = 550;

  ballSpeedX = 0;
  ballSpeedY = 0;
}

function ballMovement() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  if (ballX + 10 > canvas.width || ballX - 10 < 0) {
    BrickCollisionSound.play();
    ballSpeedX *= -1;
  }

  if (ballY - 10 < 0) {
    BrickCollisionSound.play();
    ballSpeedY *= -1;
  }

  if (ballY + 10 > canvas.height) {
    playerAttempts--;
    ballReset();
  }
}

function isBrickAtColRow(col, row) {
  if (
    (col >= 0 - 10 && col < BRICK_COLS + 10) ||
    (row >= 0 - 10 && row < BRICK_ROWS + 10)
  ) {
    var brickIndexUnderCoord = rowColToArrayIndex(col, row);
    return brickGrid[brickIndexUnderCoord];
  } else {
    return false;
  }
}

function ballBrickCollision() {
  var ballBrickCol = Math.floor(ballX / BRICK_WIDTH);
  var ballBrickRow = Math.floor(ballY / BRICK_HEIGHT);

  // Check if the ball is within the bounds of the brick grid
  if (
    ballBrickCol >= 0 &&
    ballBrickCol < BRICK_COLS &&
    ballBrickRow >= 0 &&
    ballBrickRow < BRICK_ROWS
  ) {
    // Iterate over each brick
    for (var eachRow = 0; eachRow < BRICK_ROWS; eachRow++) {
      for (var eachCol = 0; eachCol < BRICK_COLS; eachCol++) {
        var brickIndex = rowColToArrayIndex(eachCol, eachRow);

        // Check if the current brick exists
        if (brickGrid[brickIndex]) {
          // Calculate brick coordinates
          var brickX = eachCol * BRICK_WIDTH;
          var brickY = eachRow * BRICK_HEIGHT;

          // Check if any part of the ball overlaps with the brick
          var ballLeft = ballX - 10;
          var ballRight = ballX + 10;
          var ballTop = ballY - 10;
          var ballBottom = ballY + 10;

          var brickLeft = brickX;
          var brickRight = brickX + BRICK_WIDTH;
          var brickTop = brickY;
          var brickBottom = brickY + BRICK_HEIGHT;

          // Check for intersection
          // ballRight
          if (
            !(
              ballRight < brickLeft ||
              ballLeft > brickRight ||
              ballBottom < brickTop ||
              ballTop > brickBottom
            )
          ) {
            if (brickImages[brickIndex] == "img/clearBrick.png") {
              for (var i = 51; i < 153; i++) {
                brickGrid[i] = false;
              }
              playerAttempts = 0;
              maximumScore = playerScore;
              showEndingScreen = true;
            } else if (brickImages[brickIndex] == "img/coin.png") {
              CoinSound.play();
              playerAttempts++;
            } else if (brickImages[brickIndex] == "img/poison.png") {
              CoinSound.play();
              playerAttempts--;
            } else if (brickImages[brickIndex] == "img/bread.png") {
              CoinSound.play();
              PADDLE_WIDTH += 20;
            } else if (brickImages[brickIndex] == "img/TNT.png") {
              BombSound.play();

              var startIndex = Math.floor(brickIndex / 17) * 17;
              var endIndex = Math.floor(brickIndex / 17) * 17 + 17;

              for (var i = startIndex; i < endIndex; i++) {
                if (
                  brickGrid[i] &&
                  brickImages[i] != "img/coin.png" &&
                  brickImages[i] != "img/poison.png" &&
                  brickImages[i] != "img/bread.png" &&
                  brickImages[i] != "img/TNT.png"
                ) {
                  brickGrid[i] = false;
                  playerScore += 10;
                  bricksLeft--;
                } else if (brickGrid[i]) {
                  brickGrid[i] = false;
                }
              }
            } else {
              BrickCollisionSound.play();
              playerScore += 10;
              bricksLeft--;
            }

            if (bricksLeft == 0) {
              //brickReset();
              showEndingScreen = true;
            }

            // Collision detected
            brickGrid[brickIndex] = false;

            // Adjust ball direction
            var posX = Math.abs(brickRight + brickLeft - ballX * 2);
            var posY = Math.abs(brickTop + brickBottom - ballY * 2);

            if (Math.abs(posX - posY) < 2) {
              ballSpeedX *= -1;
              ballSpeedY *= -1; // Vertical collision
            } else if (posX < posY) {
              ballSpeedY *= -1; // Vertical collision
            } else {
              ballSpeedX *= -1; // Horizontal collision
            }
            return; // Exit the function since we've handled the collision
          }
        }
      }
    }
  }
}

function ballPaddleCollision() {
  var paddleTopEdgeY = canvas.height - PADDLE_DIST_FROM_EDGE;
  var paddleBottomEdgeY = paddleTopEdgeY + PADDLE_HEIGHT;
  var paddleLeftEdgeX = paddleX;
  var paddleRightEdgeX = paddleLeftEdgeX + PADDLE_WIDTH;

  if (
    ballY + 10 > paddleTopEdgeY && //below the top of the paddle
    ballY < paddleBottomEdgeY && //above the bottom of the paddle
    ballX + 10 > paddleLeftEdgeX && //right of the left side of the paddle
    ballX - 10 < paddleRightEdgeX
  ) {
    //left of the right side of the paddle

    PaddleCollisionSound.play();
    ballSpeedY = -7;

    var centerOfPaddleX = paddleX + PADDLE_WIDTH / 2;
    var ballDistFromPaddleCenterX = ballX - centerOfPaddleX;
    ballSpeedX = ballDistFromPaddleCenterX * 0.2;
  }
}

function paddleTimer() {
  if (PADDLE_WIDTH > 100) {
    PADDLE_WIDTH -= 0.1;
  } else {
    PADDLE_WIDTH = 100;
  }
}

function moveAll() {
  if (showEndingScreen) {
    return;
  }

  ballPaddleCollision();
  paddleTimer();

  if (LEVEL == 3 || LEVEL == 4) {
    moveMonster();
    ballMonsterCollision();
  }
}

function brickReset() {
  bricksLeft = 0;
  var i;

  for (i = 0; i < BRICK_COLS * 3; i++) {
    brickGrid[i] = false;
  }

  brickGrid[25] = true;

  for (; i < BRICK_COLS * BRICK_ROWS; i++) {
    if (Math.random() < 0.4) {
      brickGrid[i] = true;

      if (
        brickImages[i] != "img/coin.png" &&
        brickImages[i] != "img/poison.png" &&
        brickImages[i] != "img/bread.png" &&
        brickImages[i] != "img/TNT.png"
      ) {
        bricksLeft++;
        maximumScore += 10;
      }
    } else {
      brickGrid[i] = false;
    } //end of else (random check)
  } //console.log(maximumScore);
} //end of brickReset

function rowColToArrayIndex(col, row) {
  return col + row * BRICK_COLS;
}

function initializeBrickImages() {
  for (var i = 0; i < BRICK_ROWS * BRICK_COLS; i++) {
    // Randomly select between two brick images
    var randomImageIndex, levelIndex;

    if (LEVEL == 1) {
      randomImageIndex = Math.floor(Math.random() * 4) + 1; //4
      levelIndex = randomImageIndex;
    } else if (LEVEL == 2) {
      randomImageIndex = Math.floor(Math.random() * 30) + 1; //6
      levelIndex = (randomImageIndex % 6) + 1;
    } else {
      randomImageIndex = Math.floor(Math.random() * 27) + 1; //9
      levelIndex = (randomImageIndex % 9) + 1;
    }

    if (randomImageIndex == 10) {
      brickImages.push("img/coin.png");
    } else if (randomImageIndex == 11) {
      brickImages.push("img/poison.png");
    } else if (randomImageIndex == 12) {
      brickImages.push("img/bread.png");
    } else if (randomImageIndex >= 13 && randomImageIndex <= 14) {
      brickImages.push("img/TNT.png");
    } else if (levelIndex < 3) {
      brickImages.push("img/brick_images" + levelIndex + ".png");
    } else if (levelIndex < 10) {
      brickImages.push("img/brick_images" + levelIndex + ".jpg");
    }

    brickImages[25] = "img/clearBrick.png";
  }
}

function drawBricks() {
  for (var eachRow = 0; eachRow < BRICK_ROWS; eachRow++) {
    for (var eachCol = 0; eachCol < BRICK_COLS; eachCol++) {
      var arrayIndex = rowColToArrayIndex(eachCol, eachRow);

      if (brickGrid[arrayIndex]) {
        var brickX = eachCol * BRICK_WIDTH;
        var brickY = eachRow * BRICK_HEIGHT;
        var brickImage = new Image();

        brickImage.src = brickImages[arrayIndex];
        canvasContext.drawImage(
          brickImage,
          brickX,
          brickY,
          BRICK_WIDTH,
          BRICK_HEIGHT
        );
      } //end of brick drawing if true
    }
  } //end of brick for

  initializeBrickImages();
} //end of drawBricks

function drawAll() {
  //background
  if (LEVEL == 1) {
    document.body.style.backgroundImage = "url('img/minecraftbg1.jpeg')";
  } else if (LEVEL == 2) {
    document.body.style.backgroundImage = "url('img/minecraftbg2.jpg')";
  } else {
    document.body.style.backgroundImage = "url('img/minecraftbg3.jpg')";
  }

  if (LEVEL == 1) {
    document.getElementById("master_title").innerHTML = "Morning";
  } else if (LEVEL == 2) {
    document.getElementById("master_title").innerHTML = "Noon";
  } else if (LEVEL == 3) {
    document.getElementById("master_title").innerHTML = "Night";
  } else if (LEVEL == 4) {
    document.getElementById("master_title").innerHTML = "Nightmare";
  }

  rect(0, 0, canvas.width, canvas.height, "rgba(54, 54, 54, 0.65)");
  document.body.style.cursor = "none";

  if (showEndingScreen) {
    if (playerScore == maximumScore && LEVEL == 1) {
      ballSpeedX = 0;
      ballSpeedY = 0;

      setTimeout(function () {
        window.location.href = "levelScenario.html?value=2";
      }, 200);
    } else if (playerScore == maximumScore && LEVEL == 2) {
      ballSpeedX = 0;
      ballSpeedY = 0;

      setTimeout(function () {
        window.location.href = "levelScenario.html?value=3";
      }, 200);
    } else if (playerScore == maximumScore && LEVEL == 3) {
      isNextScenario = true;
      ballSpeedX = 0;
      ballSpeedY = 0;

      text(
        "YOU WIN!",
        canvas.width / 2,
        100,

        "center"
      );
      text(
        "SCORE: " + playerScore,
        canvas.width / 2,
        250,

        "center"
      );
      text(
        "ATTEMPTS: " + playerAttempts,
        canvas.width / 2,
        400,

        "center"
      );
      text(
        "Click to continue",
        canvas.width / 2,
        550,

        "center"
      );

      setTimeout(function () {
        window.location.href = "levelScenario.html?value=4";
      }, 1500);
    } else if (playerAttempts == 0 && LEVEL == 4) {
      ballSpeedX = 0;
      ballSpeedY = 0;

      text(
        "Nightmare is end...",
        canvas.width / 2,
        100,

        "center"
      );
      text(
        "SCORE: " + playerScore,
        canvas.width / 2,
        250,

        "center"
      );
      text(
        "ATTEMPTS: " + playerAttempts,
        canvas.width / 2,
        400,

        "center"
      );
      text(
        "Click to continue",
        canvas.width / 2,
        550,

        "center"
      );

      isNextScenario = true;
      canvas.addEventListener("mousedown", nextScenario);
    } else {
      ballSpeedX = 0;
      ballSpeedY = 0;

      text(
        "YOU LOSE!",
        canvas.width / 2,
        100,

        "center"
      );
      text(
        "SCORE: " + playerScore,
        canvas.width / 2,
        250,

        "center"
      );
      text(
        "ATTEMPTS: " + playerAttempts,
        canvas.width / 2,
        400,

        "center"
      );
      text(
        "Click to continue",
        canvas.width / 2,
        550,

        "center"
      );

      isNextScenario = true;
      canvas.addEventListener("mousedown", nextScenario);
    }
  }

  //ball
  canvasContext.fillStyle = ballColor;
  canvasContext.beginPath();
  canvasContext.arc(ballX, ballY, 10, 0, Math.PI * 2);
  canvasContext.fill();

  //paddle
  rect(
    paddleX,
    canvas.height - PADDLE_DIST_FROM_EDGE,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    "white"
  );

  //bricks
  drawBricks();

  if (LEVEL == 3 || LEVEL == 4) {
    drawMonster();
  }

  text("SCORE: " + playerScore, 10, 30, "left");
  text("NUMBER OF BALLS: " + playerAttempts, 730, 30, "left");
}

function nextScenario() {
  if (isNextScenario) {
    window.location.href = "game.html";
  }
}

function drawMonster() {
  canvasContext.drawImage(
    monsterImg,
    monsterX,
    monsterY,
    monsterWidth,
    monsterHeight
  );
}

function moveMonster() {
  monsterX += monsterSpeedX;

  if (monsterX > canvas.width - 100 && monsterSpeedX > 0) {
    monsterSpeedX *= -1;
  }

  if (monsterX < 0 && monsterSpeedX < 0) {
    monsterSpeedX *= -1;
  }
}

function ballMonsterCollision() {
  if (
    monsterX < ballX + 10 &&
    monsterX + 80 > ballX - 10 &&
    monsterY < ballY + 10 &&
    monsterY + 80 > ballY - 10
  ) {
    BrickCollisionSound.play();
    playerAttempts--;
    ballReset();
  }
}

function NightmareBricks() {
  var nightIndex = Math.floor(Math.random() * 102) + 51;

  if (playerAttempts > 0 && !brickGrid[nightIndex]) {
    brickGrid[nightIndex] = true;
    bricksLeft++;
    maximumScore += 10;
  }
}

function rect(topLeftX, topLeftY, boxWidth, boxHeight, fillColor) {
  canvasContext.fillStyle = fillColor;
  canvasContext.fillRect(topLeftX, topLeftY, boxWidth, boxHeight);
}

function text(showWords, textX, textY, textAlignment) {
  canvasContext.font = "27px Changa";
  canvasContext.fillStyle = "#0a6847";
  canvasContext.textAlign = textAlignment;
  canvasContext.fillText(showWords, textX, textY);
}
