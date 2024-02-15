const BOIDS_COUNT = 50;
const BOID_SIZE = 7;
const INITIAL_BOID_SPEED = 10;
const BG_COLOR = '#222';
const BOID_COLOR = '#7FA';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const boids = [];

function setUpWorld() {
    generateBoids();
}

function generateBoids() {
    for (let i = 0; i < BOIDS_COUNT; ++i)
        boids.push({
            ...generateRandomPosition(),
            ...generateRandomInitialVelocity(),
        });
}

function generateRandomPosition() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
    };
}

function generateRandomInitialVelocity() {
    // Generate random movement direction:
    const angle = Math.random() * 360;
    const speed = INITIAL_BOID_SPEED;

    return {
        vx: speed * Math.cos(angle),
        vy: speed * Math.sin(angle),
    };
}

function renderWorld() {
    clearCanvas();
    renderBoids();
    requestAnimationFrame(renderWorld);
}

function clearCanvas() {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function renderBoids() {
    for (boid of boids) renderBoid(boid);
}

function renderBoid(boid) {
    ctx.beginPath();
    ctx.arc(boid.x, boid.y, BOID_SIZE, 0, 2 * Math.PI, false);
    ctx.fillStyle = BOID_COLOR;
    ctx.fill();
}

function performPhysics() {
    moveBoids();
}

function moveBoids() {
    for (boid of boids) {
        boid.x += boid.vx;
        boid.y += boid.vy;
    }
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

setUpWorld();
setInterval(performPhysics, 1000 / 50);
renderWorld();

