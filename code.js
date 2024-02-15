const DEBUG = true;
const DEBUG_BOID_PROTECTED_RANGE_COLOR = 'red';
const DEBUG_BOID_VISUAL_RANGE_COLOR = 'transparent';
const BOIDS_COUNT = 50;
const BOID_SIZE = 15;
const INITIAL_BOID_SPEED = 10;
const BOID_VISUAL_RANGE = 200;
const BOID_PROTECTED_RANGE = 70;
const BOID_AVOID_FACTOR = 1;
const BOID_MATCHING_FACTOR = 1;
const BOID_CENTERING_FACTOR = 0.0005;
const BOID_MAX_SPEED = 4; // FIXME: normalize!
const BORDER_MARGIN = 100;
const TURN_FACTOR = 0.1;
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
        x: Math.random() * (canvas.width - 2 * BORDER_MARGIN) + BORDER_MARGIN,
        y: Math.random() * (canvas.height - 2 * BORDER_MARGIN) + BORDER_MARGIN,
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

function renderBoid(boid, simplify = true) {
    if (DEBUG) {
        ctx.beginPath();
        ctx.arc(boid.x, boid.y, BOID_PROTECTED_RANGE, 0, 2 * Math.PI, false);
        ctx.strokeStyle = DEBUG_BOID_PROTECTED_RANGE_COLOR;
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(boid.x, boid.y, BOID_VISUAL_RANGE, 0, 2 * Math.PI, false);
        ctx.strokeStyle = DEBUG_BOID_VISUAL_RANGE_COLOR;
        ctx.closePath();
        ctx.stroke();
    }

    if (simplify) {
        ctx.beginPath();
        ctx.arc(boid.x, boid.y, BOID_SIZE, 0, 2 * Math.PI, false);
        ctx.fillStyle = BOID_COLOR;
        ctx.closePath();
        ctx.fill();
        return;
    }

    function rotatePoint(x, y, pivotX, pivotY, angle) {
        const translatedX = x - pivotX;
        const translatedY = y - pivotY;

        return {
            x: (translatedX * Math.cos(angle)) - (translatedY * Math.sin(angle)) + pivotX,
            y: (translatedX * Math.sin(angle)) + (translatedY * Math.cos(angle)) + pivotY,
        }
    }

    // Function to convert degrees to radians
    function degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    // Function to draw an equilateral triangle
    function drawEquilateralTriangle(x, y) {
        const boidMovementDirection = Math.atan2(boid.vy, boid.vx) * (Math.PI / 180);
        const angleIncrement = 120; // 360 degrees divided by 3 sides
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            const angle = degreesToRadians(i * angleIncrement);
            const vertexX = x + BOID_SIZE * Math.cos(angle);
            const vertexY = y + BOID_SIZE * Math.sin(angle);
            const rotatedPoint = rotatePoint(vertexX, vertexY, boid.x, boid.y, boidMovementDirection);

            if (i === 0) {
                ctx.moveTo(rotatedPoint.x, rotatedPoint.y);
            } else {
                ctx.lineTo(rotatedPoint.x, rotatedPoint.y);
            }
        }
        ctx.closePath();
        ctx.fillStyle = BOID_COLOR;
        ctx.fill(); // or ctx.fill() if you want to fill the triangle
    }

    drawEquilateralTriangle(boid.x, boid.y)
}

function performPhysics() {
    moveBoids();
}

function distance(x1, y1, x2, y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    return Math.sqrt(a * a + b * b);
}

function moveBoids() {
    for (boid of boids) {

        let closeDx = 0;
        let closeDy = 0;

        let neighboringBoids = 0;
        let xVelAvg = 0, yVelAvg = 0;
        let xPosAvg = 0, yPosAvg = 0;

        for (otherBoid of boids) {
            const dist = distance(boid.x, boid.y, otherBoid.x, otherBoid.y);


            // Separation:
            if (dist < BOID_PROTECTED_RANGE) {
                closeDx += boid.x - otherBoid.x;
                closeDy += boid.y - otherBoid.y;
            }
            else if (dist < BOID_VISUAL_RANGE) {
                // Alignment:
                xVelAvg += otherBoid.vx;
                yVelAvg += otherBoid.vy;

                closeDx += boid.x - otherBoid.x;
                closeDy += boid.y - otherBoid.y;

                // Cohesion:
                xPosAvg += otherBoid.x
                yPosAvg += otherBoid.y


                neighboringBoids += 1;
            }
        }

        if (neighboringBoids > 0) {
            // Alignment:
            xVelAvg = xVelAvg / neighboringBoids;
            yVelAvg = yVelAvg / neighboringBoids;

            // Cohesion:
            xPosAvg = xPosAvg / neighboringBoids
            yPosAvg = yPosAvg / neighboringBoids
        }

        // Separation:
        boid.vx += closeDx * BOID_AVOID_FACTOR
        boid.vy += closeDy * BOID_AVOID_FACTOR

        // Alignment:
        boid.vx += (xVelAvg - boid.vx) * BOID_MATCHING_FACTOR;
        boid.vy += (yVelAvg - boid.vy) * BOID_MATCHING_FACTOR;

        // Cohesion:
        boid.vx += (xPosAvg - boid.x) * BOID_CENTERING_FACTOR
        boid.vy += (yPosAvg - boid.y) * BOID_CENTERING_FACTOR

        boid.x += Math.min(boid.vx, BOID_MAX_SPEED);
        boid.y += Math.min(boid.vy, BOID_MAX_SPEED);

        if (boid.x < BORDER_MARGIN)
            boid.vx = boid.vx + TURN_FACTOR
        if (boid.x > canvas.width - BORDER_MARGIN)
            boid.vx = boid.vx - TURN_FACTOR
        if (boid.y > canvas.height - BORDER_MARGIN)
            boid.vy = boid.vy - TURN_FACTOR
        if (boid.y < BORDER_MARGIN)
            boid.vy = boid.vy + TURN_FACTOR
    }
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

setUpWorld();
setInterval(performPhysics, 1000 / 50);
renderWorld();
