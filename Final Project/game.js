const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const canvasSize = 400;
let speed = 300;
let gameActive = false;

let snake, direction, food, score, highScore, gameInterval;
let snakeColor = "#00ff00";
let currentTheme = "jungle";

const themeSelect = document.getElementById("themeSelect");
const colorPicker = document.getElementById("colorPicker");
const gameOverElement = document.getElementById("gameOver");
const restartButton = document.getElementById("restartButton");
const settingsElement = document.getElementById("settings");
const titleElement = document.querySelector("h1");

highScore = parseInt(localStorage.getItem("highScore")) || 0; // Load the saved high score

function preloadImages() {
    const images = [
        "https://m.media-amazon.com/images/I/71YpuF1O8ML.jpg",
        "https://cdn.prod.website-files.com/61f7b4a324fc7902c9e4ab7a/6439a44e1ba631f201bef25e_Ocean%20Time.jpeg",
        "https://media.istockphoto.com/id/514316008/photo/pyramids-in-sand.jpg?s=612x612&w=0&k=20&c=4H8mUyopSBmSTx3xRVsJkr87f7lQbPIPELKx6SGlZMM=",
        "https://www.snexplores.org/wp-content/uploads/2021/12/1440_SS_savanna_feat.jpg",
    ];
    images.forEach((src) => {
        const img = new Image();
        img.src = src;
    });
}

function changeTheme(theme) {
    let canvasBackground, textColor, textBackground;

    switch (theme) {
        case "jungle":
            document.body.style.backgroundImage = "url('https://m.media-amazon.com/images/I/71YpuF1O8ML.jpg')";
            canvasBackground = "#3c3c1f";
            textColor = "#ffffff";
            textBackground = "rgba(0, 0, 0, 0.6)";
            break;
        case "desert":
            document.body.style.backgroundImage = "url('https://media.istockphoto.com/id/514316008/photo/pyramids-in-sand.jpg?s=612x612&w=0&k=20&c=4H8mUyopSBmSTx3xRVsJkr87f7lQbPIPELKx6SGlZMM=')";
            canvasBackground = "#e6c38c";
            textColor = "#000000";
            textBackground = "rgba(255, 255, 255, 0.8)";
            break;
        case "savanna":
            document.body.style.backgroundImage = "url('https://www.snexplores.org/wp-content/uploads/2021/12/1440_SS_savanna_feat.jpg')";
            canvasBackground = "#d2b48c";
            textColor = "#000000";
            textBackground = "rgba(255, 255, 255, 0.8)";
            break;
        case "water":
            document.body.style.backgroundImage = "url('https://cdn.prod.website-files.com/61f7b4a324fc7902c9e4ab7a/6439a44e1ba631f201bef25e_Ocean%20Time.jpeg')";
            canvasBackground = "#0077be";
            textColor = "#ffffff";
            textBackground = "rgba(0, 0, 0, 0.6)";
            break;
        default:
            document.body.style.backgroundImage = "";
            canvasBackground = "#ffffff";
            textColor = "#000000";
            textBackground = "rgba(255, 255, 255, 0.8)";
    }

    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    canvas.style.backgroundColor = canvasBackground;

    settingsElement.style.color = textColor;
    settingsElement.style.backgroundColor = textBackground;
    titleElement.style.color = textColor;
    titleElement.style.backgroundColor = textBackground;
    gameOverElement.style.color = textColor;
    gameOverElement.style.backgroundColor = textBackground;

    resetGame();
}

themeSelect.addEventListener("change", (e) => {
    currentTheme = e.target.value;
    changeTheme(currentTheme);
});

colorPicker.addEventListener("input", (e) => {
    snakeColor = e.target.value;
});

restartButton.addEventListener("click", resetGame);

document.addEventListener("keydown", (e) => {
    if (!gameActive) return;

    switch (e.key) {
        case "ArrowUp":
            if (direction.y === 0) direction = { x: 0, y: -gridSize };
            break;
        case "ArrowDown":
            if (direction.y === 0) direction = { x: 0, y: gridSize };
            break;
        case "ArrowLeft":
            if (direction.x === 0) direction = { x: -gridSize, y: 0 };
            break;
        case "ArrowRight":
            if (direction.x === 0) direction = { x: gridSize, y: 0 };
            break;
    }
});

function startGame() {
    gameActive = true;
    snake = [{ x: 160, y: 160 }];
    direction = { x: gridSize, y: 0 };
    food = generateFood();
    score = 0;
    gameOverElement.style.display = "none";
    restartButton.style.display = "none";
    gameInterval = setInterval(updateGame, speed);
}

function resetGame() {
    clearInterval(gameInterval);
    startGame();
}

function updateGame() {
    if (!gameActive) return;

    const newHead = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y,
    };

    if (
        newHead.x < 0 ||
        newHead.x >= canvasSize ||
        newHead.y < 0 ||
        newHead.y >= canvasSize ||
        snake.some((s) => s.x === newHead.x && s.y === newHead.y)
    ) {
        gameOver();
        return;
    }

    snake.unshift(newHead);

    if (newHead.x === food.x && newHead.y === food.y) {
        score++;
        food = generateFood();

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore); // Save new high score
        }
    } else {
        snake.pop();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawSnake();
    drawFood();
    drawScore();
}

function drawGrid() {
    ctx.strokeStyle = "#cccccc";
    for (let i = 0; i < canvasSize; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvasSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvasSize, i);
        ctx.stroke();
    }
}

function drawSnake() {
    ctx.fillStyle = snakeColor;
    ctx.strokeStyle = "#000000";
    snake.forEach((segment) => {
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
        ctx.strokeRect(segment.x, segment.y, gridSize, gridSize);
    });
}

function drawFood() {
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, gridSize, gridSize);
}

function drawScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText(`Score: ${score} | High Score: ${highScore}`, 10, 20);
}

function generateFood() {
    let foodPosition;
    do {
        const x = Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize;
        const y = Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize;
        foodPosition = { x, y };
    } while (snake.some((s) => s.x === foodPosition.x && s.y === foodPosition.y));

    return foodPosition;
}

function gameOver() {
    clearInterval(gameInterval);
    gameActive = false;
    gameOverElement.style.display = "block";
    restartButton.style.display = "block";
}

preloadImages();
changeTheme(currentTheme);
