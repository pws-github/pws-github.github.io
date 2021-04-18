class Ball {
    // Color: 0 - green, 1 - red, 2 - blue
    constructor(x, y, vx, vy, r, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.r = r;
        this.color = color;
        this.illTime = 0;
    }
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    setVelocity(vx, vy) {
        this.vx = vx;
        this.vy = vy;
    }
    setColor(color) {
        this.color = color;
    }
}

function randomConfig() {
    let balls = []
    var canvas = document.getElementById("myCanvas");
    let vMax = 2;
    let rMin = 5;
    let rMax = 10;
    for (i=0; i<nBalls; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        let vx = Math.random() * vMax;
        let vy = Math.random() * vMax;
        let r = rMin + Math.random() * (rMax - rMin);
        let color = Math.round(Math.random() * 0.6);

        let b = new Ball(x, y, vx, vy, r, color);
        balls.push(b);
    }
    return balls;
}

function ballsOverlap(balls) {
    // This method checks if balls overlap
    // If balls overlap it returns true
    // Otherwise it returns false
    for (i=0; i<balls.length; i++) {
        for (j=i+1; j<balls.length; j++) {
            dist = Math.sqrt((balls[i].x - balls[j].x)**2 +
                             (balls[i].y - balls[j].y)**2);
            if (dist <= balls[i].r + balls[j].r) {
                console.log("Overlap!")
                return true;
            }
        }
    }
    return false;
}

function draw() {
    let time = new Date();
    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (i=0; i<balls.length; i++) {
        let x = balls[i].x;
        let vx = balls[i].vx;
        let y = balls[i].y;
        let vy = balls[i].vy;
        let r = balls[i].r;
        // Change color from red to blue
        if (balls[i].color == 1 && balls[i].illTime >= recoveryTime) {
            balls[i].setColor(2);
        }
        if (balls[i].color == 1) {
            // Increase illTime
            balls[i].illTime += 1;
        }
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        if (balls[i].color == 0) {
            ctx.fillStyle = "green";
        }
        else if (balls[i].color == 1) {
            ctx.fillStyle = "red";
        }
        else if (balls[i].color == 2) {
            ctx.fillStyle = "blue";
        }
        ctx.fill();
        // Bounce from walls
        if (x-r <= 0 && vx < 0) {
            balls[i].setVelocity(-vx, vy);
        }
        if (x+r >= canvas.width && vx > 0) {
            balls[i].setVelocity(-vx, vy);
        }
        if (y-r <= 0 && vy < 0) {
            balls[i].setVelocity(vx, -vy);
        }
        if (y+r >= canvas.height && vy > 0) {
            balls[i].setVelocity(vx, -vy);
        }
        
        // Bounce from balls
        for (j=i+1; j<balls.length; j++) {
            let x1 = balls[i].x;
            let vx1 = balls[i].vx;
            let y1 = balls[i].y;
            let vy1 = balls[i].vy;
            let r1 = balls[i].r;
            
            let x2 = balls[j].x;
            let vx2 = balls[j].vx;
            let y2 = balls[j].y;
            let vy2 = balls[j].vy;
            let r2 = balls[j].r;
            
            let m1 = Math.PI * r1**2;
            let m2 = Math.PI * r2**2;

            let dist = Math.sqrt((x1-x2)**2 + (y1-y2)**2);

            // Condition for a collision
            if (dist <= r1 + r2) {
                // Change color from green to red after a collision
                if (balls[i].color == 0 && balls[j].color == 1) {
                    balls[i].color = 1;
                }
                if (balls[i].color == 1 && balls[j].color == 0) {
                    balls[j].color = 1;
                }
                if (bounceFromBalls) {
                    let nvx1 = vx1 - 2*m2/(m1+m2)*((vx1-vx2)*(x1-x2)+
                                                (vy1-vy2)*(y1-y2))/
                                                dist**2 * (x1-x2);
                    let nvy1 = vy1 - 2*m2/(m1+m2)*((vx1-vx2)*(x1-x2)+
                                                (vy1-vy2)*(y1-y2))/
                                                dist**2 * (y1-y2);
                    let nvx2 = vx2 - 2*m1/(m1+m2)*((vx2-vx1)*(x2-x1)+
                                                (vy2-vy1)*(y2-y1))/
                                                dist**2 * (x2-x1);
                    let nvy2 = vy2 - 2*m1/(m1+m2)*((vx2-vx1)*(x2-x1)+
                                                (vy2-vy1)*(y2-y1))/
                                                dist**2 * (y2-y1);
                    balls[i].setVelocity(nvx1, nvy1);
                    balls[j].setVelocity(nvx2, nvy2);

                    // Move balls a litte after the collision,
                    // so they are not overlapping
                    let nv1Norm = Math.sqrt(nvx1**2+nvy1**2);
                    let nv2Norm = Math.sqrt(nvx2**2+nvy2**2);
                    balls[i].x += nvx1/nv1Norm *
                                 0.5*(balls[i].r + balls[j].r - dist);
                    balls[i].y += nvy1/nv1Norm *
                                 0.5*(balls[i].r + balls[j].r - dist);

                    balls[j].x += nvx2/nv2Norm *
                                 0.5*(balls[i].r + balls[j].r - dist);
                    balls[j].y += nvy2/nv2Norm *
                                 0.5*(balls[i].r + balls[j].r - dist);
                }
            }
        }
        // Move
        balls[i].setPosition(balls[i].x + balls[i].vx,
                             balls[i].y + balls[i].vy);
    }
    window.requestAnimationFrame(draw);
}

function reset() {
    balls = randomConfig();
}

function recoveryTimeIncrease() {
    recoveryTime += 60;
    document.getElementById("recoveryTime").innerHTML = "Recovery time: " +
                                                        recoveryTime/60 + " s";
}

function recoveryTimeDecrease() {
    if (recoveryTime > 60) {
        recoveryTime -= 60;
        document.getElementById("recoveryTime").innerHTML = "Recovery time: " +
                                                            recoveryTime/60 +
                                                            " s";
    }
}

function nBallsIncrease() {
    nBalls += 1;
    document.getElementById("nBalls").innerHTML = "Number of balls: " +
                                                        nBalls;
}

function nBallsDecrease() {
    nBalls -= 1;
    document.getElementById("nBalls").innerHTML = "Number of balls: " +
                                                        nBalls;
}

function bounceFromBallsOn() {
    bounceFromBalls = Boolean((bounceFromBalls + 1) % 2);
    document.getElementById("bounceFromBalls").innerHTML = "Bounce from balls: "
    + bounceFromBalls;
}

time = new Date();
start = time.getTime();
nBalls = 10;
bounceFromBalls = false;
do {
    balls = randomConfig(nBalls);
    console.log("Balls!");
} while (ballsOverlap(balls));
recoveryTime = 60*5;
window.requestAnimationFrame(draw);

