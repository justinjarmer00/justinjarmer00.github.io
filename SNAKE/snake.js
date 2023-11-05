let canvas, ctx;
let player;
let isPaused = false;
let lastTime = 0;
let gameTime = 0;
let gameOver = false;
let gameStarted = false; // Flag to check if the game has started
let fps = 60; // Desired frames per second
let frameDuration = 1000 / fps; // Duration of one frame in ms
let nextFrameTime = 0; // When the next frame should occur
let fullscreenButton = document.getElementById('fullscreenButton');
var redApple;
var greenApple;
var enemies = [];
var missiles = [];
//console.log(enemies);
var enemyFollow;
var enemyLead;
var enemyBlock;
var enemyLeadBlock;
let frameCount = 0;
let enemiesMade = 0;
let enemiesMade1 = 0;
let enemiesMade3 = 0;
let gaussianLookup = new Array(100); // 300 = (3 - 0) / 0.01
let teleportation = false;
let teleParticals = [];
let ghosts = [];
let teleParticalColors = ['rgba(128, 0, 128, 1)','rgba(200, 150, 220, 1)','rgba(255, 105, 180, 1)','rgba(231, 84, 128, 1)','rgba(231, 84, 128, 1)']; //duplicate value is for how the rand numbers are being handled
let movementFlags = [];
let bosses = [];
let bossesMade = 0;
let initialStart = false;

// Check if the user is on a mobile device
const isMobile = 'ontouchstart' in document.documentElement;

for (let i = 0; i < gaussianLookup.length; i++) {
    // Convert the index to a value between 0 and 3
    let x = i * 0.03;

    // Calculate the Gaussian value
    gaussianLookup[i] = Math.exp(-0.5 * x * x); // For a standard Gaussian with mean 0 and std dev 1
};

let gameState = {
    score: 0,
    frameScore: 0,
    missiles: 0,
    missileCooldown: 0,  // value from 0 to 1, 1 meaning fully cooled down
    infMissiles: false,
    missileTime: 3000,
    lastMissileTime: 0,
    critScore: 1500,
    bossDead: false,
    lastStage: 1,
    stageFlag: false,
    stage1multi: 2,
    stage1basetime: 60000,
    stage2multi: 2,
    stage2starttime: 0,
    stage2basetime: 100000,
    stage3starttime: 0,
    stage3basetime: 100000,
    stage3multi: 1,
    stageMulti: 3,
    lengthMulti: 1,
    manager() {
        this.scoreHandler();
        this.multiManager();
        this.teleManager();
    },
    scoreHandler() {
        if (this.stage() === 3) {
            this.score += this.frameScore*this.stageMulti*this.lengthMulti;
        } else {
            this.score += this.frameScore*this.lengthMulti;
        }
        this.frameScore = 0;

        if (this.lastStage != this.stage() && this.stage != 1 && this.lastStage != 3) {
            this.lastStage = this.stage();
            this.stageFlag = true;
        } else if (this.lastStage != this.stage() && this.stage === 1) {
            this.lastStage = this.stage();
            this.stageFlag = false;
        } else {
            this.stageFlag = false;
            this.lastStage = this.stage();
        }

        if (this.stageFlag) {
            this.score = this.score * this.stageMulti;
        }

        this.score = Math.ceil(this.score);
    },
    teleManager() {
        if (this.score >= this.critScore) {
            teleportation = true;
        } else {
            teleportation = false;
        }
    },
    multiManager() {
        if (this.stage() === 1) {
            const time = gameTime < this.stage1basetime ? gameTime: this.stage1basetime;
            this.stageMulti = Math.round(10*this.stage1multi*(this.stage1basetime - time)/this.stage1basetime)/10 + 1;
        } else if (this.stage() === 2) {
            const time = gameTime - this.stage2starttime < this.stage2basetime ? gameTime - this.stage2starttime: this.stage2basetime;
            this.stageMulti = Math.round(10*this.stage1multi*(this.stage2basetime - time)/this.stage2basetime)/10 + 1;
        } else {
            const time = gameTime - this.stage3starttime;
            this.stageMulti = Math.round(10*time/this.stage3basetime)/10 + 1;
        }
    },
    loadMissile(gameTime) {
        let maxMissiles = 5;

        //console.log(gameTime)
        //console.log(this.lastMissileTime)
        //console.log(this.missileTime)

        if (this.infMissiles){
            this.missiles = Infinity;
            this.missileCooldown = 1;
            return
        }

        if (this.missiles == maxMissiles){
            this.lastMissileTime = gameTime;
            this.missileCooldown = 0
            return
        } else if (gameTime >= this.lastMissileTime + this.missileTime) {
            this.lastMissileTime = gameTime;
            this.missiles ++;
            this.missileCooldown = 0;
        } else {
            this.missileCooldown = (gameTime - this.lastMissileTime)/this.missileTime;
        }
    },
    stage() {
        if (this.score >= this.critScore && this.bossDead) {
            if (this.lastStage != 3) {
                this.stage3starttime = gameTime;
            }
            return 3; //stage 3
        } else if (this.score >= this.critScore) {
            if (this.lastStage != 2) {
                this.stage2starttime = gameTime;
            }
            return 2; //stage 2
        } else {
            return 1; //stage 1
        }
    }
};

class Contrail{
    constructor(x,y,size,color){
        this.x = x,
        this.y = y,
        this.width = size,
        this.height = size,
        this.color = color,
        this.tele = false,
        this.effects = true
    }
    render() {
        ctx.fillStyle = this.color
        ctx.fillRect(this.x*scale, this.y*scale, this.width*scale, this.height*scale);
    }
}

class TelePartical{
    constructor(x,y,dx,dy,size,time,color) {
        this.x = x,
        this.y = y,
        this.dx = dx,
        this.dy = dy,
        this.width = size,
        this.height = size,
        this.color = color,
        this.effects = true,
        this.tele = false,
        this.terminate = false,
        this.time = time;
    }
    manage(gameTime) {
        if (gameTime > this.time){
            this.terminate = true;
            return
        }
        this.x += this.dx;
        this.y += this.dy;
    }
    render() {
        ctx.fillStyle = this.color
        ctx.fillRect(this.x*scale, this.y*scale, this.width*scale, this.height*scale);
    }
}

class Drifter {
    constructor(x,y,dx,dy,s1,s2,t0,t,color) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.size;
        this.width = s1;
        this.height = s1;
        this.s1 = s1;
        this.s2 = s2;
        this.t0 = t0;
        this.t = t;
        this.initColor = color;
        this.color = color;
        this.effects = true;
        this.terminate = false;
        this.colorFinal = "rgba(255,255,255,1)";
        this.drifter = true;
    }

    manage(gameTime) {
        const timeMulti = (this.t - gameTime)/(this.t - this.t0)
        if (timeMulti <= 0) {
            //console.log('kill meeeeee pls')
            this.terminate = true;
            return
        }
        this.manageSize(timeMulti);
        this.manageColor(timeMulti);
        this.x += timeMulti*this.dx;
        this.y += timeMulti*this.dy;
    }

    manageSize(timeMulti) {
        this.size = this.s2 - (this.s2 - this.s1)*timeMulti
        this.width = this.size;
        this.height = this.size;
    }

    manageColor(timeMulti) {
        let color = parseRGBA(this.initColor);
        let colorFinal = parseRGBA(this.colorFinal);
        color.r = colorFinal.r - (colorFinal.r - color.r)*timeMulti;
        color.g = colorFinal.g - (colorFinal.g - color.g)*timeMulti;
        color.b = colorFinal.b - (colorFinal.b - color.b)*timeMulti;
        color.intensity = timeMulti;
        color = "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.intensity + ")";
        this.color = color;
    }

    render() {
        ctx.fillStyle = this.color
        ctx.fillRect((this.x-this.size/2)*scale, (this.y-this.size/2)*scale, this.width*scale, this.height*scale);
    }
}

class MovementFlag{
    constructor(direction, time){
        this.direction = direction,
        this.terminate = false,
        this.startTime = time
    }
}

class Segment{
    constructor(x,y){
        this.x = x,
        this.y = y,
        this.width = player.width,
        this.height = player.height,
        this.renderCount = 3,
        this.color = "rgba(255,255,255,1)",
        this.magMulti = 0.1,
        this.tele = true,
        this.effects = true
        this.particalMulti = 0.1
    }
    render(index, frameCount) {
        if (player.speed() > player.normalSpeed){
            if (Math.abs(frameCount - index) % 8 == 1){
                this.color = "rgba(0,255,0,1)";
                this.magMulti = 0.3;
            } else if (Math.abs(frameCount - index) % 8 == 0 || Math.abs(frameCount - index) % 8 == 2){
                this.color = "rgba(150,255,150,1)";
                this.magMulti = 0.2;
            } else {
                this.color = "rgba(255,255,255,1)";
                this.magMulti = 0.1;
            }
        } else {
            this.color = "rgba(255,255,255,1)";
            this.magMulti = 0.1;
        }
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x*scale, this.y*scale, player.width*scale, player.height*scale);
    }
}

class Missile{
    constructor(x,y,size,dx,dy,color,time, neutral, boomMulti, blinkColor){
        this.x = x,
        this.y = y,
        this.dx = dx,
        this.dy = dy,
        this.width = size,
        this.height = size,
        this.color = color,
        this.time = time,
        this.contrailLength = 30,
        this.detonated = false,
        this.finished = false,
        this.contrail = [],
        this.colorIndex = 1,
        this.explosion = [],
        this.neutral = neutral,
        this.boomMulti = boomMulti,
        this.explosionStart = 0,
        this.explosionTime = 100,
        this.terminate = false,
        this.fizzTime = 1500,
        this.magMulti = 2,
        this.tele = true,
        this.effects = true;
        this.initColor = color;
        this.blinkColor = blinkColor;
    }

    movement(gameTime) {
        if (this.explosionStart != 0 && gameTime >= this.explosionStart + this.explosionTime + this.fizzTime){
            this.terminate = true;
            return
        }
        if (this.explosionStart != 0 && gameTime >= this.explosionStart + this.explosionTime){
            this.finished = true;
            return
        }
        if (gameTime >= this.time){
            this.detonated = true;
            this.finished = false;
        }
        if (!this.finished){
            if (this.detonated) {
                this.x += this.dx/3;
                this.y += this.dy/3;
            } else {
                this.x += this.dx;
                this.y += this.dy;
            }
        }
    }

    manageContrails() {
        if (this.detonated) {return}
        const size = this.width/4;
        const xpos = this.x + this.width/2 - size/2;
        const ypos = this.y + this.height/2 - size/2;
        /*
        let contrail = new Contrail(xpos,ypos,size,"rgba(255,255,255,1)");
        this.contrail.unshift(contrail);
        if (this.contrail.length > this.contrailLength) {
            this.contrail.pop();
        }
        */
        let colors = [];
        let rand1 = 3*Math.random();
        let rand2 = (Math.random() - 0.5);
        let rand3 = (Math.random() - 0.5);
        let rand4 = 0.5*(Math.random() - 0.5);
        let rand5 = 0.5*(Math.random() - 0.5);
        let rand6 = 400*(Math.random() - 0.5);
        let rand7 = (Math.random() + 0.5);
        let rand8 = (Math.random() + 0.5);
        let contrail = new Drifter(xpos + this.width*rand2,ypos + this.width*rand3,-(this.dx*rand4)/10,-(this.dy*rand5)/10,(this.width*rand7)/4,(this.width*rand8),gameTime,gameTime + 1000 + rand6,this.color);
        teleParticals.push(contrail);
    }

    manageExplosion(gameTime) {
        if (this.detonated && this.explosionStart == 0){
            this.explosionStart = gameTime;
        }
        if (this.finished && !this.terminate){
            for (let i = 0; i < this.explosion.length/(this.fizzTime*fps/1000); i++){
                this.explosion.shift();
            }            
        }
        if (this.detonated && !this.finished){
            let elapsedTime = (gameTime - this.explosionStart)/this.explosionTime;
            while (this.explosion.length >= 30){
                this.explosion.shift();
            }
            if (this.explosionTime >= elapsedTime){
                let baseNumParticals = 5*this.width;
                let baseVelocity = 10;
                let baseTime = 50*this.width;
                let sizeVar = 3;
                for (let i = 0; i < baseNumParticals; i++) {
                    let rand1 = Math.random()*2*Math.PI;
                    let rand2 = Math.random()*0.5 + 0.75;
                    let rand3 = Math.random();
                    let rand4 = Math.random();
                    let rand5 = Math.random();
                    let dx = baseVelocity*Math.cos(rand1)*rand2;
                    let dy = baseVelocity*Math.sin(rand1)*rand2;
                    let size = 2 + sizeVar*rand3;
                    let color = teleParticalColors[Math.floor(4*rand4)];
                    let time = gameTime + baseTime*rand5;
                    teleParticals.push(new TelePartical(this.x,this.y,dx,dy,size,time,color))
                }
                for (let i = 0; i < baseNumParticals/2; i++) {
                    const rand1 = Math.random()*2*Math.PI;
                    const rand2 = Math.random();
                    const rand3 = Math.random();
                    const rand6 = Math.random() + 0.5;
                    const dx = baseVelocity*Math.cos(rand1)*rand2*0.7;
                    const dy = baseVelocity*Math.sin(rand1)*rand2*0.7;
                    const size = 2 + sizeVar*rand3; //correct this
                    const time = gameTime + 2*baseTime*rand6; //correct this
                    let color;
                    const randc = Math.random();
                    if (randc < 0.5) {
                        color =  "rgba(255,0,0,1)";
                    } else if (randc < 0.8){
                        color = "rgba(255,255,0,1)";
                    } else {
                        color = "rgba(255,165,0,1)";
                    }
                    const xpos = this.x + this.width/2;
                    const ypos = this.y + this.height/2;
                    const drifter = new Drifter(xpos,ypos,dx,dy,size,size*4,gameTime,time,color);
                    teleParticals.push(drifter);
                }

            }
        }
    }

    render(count, gameTime) {
        this.contrail.forEach((contrail) => {
            contrail.render()
        });
        this.explosion.forEach((partical) => {
            partical.render()
        });
        if (!this.detonated && gameTime + 1000 <= this.time){
            if (count % 10 == 0){
                if (this.colorIndex % 2 == 0){
                    this.color = this.blinkColor;
                } else {
                    this.color = this.initColor;
                }
                this.colorIndex += 1;
            }
            
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x * scale, this.y * scale, this.width * scale, this.height * scale);
            return
        } else if (!this.detonated){
            if (count % 4 == 0){
                if (this.colorIndex % 2 == 0){
                    this.color = this.blinkColor;
                } else {
                    this.color = this.initColor;
                }
                this.colorIndex += 1;
            }
            
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x * scale, this.y * scale, this.width * scale, this.height * scale);
            return
        }
    }
}

class BossSquareGhost {
    constructor(x,y,size,color) {
        this.x = x;
        this.y = y;
        this.height = size;
        this.width = size;
        this.tele = false;
        this.effects = true;
        this.color = color;
        this.fullDamage = false;
    }

    render() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x * scale, this.y * scale, this.width * scale, this.height * scale);
    }
}

class BossSquare {
    constructor(x, y, size, health, center, magMulti, particalMulti) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.width = size;
        this.height = size;
        this.maxhealth = health
        this.health = health;
        this.finished = false;
        this.ghostSquares = [];
        this.center = center;
        this.mag = magMulti;
        this.partical = particalMulti;
        this.centerContact = false;
        this.timeout = 0;
    }

    color() {
        if (this.health/this.maxhealth < 0.33) {
            return "rgba(255,0,0,1)";
        } else if (this.health/this.maxhealth < 0.66){
            return"rgba(255,165,0,1)";
        } else {
            return "rgba(255,255,0,1)";
        }
    }

    buildGhosts(ghostCenters) {
        this.ghostSquares = [];
        ghostCenters.forEach((position) => {
            this.ghostSquares.push(new BossSquareGhost(position[0] + this.x, position[1] + this.y, this.size, this.color()))
        })
    }

    update() {
        let healthChange = 0
        this.ghostSquares.forEach((ghost) => {
            //damage
            if (ghost.fullDamage) {
                console.log('hit')
                healthChange += 3;
            }
            if (ghost.partialDamage) {
                healthChange += 1
            }
        });
        this.health -= healthChange;
        if (this.health < 1) {
            console.log('dead')
            this.finished = true;
            gameState.frameScore += 50;
        }
    }

    magMulti() {
        if (center) {
            return this.mag * 2;
        } else {
            return this.mag;
        }
    }

    particalMulti() {
        if (center) {
            return this.partical * 2;
        } else {
            return this.partical;
        }

    }

    render() {
        this.ghostSquares.forEach((ghost) => {
            ghost.render()
        })
    }
}

class Boss{
    constructor() {
        this.x = gameWidth/2;
        this.y = gameHeight + 100;
        this.width = 80;
        this.height = 80;
        this.color = 'rgba(255,255,255,1)';
        this.spawned = false;
        this.speed = 1;
        this.tele = true;
        this.effects = false;
        this.magMulti = 0.5;
        this.particalMulti = 1.5;
        this.finished = false;
        this.dx;
        this.dy;
        this.ghosts = [];
        this.masterSquares = [];
        this.positions = [];
        this.clock;
        this.clockStarted = false;
        this.lastAttack;
        this.coolDown = 3000;
        this.attackType = 'none';
        this.running = false;
        this.runningcooldown = 0;
        this.chargeMulti = 5;
        this.chargeDuration = 2000;
        this.chargeEnd;
        this.attacking = false;
        this.arriving = true;
        this.entranceTime = 3000;
        this.display = false;
    }

    update() {
        if (!this.clockStarted) {
            this.clock = gameTime;
            this.clockStarted = true;
        }

        if (this.finished) {
            console.log('boss is finished')
            return
        }

        this.masterSquares.forEach((masterSquare) => {
            masterSquare.update();

            //set up for connection check
            masterSquare.centerContact = false;
        });

        let noChange = false;

        while (!noChange) {
            noChange = true;
            for (let i = 0; i < this.masterSquares.length; i++) {
                if (this.masterSquares[i].centerContact || this.masterSquares[i].center) {
                    continue
                }
                for (let j = 0; j < this.masterSquares.length; j++) {
                    if (i != j && isColliding(this.masterSquares[i], this.masterSquares[j])) {
                        if (this.masterSquares[j].centerContact || this.masterSquares[j].center) {
                            //console.log('here')
                            this.masterSquares[i].centerContact = true; // Corrected here
                            noChange = false;
                            break; // this will break out of the j loop but not the i loop
                        }
                    }
                }
            }
            if (noChange) {

                // Check and set the finished property
                this.masterSquares.forEach((square) => {
                    if (!square.centerContact && !square.center) {
                        square.finished = true; // Corrected here
                    }
                });

                break
            }
        }
        

        this.masterSquares = this.masterSquares.filter(function(masterSquare) {
            if (masterSquare.finished){
                return false;
            } else {
                return true;
            }
        });

        //console.log(this.masterSquares)

        if(this.masterSquares.length < 1) {
            this.finished = true;
        }

        this.attackManager();
        this.entrance();
    }

    entrance() {
        if (this.entranceTime >= gameTime - this.clock) {
            const timeM = 5*(gameTime - this.clock)/this.entranceTime + 1
            this.arriving = true;
            let baseNumParticals = 5*timeM;
            let baseVelocity = 3*Math.sqrt(timeM);
            let baseTime = 800;
            let sizeVar = 3;
            const randx = Math.random() - 0.5;
            const randy = Math.random() - 0.5;
            const xpos = (this.x + this.width/2) + this.width*randx/4;
            const ypos = (this.y + this.height/2) + this.height*randy/4;
            for (let i = 0; i < baseNumParticals; i++) {
                let rand1 = Math.random()*2*Math.PI;
                let rand2 = Math.random()*0.5 + 0.75;
                let rand3 = Math.random();
                let rand4 = Math.random();
                let rand5 = Math.random();
                let dx = baseVelocity*Math.cos(rand1)*rand2;
                let dy = baseVelocity*Math.sin(rand1)*rand2;
                let size = 2 + sizeVar*rand3;
                let color = teleParticalColors[Math.floor(4*rand4)];
                let time = gameTime + baseTime*rand5;
                teleParticals.push(new TelePartical(xpos,ypos,dx,dy,size,time,color))
            }
            for (let i = 0; i < baseNumParticals/2; i++) {
                const rand1 = Math.random()*2*Math.PI;
                const rand2 = Math.random();
                const rand3 = Math.random();
                const rand6 = Math.random() + 0.5;
                const dx = baseVelocity*Math.cos(rand1)*rand2*0.7;
                const dy = baseVelocity*Math.sin(rand1)*rand2*0.7;
                const size = 2 + sizeVar*rand3; //correct this
                const time = gameTime + 2*baseTime*rand6; //correct this
                let color = "rgba(255,255,0,1)";
                /*
                const randc = Math.random();
                if (randc < 0.5) {
                    color =  "rgba(255,0,0,1)";
                } else if (randc < 0.8){
                    color = "rgba(255,255,0,1)";
                } else {
                    color = "rgba(255,165,0,1)";
                } */
                const drifter = new Drifter(xpos,ypos,dx,dy,size,size*4,gameTime,time,color);
                teleParticals.push(drifter);
            }
        } else {
            this.arriving = false;
        }
        

    }

    attackManager() {
        if(gameTime - this.clock - this.entranceTime < 3000) {return}
        if(gameTime - this.lastAttack < this.coolDown && !this.attacking) {return}

        if(!this.attacking) {
            const rand = Math.random();
            if (rand < 0.6) {
                this.attackType = 'standard';
            } else if (rand < 0.9){
                this.attackType = 'charge';
                this.chargeEnd = gameTime + this.chargeDuration;
                console.log(this.chargeEnd)
            } else if (rand < 1) {
                this.attackType = 'ultimate';
            }
            this.attacking = true;
        }
        this.lastAttack = gameTime;
        if (this.attackType === 'standard') {
            const missileV = 8;
            let centerX = this.x + this.width / 2;
            let centerY = this.y + this.height / 2;
            let dist = Math.sqrt((player.x - centerX)**2 + (player.y - centerY)**2);
            let angleRAW = Math.atan2(player.y - centerY, player.x - centerX);
            //let dx = Math.cos(3.14);
            //let dy = Math.sin(3.14);
            let dx1 = missileV*Math.cos(angleRAW);
            let dy1 = missileV*Math.sin(angleRAW);
            let dx2 = missileV*Math.cos(angleRAW + 0.2)//Math.sqrt(dist**2 + dx**2);
            let dy2 = missileV*Math.sin(angleRAW + 0.2)//Math.sqrt(dist**2 + dy**2);
            let dx3 = missileV*Math.cos(angleRAW - 0.2)//Math.sqrt(dist**2 + dx**2);
            let dy3 = missileV*Math.sin(angleRAW - 0.2)//Math.sqrt(dist**2 + dy**2);
            let missile1 = new Missile(centerX,centerY,this.width/8,dx1,dy1, "rgba(255,0,0,1)", gameTime + 3000, false, 3, "rgba(255,255,255,1)");
            missiles.push(missile1);
            let missile2 = new Missile(centerX,centerY,this.width/8,dx2,dy2, "rgba(255,0,0,1)", gameTime + 3000, false, 3, "rgba(255,255,255,1)");
            missiles.push(missile2);
            let missile3 = new Missile(centerX,centerY,this.width/8,dx3,dy3, "rgba(255,0,0,1)", gameTime + 3000, false, 3, "rgba(255,255,255,1)");
            missiles.push(missile3);
            this.attacking = false;
        } else if (this.attackType === 'ultimate') {
            const angle = Math.PI/8
            const num = Math.PI*2/angle;
            const missileV = 8;
            let centerX = this.x + this.width / 2;
            let centerY = this.y + this.height / 2;
            for (let i = 0; i < num; i++) {
                let dx1 = missileV*Math.cos(angle*i);
                let dy1 = missileV*Math.sin(angle*i);
                let missile1 = new Missile(centerX,centerY,this.width/8,dx1,dy1, "rgba(255,0,0,1)", gameTime + 3000, false, 3, "rgba(255,255,255,1)");
                missiles.push(missile1);
            }
            this.attacking = false;
        } else if (this.attackType === 'charge') {
            if (gameTime > this.chargeEnd) {
                this.attacking = false;
            }
        }
        
    }

    buildPositions() {
        this.positions = [];
        this.positions.push([this.x, this.y]);
        this.positions.push([this.x + gameWidth + 20, this.y]);
        this.positions.push([this.x - gameWidth -20, this.y]);
        this.positions.push([this.x, this.y + gameHeight + 20]);
        this.positions.push([this.x, this.y - gameHeight - 20]);
        this.positions.push([this.x + gameWidth + 20, this.y + gameHeight + 20]);
        this.positions.push([this.x - gameWidth -20, this.y - gameHeight - 20]);
        this.positions.push([this.x + gameWidth + 20, this.y + gameHeight + 20]);
        this.positions.push([this.x - gameWidth -20, this.y - gameHeight - 20]);
    }

    buildGhosts() {
        this.buildPositions()
        this.masterSquares.forEach((square) => {
            square.buildGhosts(this.positions);
        });
    }

    drawEyes(positions) {
        positions.forEach((position) => {
            const xCen = position[0] + this.width/2;
            const yCen = position[1] + this.height/2;
            const wO = 15;
            const hO = 20;
            let borderS = 2;
            let borderT = 2;
            const distB = 2;
            const eyeW = 5;
            const eyeH = 8;
            let eyeXL;
            let eyeXR;
            let eyeY;
            let color = ctx.fillStyle = 'rgba(255,255,255,1)';
            if (this.attacking) {
                if (this.attackType === 'standard' && !this.running) {
                    eyeXL = xCen - distB - wO/2 + (wO/2 - borderS - eyeW/2)*this.dx - eyeW/2;
                    eyeXR = xCen + distB + wO/2 + (wO/2 - borderS - eyeW/2)*this.dx - eyeW/2;
                    eyeY = yCen + (hO/2 - borderT - eyeH/2)*this.dy - eyeH/2;
                    borderT = 4;
                    
                } else if (this.attackType === 'standard' && this.running) {
                    eyeXL = xCen - distB - wO/2 + (wO/2 - borderS - eyeW/2)*(-this.dx) - eyeW/2;
                    eyeXR = xCen + distB + wO/2 + (wO/2 - borderS - eyeW/2)*(-this.dx) - eyeW/2;
                    eyeY = yCen + (hO/2 - borderT - eyeH/2)*(-this.dy) - eyeH/2;
                    borderT = 4;
                } else if (this.attackType === 'ultimate'){
                    eyeXL = xCen - distB - wO/2 + (wO/2 - borderS - eyeW/2)*(-this.dx) - eyeW/2;
                    eyeXR = xCen + distB + wO/2 + (wO/2 - borderS - eyeW/2)*(-this.dx) - eyeW/2;
                    eyeY = yCen + (hO/2 - borderT - eyeH/2)*(-this.dy) - eyeH/2;
                    borderT = 2;
                    color = 'rgba(255,100,100,1)'
                } else if (this.attackType === 'charge') {
                    eyeXL = xCen - distB - wO/2 + (wO/2 - borderS - eyeW/2)*(this.dx/this.chargeMulti) - eyeW/2;
                    eyeXR = xCen + distB + wO/2 + (wO/2 - borderS - eyeW/2)*(this.dx/this.chargeMulti) - eyeW/2;
                    eyeY = yCen + (hO/2 - borderT - eyeH/2)*(this.dy/this.chargeMulti) - eyeH/2;
                    borderT = 5;
                    color = 'rgba(255,100,100,1)'
                }
            } else {
                eyeXL = xCen - distB - wO/2 + (wO/2 - borderS - eyeW/2)*this.dx - eyeW/2;
                eyeXR = xCen + distB + wO/2 + (wO/2 - borderS - eyeW/2)*this.dx - eyeW/2;
                eyeY = yCen + (hO/2 - borderT - eyeH/2)*this.dy - eyeH/2;
            }
            ctx.fillStyle = 'rgba(0,0,0,1)';
            ctx.fillRect((xCen - distB - wO) * scale, (yCen - hO/2) * scale, wO * scale, hO * scale);
            ctx.fillRect((xCen + distB) * scale, (yCen - hO/2) * scale, wO * scale, hO * scale);

            ctx.fillStyle = color;
            ctx.fillRect((xCen - distB - wO + borderS) * scale, (yCen - hO/2 + borderT) * scale, (wO - borderS*2) * scale, (hO - borderT*2) * scale);
            ctx.fillRect((xCen + distB + borderS) * scale, (yCen - hO/2 + borderT) * scale, (wO - borderS*2) * scale, (hO - borderT*2) * scale);
            
            ctx.fillStyle = 'rgba(0,0,0,1)';
            ctx.fillRect(eyeXL * scale, eyeY * scale, eyeW * scale, eyeH * scale);
            ctx.fillRect(eyeXR * scale, eyeY * scale, eyeW * scale, eyeH * scale);

            
        })
    }

    movement(player) {
        if (this.finished || this.arriving) {
            return
        }

        let centerX = this.x + this.width / 2;
        let centerY = this.y + this.height / 2;
        let dist = Math.sqrt((player.x - centerX)**2 + (player.y - centerY)**2);
        if (this.attackType === 'ultimate' && this.attacking) {
            this.dx = 0;
            this.dy = 0;
        } else if (this.attackType === 'charge' && this.attacking) {
            this.running = false
            this.dx = this.chargeMulti*(player.x - centerX)/dist;
            this.dy = this.chargeMulti*(player.y - centerY)/dist;
        } else if (dist >= 300 && (this.running === false || this.runningcooldown < gameTime)) {
            if (this.running === true) {
                this.running = false;
                this.runningcooldown = gameTime + 200;
            }
            this.dx = (player.x - centerX)/dist;
            this.dy = (player.y - centerY)/dist;
        } else if (this.running === true || this.runningcooldown < gameTime) {
            if (this.running === false) {
                this.running = true;
                this.runningcooldown = gameTime + 200;
            }
            this.dx = -(player.x - centerX)/dist;
            this.dy = -(player.y - centerY)/dist;
        }
        this.x += this.speed*this.dx;
        this.y += this.speed*this.dy;
    }

    render() {
        if (this.arriving) {return}
       this.masterSquares.forEach((square) => {
            square.render();
       })
       this.drawEyes(this.positions);
    }

    initializeSquares() {
        this.lastAttack = gameTime;
        const gridDimension = 10; // 6x6 grid
        
        // Given the boss's height (or width) and the grid dimension, 
        // determine the size of each individual square.
        const squareSize = this.height / gridDimension;
    
        // The center square occupies a 2x2 position, so it's twice the size.
        const centerSquareSize = (squareSize) * 4;
    
        for (let i = 0; i < gridDimension; i++) {
            for (let j = 0; j < gridDimension; j++) {
                // Determine position for the square relative to the top-left corner.
                let x = (i * squareSize);
                let y = (j * squareSize);
                
                let square;
                const baseHealth = 5;
                if (i == 3 && j == 3) {
                    square = new BossSquare(x - 0.5, y - 0.5, centerSquareSize + 1, 3*baseHealth, true, this.magMulti, this.particalMulti);
                } else if (!(i > 2 && i < 7 && j > 2 && j < 7)) {
                    square = new BossSquare(x - 0.5, y - 0.5, squareSize + 1, baseHealth, false, this.magMulti, this.particalMulti);
                }
    
                if (square) {
                    this.masterSquares.push(square);
                }
            }
        }
    }    
}

function initializeGrid(gameWidth, gameHeight) {
    // Calculate the aspect ratio
    //const aspectRatio = gameWidth / gameHeight;

    // Base grid size
    let baseGridSize = gameHeight / 180;

    // Adjust the grid size based on the aspect ratio
    const gridSize = baseGridSize //* (aspectRatio < 1 ? aspectRatio : 1/aspectRatio);

    // Calculate the number of grid rectangles horizontally and vertically
    const numHorizontal = Math.ceil(gameWidth / gridSize) + 1; 
    const numVertical = Math.ceil(gameHeight / gridSize) + 1;

    // Arrays for border elements
    let leftBorder = [];
    let rightBorder = [];
    let topBorder = [];
    let bottomBorder = [];

    // Array to hold the grid data
    let grid = new Array(numVertical);
    for (let i = 0; i < numVertical; i++) {
        grid[i] = new Array(numHorizontal);
    }

    // Iterate over the grid and initialize rectangles
    for (let i = 0; i < numVertical; i++) {
        for (let j = 0; j < numHorizontal; j++) {
            // Create rectangle object
            let rectangle = {
                x: (j - 0.5) * gridSize, 
                y: (i - 0.5) * gridSize,
                width: gridSize,
                height: gridSize,

                r: 0,
                g: 0,
                b: 0,
                intensity: 0,

                addColor(color, effectX, effectY, radiusX, radiusY, mag) {
                    let normDistX = Math.abs(this.x + 0.5* this.width - effectX)/radiusX;
                    let normDistY = Math.abs(this.y + 0.5* this.height - effectY)/radiusY;
                    if (normDistY > 3 || normDistX > 3){
                        return
                    }
                    let intns = mag*(getGauss(normDistX)*getGauss(normDistY))
                    if (intns) {
                        this.intensity += intns;
                        this.r += color.r * intns;
                        this.g += color.g * intns;
                        this.b += color.b * intns;
                    }
                },

                render() {
                    // If the total intensity is greater than 1, divide the color and intensity values by the total intensity
                    if (this.intensity == 0){
                        //do nothing
                    } else if (this.intensity > 1) {
                        this.r /= this.intensity;
                        this.g /= this.intensity;
                        this.b /= this.intensity;
                        this.intesity = 1;
                    } else {
                        // if the total intensity is less than 1, adjust the color values accordingly
                        this.r /= this.intensity;
                        this.g /= this.intensity;
                        this.b /= this.intensity;
                    }
                    let color = "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.intensity + ")";

                    // Set the fill style
                    ctx.fillStyle = color;

                    // Draw a rectangle
                    ctx.fillRect(this.x*scale, this.y*scale, this.width*scale, this.height*scale);

                    //reset values for nxt loop
                    this.r = 0;
                    this.g = 0;
                    this.b = 0;
                    this.intensity = 0;
                }
            };

            // Add rectangle to grid
            grid[i][j] = rectangle;

            // Check if this rectangle is close to a border and add to the appropriate list
            let thickness = 5
            if (j < thickness) {
                leftBorder.push(rectangle);
            }
            if (j > numHorizontal - thickness - 1) {
                rightBorder.push(rectangle);
            }
            if (i < thickness) {
                topBorder.push(rectangle);
            }
            if (i > numVertical - thickness - 1) {
                bottomBorder.push(rectangle);
            }
        }
    }

    // Return the populated grid and the border lists
    return {
        left: leftBorder,
        right: rightBorder,
        top: topBorder,
        bottom: bottomBorder
    };
}

function gridEffecHandler(object, side, maxDist) {
    let color
    try{
        color = parseRGBA(object.color);
    } catch {
        console.log('could not parseRGBA');
        console.log(object);
        color = "rgba(255,255,255,1)";
    }
    
    let magMulti = 1
    if (object.magMulti) {
        magMulti = object.magMulti
    }

    //calculate distance to wall and grab correct array
    let grid;
    let dist;
    let effectX;
    let effectY;
    let thickness = 5;
    let radiusMult = 10;
    if (side == 'left'){
        grid = gridBorders.left;
        dist = object.x
        effectY = object.y + 0.5*object.height;
        effectX = 0;
        radiusX = grid[0].width*thickness;
        radiusY = radiusMult*object.height;
    } else if (side == 'right') {
        grid = gridBorders.right;
        dist = gameWidth - object.x - object.width;
        effectY = object.y + 0.5*object.height;
        effectX = gameWidth;
        radiusX = grid[0].width*thickness;
        radiusY = radiusMult*object.height;
    } else if (side == 'top') {
        grid = gridBorders.top;
        dist = object.y;
        effectY = 0;
        effectX = object.x + 0.5*object.width;
        radiusY = grid[0].height*thickness;
        radiusX = radiusMult*object.width;
    } else {
        grid = gridBorders.bottom;
        dist = gameHeight - object.y - object.height;
        effectY = gameHeight;
        effectX = object.x + 0.5*object.width;
        radiusY = grid[0].height*thickness;
        radiusX = radiusMult*object.width;
    }

    let mag = (1 - dist/maxDist)*magMulti;
    for (let rect of grid) {
        rect.addColor(color,effectX,effectY,radiusX,radiusY,mag)
    }
}

function init() {
    canvas = document.getElementById('gameCanvas');
    adjustCanvasSize();
    
    ctx = canvas.getContext('2d');

    if (!initialStart) {return}
    // Initialize player
    player = {
        x: gameWidth / 2, // center of the virtual canvas
        y: gameHeight / 2, // center of the virtual canvas
        width: 10,
        height: 10,
        normalSpeed: 3,
        boostedSpeed: 5,
        dx: 0,
        dy: 0,
        color : "rgba(255,255,255,1)",
        direction: null,
        boostTime: null,
        missileTime: 0,
        explosionTime: 0,
        missiles: [],
        requestMissile : false,
        finished: false,
        segments: [],
        snakeLength: 4*(fps/30),
        effects: true,
        tele: true,

        init() {
            let segment = new Segment(gameWidth/2,gameHeight/2);
            this.segments.unshift(segment);
        },

        speed() {
            if (this.boostTime && gameTime - this.boostTime < 8) {
                return this.boostedSpeed;
            }
            return this.normalSpeed;
        },

        missileSend(gameTime) {
            let dx = 0;
            let dy = 0;
            if (this.dx != 0 && this.dx < 0){
                dx = -9;
            } else if (this.dx != 0 && this.dx > 0) {
                dx = 9;
            } else if (this.dy > 0){
                dy = 9;
            } else {
                dy = -9;
            }
            let missile = new Missile(this.x,this.y,this.width/2,dx,dy, "rgba(0,0,255,1)", gameTime + 3000, true, 3, "rgba(255,255,255,1)");
            missiles.push(missile);
        },

        render() {
            ctx.fillStyle = this.color
            ctx.fillRect(this.x*scale, this.y*scale, this.width*scale, this.height*scale);
        }

    };
    player.init();
    gameLoop(0);
}

function adjustCanvasSize() {
    let aspectRatio = gameWidth / gameHeight;
    let windowRatio = window.innerWidth / window.innerHeight;
    scale = window.innerHeight * 0.9 / gameHeight;

    if (windowRatio > aspectRatio) {
        // Window is wider than the desired game ratio
        canvas.height = window.innerHeight * 0.98;
        canvas.width = canvas.height * aspectRatio;
    } else {
        // Window is taller than the desired game ratio
        canvas.width = window.innerWidth * 0.98;
        canvas.height = canvas.width / aspectRatio;
    }

    scale = canvas.height / gameHeight;
}

function gameLoop(timestamp) {
    if (!isPaused) {
        if (lastTime) {
            let deltaTime = timestamp - lastTime;
            gameTime += deltaTime;
        }
        lastTime = timestamp;

        // Check if enough time has passed for the next frame
        if (timestamp >= nextFrameTime) {
            update(gameTime);
            render(gameTime);
            nextFrameTime = timestamp + frameDuration;
        }
        if (gameOver){
            isPaused = true;
        }
    }
    if (!gameStarted){
        gameTime = 0;
    }
    requestAnimationFrame(gameLoop);
}

function update(gameTime) {
    if (!gameStarted) return;  // If the game has not started, do nothing

    //score updates:
    gameState.manager()

    //player updates
    if (!gameOver) { //player controls
        if (player.requestMissile){
            if (gameState.missiles != 0){
                player.missileSend(gameTime);
                if (!gameState.infMissiles){gameState.missiles --}
            }
            player.requestMissile = false;
        }
        movementFlags = movementFlags.filter(function(flag) {
            let top = gameTime - flag.startTime;
            let bottom = player.width*2000/(player.speed()*fps)
            if (top > bottom) {
                return false;
            } else {
                return true;
            }
        });
        let dirGoAhead = true;
        movementFlags.forEach((flag) => {
            if (player.direction == flag.direction){
                dirGoAhead = false
            }
        });
        if (dirGoAhead) {
            switch (player.direction) {
                case 'up':
                    player.dx = 0;
                    player.dy = -player.speed();
                    movementFlags.push(new MovementFlag('down',gameTime))
                    break;
                    
                case 'down':
                    player.dx = 0;
                    player.dy = player.speed();
                    movementFlags.push(new MovementFlag('up',gameTime))
                    break;
                case 'left':
                    player.dx = -player.speed();
                    player.dy = 0;
                    movementFlags.push(new MovementFlag('right',gameTime))
                    break;
                case 'right':
                    player.dx = player.speed();
                    player.dy = 0;
                    movementFlags.push(new MovementFlag('left',gameTime))
                    break;
            }
        }
        
        gameState.loadMissile(gameTime);
    }
    let segment = new Segment(player.x,player.y);
    player.segments.unshift(segment);
    if (player.segments.length > player.snakeLength && !gameOver) {
        player.segments.pop(); // Remove the tail of the snake
    }
    player.x += player.dx;
    player.y += player.dy;

    //player collision with walls
    if (checkBorderCollisions(player, borders) && !teleportation) {
        endGame();
    }

    //manage teleParticals
    teleParticals = teleParticals.filter(function(partical) {
        if (partical.terminate){
            return false;
        } else {
            return true;
        }
    });
    teleParticals.forEach((partical) => {
        partical.manage(gameTime);
    })

    //create characters list
    let characters = [];
    characters.push(player);
    bosses.forEach((boss) => {
        characters.push(boss);
        boss.masterSquares.forEach((masterSquare) => {
            masterSquare.ghostSquares.forEach((ghost) => {
                characters.push(ghost);
                //also check if colliding with the player for efficiency
                if (isColliding(player,ghost) && !boss.arriving) {
                    endGame();
                }
            });
        })
    })
    player.segments.forEach((segment) => {
        characters.push(segment);
    });
    teleParticals.forEach((partical, index) => {
        if (index % 12 == 0 && !partical.drifter) {
            characters.push(partical);
        }
    });
    enemies.forEach((enemy) => {
        //remove during stage two:
        if (gameState.stage() === 2) {
            enemy.detonated = true;
        }
        characters.push(enemy);
        enemy.explosion.forEach((partical, index) => {
            if (index % 10 == 1 && !enemy.finished){
                characters.push(partical);
            }
        });
    });
    missiles.forEach((missile) => {
        characters.push(missile);
        missile.explosion.forEach((partical, index) => {
            if (index % 10 == 1 && !missile.finished){
                characters.push(partical);
            }
        });
    });

    //manage character math
    ghosts = [];
    characters.forEach((character) => {
        effectBorders.forEach((effectBorder) => {
            if (character.effects && isColliding(character,effectBorder)) {
                gridEffecHandler(character, effectBorder.side, effectBorder.maxDist);
            }
        });
        if (character.tele && teleportation) {
            let bordersA = checkCollSide(character, borders, false)
            if (bordersA[0]) {
                teleEffects(character, bordersA[1])
            }
            let bordersB = checkCollSide(character, teleBorders, true);
            if (bordersB[0]) {  
                teleMath(character, bordersB[1]);
            }
        }
    });
    
    if (isColliding(player,redApple)){
        createApple('red');
        player.snakeLength += 4*(fps/30);
        gameState.lengthMulti = gameState.lengthMulti + 0.25;
        gameState.frameScore += 100;
    }
    if (isColliding(player,greenApple)){
        createApple('green');
        player.boostTime = gameTime + 8000;
    }
    for (let i = 4*(fps/30); i < player.segments.length; i++) { // Start from the third segment
        if (isColliding(player, player.segments[i])) {
          // End the game
          endGame();
        }
    }
    if (gameTime > 1000 && !redApple){
        createApple('red');
    }
    if (gameTime > 10000 && !greenApple){
        createApple('green');
    }

    if (!gameOver){
        missiles = missiles.filter(function(missile) {
            if (missile.terminate){
                return false;
            } else {
                return true;
            }
        });
        missiles.forEach((missile) => {
            //console.log(missile.detonated);
            if (checkBorderCollisions(missile, borders) && !teleportation){
                missile.detonated = true;
                //console.log('missile hit wall');
            } else if (missile.neutral){
                enemies.forEach((enemy) => {
                    if (isColliding(missile,enemy) && !enemy.detonated){
                        gameState.frameScore += 100;
                        missile.detonated = true;
                        enemy.detonated = true;
                    }
                })
                bosses.forEach((boss) => {
                    boss.masterSquares.forEach((masterSquare) => {
                        masterSquare.ghostSquares.forEach((ghost) => {
                            if (isColliding(missile,ghost)){
                                if (missile.detonated) {
                                    ghost.partialDamage = true;
                                } else {
                                    missile.detonated = true;
                                    ghost.fullDamage = true;
                                }
                            }
                        })
                        
                    })
                })
            } else if (!missile.neutral) {
                if (isColliding(missile,player)) {
                    endGame();
                }
            }
            missile.movement(gameTime);
            missile.manageContrails();
            missile.manageExplosion(gameTime);
        });
        // enemy logic
        enemies = enemies.filter(function(enemy) {
            if (enemy.terminate){
                return false;
            } else {
                return true;
            }
        })
        enemies.forEach((enemy) => {
            if (enemy){
                enemy.manageContrails();
                enemy.movement();
                enemy.manageExplosion(gameTime);
            }
            if (isColliding(player, enemy)){
                endGame();
            }
        });
        if (gameState.stage() === 1) {
            for (let i = 0; i < 100; i++){
                if (gameTime > 5000 + 5000*i && enemiesMade1 <= i){
                    let speed;
                    let mode;
                    const rand1 = Math.random();
                    const xy = enemySpawnXY();
                    //x: gameWidth/2 - 10,
                    //y: -20,

                    if (rand1 < 0.25){
                        speed = 2.5;
                        mode = 'follow';
                    } else if (rand1 < 0.50) {
                        speed = 2;
                        mode = 'lead';
                    } else if (rand1 < 0.75) {
                        speed = 1.5;
                        mode = 'block';
                    } else {
                        speed = 1.5;
                        mode = 'leadBlock';
                    };
                    createEnemy(speed,mode,xy.x,xy.y);
                    enemiesMade1 ++;
                }
            }
        } else if (gameState.stage() === 3){
            for (let i = 0; i < 1000000; i++){
                if (gameTime - gameState.stage3starttime > 3000 + 3000*i && enemiesMade3 <= i){
                    let speed;
                    let mode;
                    const rand1 = Math.random();
                    const xy = enemySpawnXY();
                    //x: gameWidth/2 - 10,
                    //y: -20,

                    if (rand1 < 0.25){
                        speed = 2.5;
                        mode = 'follow';
                    } else if (rand1 < 0.50) {
                        speed = 2;
                        mode = 'lead';
                    } else if (rand1 < 0.75) {
                        speed = 1.5;
                        mode = 'block';
                    } else {
                        speed = 1.5;
                        mode = 'leadBlock';
                    };
                    createEnemy(speed,mode,xy.x,xy.y);
                    enemiesMade3 ++;
                }
            }
        }
        
        // boss logic
        if (gameState.stage() === 2 && bosses.length === 0) {
            let boss = new Boss()
            bosses.push(boss);
            rand1 = Math.random();
            rand2 = Math.random()
            boss.x = (gameWidth -boss.width)*rand1// center of the virtual canvas
            boss.y = (gameHeight - boss.height)*rand2// center of the virtual canvas
            boss.initializeSquares();
        } else if (gameState.stage() === 3 && gameTime - gameState.stage3starttime > 20000 + 30000*bossesMade) {
            bossesMade ++;
            let boss = new Boss()
            bosses.push(boss);
            rand1 = Math.random();
            rand2 = Math.random()
            boss.x = (gameWidth -boss.width)*rand1// center of the virtual canvas
            boss.y = (gameHeight - boss.height)*rand2// center of the virtual canvas
            boss.initializeSquares();
        }
        bosses.forEach((boss) => {
            //console.log(boss);
            boss.update();
            //end
            boss.movement(player);
            boss.buildGhosts();
        });
        bosses = bosses.filter(function(boss) {
            if (boss.finished){
                // boss death logic
                gameState.bossDead = true;
                gameState.frameScore += 5000
                return false;
            } else {
                return true;
            }
        });

        
    }
}

function enemySpawnXY() {
    let x;
    let y;
    const rand1 = Math.random();
    const rand2 = Math.random();
    if (rand1 < 0.25) {
        x = (gameWidth - 40)*rand2 + 20;
        y = -20
    } else if (rand1 < 0.50) {
        x = (gameWidth - 40)*rand2 + 20;
        y = gameHeight + 20;
    } else if (rand1 < 0.75) {
        x = -20;
        y = (gameHeight - 40)*rand2 + 20;
    } else {
        x = gameWidth + 20;
        y = (gameHeight - 40)*rand2 + 20;
    }
    return {
        x: x,
        y: y
    }
}

function renderHUD() {
    // Score
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.font = `${15*scale}px 'Press Start 2P'`;
    ctx.fillText(`Score: ${gameState.score}`, 10*scale, 25*scale);
    ctx.font = `${10*scale}px 'Press Start 2P'`;
    ctx.fillText(`Stage Multi  x${gameState.stageMulti}`, 10*scale, 45*scale); //${gameState.stage()}
    ctx.fillText(`Length Multi  x${gameState.lengthMulti}`, 10*scale, 65*scale);
  
    // Missiles count and cooldown
    ctx.textAlign = "right";
    ctx.font = `${15*scale}px 'Press Start 2P'`;
    ctx.fillText(`Missiles: ${gameState.missiles}`, (gameWidth - 10)*scale, 25*scale);
  
    // Draw missile cooldown bar
    let cooldownWidth = 100;
    let cooldownHeight = 10;
    ctx.strokeStyle = "white";
    ctx.strokeRect((gameWidth - 10 - cooldownWidth)*scale, 40*scale, cooldownWidth*scale, cooldownHeight*scale);
  
    ctx.fillStyle = "white";
    ctx.fillRect((gameWidth - 10 - cooldownWidth)*scale, 40*scale, (cooldownWidth * gameState.missileCooldown)*scale, cooldownHeight*scale);

    let border = document.getElementById('gameCanvas');
    teleportation ? border.style.border = '0px solid #fff' : border.style.border = '3px solid #fff';
}

function render(gameTime) {
    ctx.clearRect(-50, -50, canvas.width + 100, canvas.height + 100);

    teleParticals.forEach((partical) => {
        partical.render();
    });

    player.render();
    // Draw apple
    if(redApple){
        redApple.render();
    }
    if(greenApple){
        greenApple.render();
    }
    player.segments.forEach((segment, index) => {
        segment.render(index, frameCount);
    });

    gridBorders.left.forEach((rect) => {
        rect.render();
    });
    gridBorders.right.forEach((rect) => {
        rect.render();
    });
    gridBorders.top.forEach((rect) => {
        rect.render();
    });
    gridBorders.bottom.forEach((rect) => {
        rect.render();
    });

    missiles.forEach((missile) => {
        missile.render(frameCount, gameTime);
    })
    enemies.forEach((enemy) => {
        if (enemy){
            enemy.render(frameCount);
        }
    });
    bosses.forEach((boss) => {
        boss.render()
    })
    renderHUD();
    frameCount += 1;
}

function isColliding(object1, object2) {
    // If either object is not defined, return false
    if (!object1 || !object2) {
        return false;
    }
    if (!object1.finished && !object2.finished){
        return object1.x < object2.x + object2.width && object2.x < object1.x + object1.width && object1.y < object2.y + object2.height && object2.y < object1.y + object1.height;
    }
}

function pointObjectColliding(object1, object2) {
    // If either object is not defined, return false
    if (!object1 || !object2) {
        return false;
    }

    if (object1.finished && object2.finished){
        return false;
    }
    // Calculate the center point of object1
    let centerObject1X = object1.x + object1.width / 2;
    let centerObject1Y = object1.y + object1.height / 2;

    // Check if the center point of object1 is inside the rectangle of object2
    return centerObject1X > object2.x && centerObject1X < object2.x + object2.width && centerObject1Y > object2.y && centerObject1Y < object2.y + object2.height;
}

function endGame() {
    player.dx = 0;
    player.dy = 0;
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('game-score').innerText = `Your score: ${gameState.score}`;
    gameOver = true;  // Game is now over
}

function createBorders(gameWidth, gameHeight) {
    // Create an array to hold the borders
    let borders = [];

    // Top border
    borders.push({
        x: 0,
        y: -15,
        width: gameWidth,
        height: 13,
        side: 'top'
    });

    // Bottom border
    borders.push({
        x: 0,
        y: gameHeight + 2,
        width: gameWidth,
        height: 13,
        side: 'bottom'
    });

    // Left border
    borders.push({
        x: -15,
        y: 0,
        width: 13,
        height: gameHeight,
        side: 'left'
    });

    // Right border
    borders.push({
        x: gameWidth + 2,
        y: 0,
        width: 13,
        height: gameHeight,
        side: 'right'
    });

    return borders;
}

function createEffectBorders(gameWidth, gameHeight) {
    // Create an array to hold the borders
    let borders = [];
    let thickness = 70;
    // Top border
    borders.push({
        x: 0,
        y: -10,
        width: gameWidth,
        height: thickness + 10,
        maxDist: thickness,
        side: 'top'
    });

    // Bottom border
    borders.push({
        x: 0,
        y: gameHeight - thickness,
        width: gameWidth,
        height: 10 + thickness,
        maxDist: thickness,
        side: 'bottom'
    });

    // Left border
    borders.push({
        x: -10,
        y: 0,
        width: 10 + thickness,
        height: gameHeight,
        maxDist: thickness,
        side: 'left'
    });

    // Right border
    borders.push({
        x: gameWidth - thickness,
        y: 0,
        width: 10 + thickness,
        height: gameHeight,
        maxDist: thickness,
        side: 'right'
    });

    return borders;
}

function createTeleportationBorders(gameWidth, gameHeight) {
    // Create an array to hold the borders
    console.log(gameWidth)
    console.log(gameHeight)
    let tempBorders = [];
    // Top border
    tempBorders.push({
        x: -20,
        y: -20,
        width: gameWidth + 40,
        height: 10,
        side: 'top'
    });

    // Bottom border
    tempBorders.push({
        x: -20,
        y: gameHeight + 10,
        width: gameWidth + 40,
        height: 10,
        side: 'bottom'
    });

    // Left border
    tempBorders.push({
        x: -20,
        y: -10,
        width: 10,
        height: gameHeight + 20,
        side: 'left'
    });

    // Right border
    tempBorders.push({
        x: gameWidth + 10,
        y: -10,
        width: 10,
        height: gameHeight + 20,
        side: 'right'
    });

    return tempBorders;
}

function teleMath(character, side) {
    if (side == 'left' && character.dx < 0) {
        character.x = gameWidth + 10 - character.width/2;
    } else if (side == 'right' && character.dx > 0) {
        character.x = -10 - character.width/2;
    } else if (side == 'top' && character.dy < 0) {
        character.y = gameHeight + 10 - character.height/2;
    } else if (side == 'bottom' && character.dy > 0) {
        character.y = -10 - character.height/2;
    }
}

function teleEffects(character, side) {
    let angle = Math.PI/10;
    let angle1;
    let angle2;
    let dir1;
    let dir2;
    let centerx;
    let centery;
    let size; 
    let magMulti = 1;
    let effectRadius;
    if (character.magMulti) {
        magMulti = character.magMulti
    }
    let particalMulti = 1;
    if (character.particalMulti) {
        particalMulti = character.particalMulti
    }

    if (side == 'left') {
        effectRadius = character.height/2
        centery = character.y + character.height/2;
        centerx = -5;
        size = character.height;
        angle1 = angle - Math.PI/2;
        angle2 = angle1 - Math.PI - 2*angle;
        dir1 = [Math.cos(angle1), Math.sin(angle1)];
        dir2 = [Math.cos(angle2), Math.sin(angle2)];
        createTeleParticals(centerx, centery, particalMulti, size, dir1, dir2, effectRadius, side);
    } else if (side == 'right') {
        effectRadius = character.height/2
        centery = character.y + character.height/2;
        centerx = gameWidth + 5;
        size = character.height;
        angle1 = angle + Math.PI/2;
        angle2 = angle1 - Math.PI - 2*angle;
        dir1 = [Math.cos(angle1), Math.sin(angle1)];
        dir2 = [Math.cos(angle2), Math.sin(angle2)];
        createTeleParticals(centerx, centery, particalMulti, size, dir1, dir2, effectRadius, side);
    } else if (side == 'top') {
        effectRadius = character.width/2
        centery = -5;
        centerx = character.x + character.width/2;
        size = character.width;
        angle1 = angle;
        angle2 = angle1 - Math.PI - 2*angle;
        dir1 = [Math.cos(angle1), Math.sin(angle1)];
        dir2 = [Math.cos(angle2), Math.sin(angle2)];
        createTeleParticals(centerx, centery, particalMulti, size, dir1, dir2, effectRadius, side);
    } else if (side == 'bottom') {
        effectRadius = character.width/2
        centery = gameHeight + 5;
        centerx = character.x + character.width/2;
        size = character.width;
        angle1 = angle + Math.PI;
        angle2 = angle1 - Math.PI - 2*angle;
        dir1 = [Math.cos(angle1), Math.sin(angle1)];
        dir2 = [Math.cos(angle2), Math.sin(angle2)];
        createTeleParticals(centerx, centery, particalMulti, size, dir1, dir2, effectRadius, side);
    }
}

function createTeleParticals(centerX, centerY, particalMulti, size, dir1, dir2, effectRadius, side){
    //constructor(x,y,dx,dy,size,time,color)
    let startTime = gameTime;
    let baseRate = 30*particalMulti;
    let baseVelocity = 5;
    let dirVar = 5;
    let sizeVar = 3;
    let baseTime = 200;
    let x;
    let y;

    let plane;
    if (side == 'left' || side == 'right') {
        plane = 'Y'
    } else {
        plane = 'X'
    }

    for (i = 0; i < baseRate; i ++) {
        rand1 = Math.random()*2 - 1;
        rand2 = Math.random()*2 - 1;
        rand3 = Math.random();
        rand4 = Math.random();
        rand5 = Math.random();
        rand6 = Math.random()*2 - 1;
        if (plane == 'Y') {
            x = centerX;
            y = centerY + effectRadius*rand6
        } else {
            y = centerY;
            x = centerX + effectRadius*rand6
        }
        dx = baseVelocity*dir1[0] + dirVar*rand1;
        dy = baseVelocity*dir1[1] + dirVar*rand2;
        size = 1 + sizeVar*rand3;
        color = teleParticalColors[Math.floor(4*rand4)];
        time = startTime + baseTime*rand5;
        teleParticals.push(new TelePartical(x,y,dx,dy,size,time,color))
    }

    for (i = 0; i < baseRate; i ++) {
        rand1 = Math.random()*2 - 1;
        rand2 = Math.random()*2 - 1;
        rand3 = Math.random();
        rand4 = Math.random();
        rand5 = Math.random();
        rand6 = Math.random()*2 - 1;
        if (plane == 'Y') {
            x = centerX;
            y = centerY + effectRadius*rand6
        } else {
            y = centerY;
            x = centerX + effectRadius*rand6
        }
        dx = baseVelocity*dir2[0] + dirVar*rand1;
        dy = baseVelocity*dir2[1] + dirVar*rand2;
        size = 1 + sizeVar*rand3;
        color = teleParticalColors[Math.floor(4*rand4)];
        time = startTime + baseTime*rand5;
        teleParticals.push(new TelePartical(x,y,dx,dy,size,time,color))
    }
}

function checkBorderCollisions(player, borders) {
    for (let border of borders) {
        if (isColliding(player, border)) {
            return true;
        }
    }
    return false;
}

function checkCollSide(object, borderSet, point) {
    let output;
    if (point === false) {
        borderSet.forEach((border) => {
            if (isColliding(object, border)) {  
                output =  [true, border.side];
            }
        });
    } else {
        borderSet.forEach((border) => {
            if (pointObjectColliding(object, border)) {  
                output =  [true, border.side];
            }
        });
    }
    
    if (!output) {
        return [false]
    } else {
        return output
    }
}

function createApple(color){
    // Define apple object
    if (color == 'red'){
        redApple = {
            color: "rgba(255,0,0,1)",
            width: 10, // size relative to the virtual grid
            height: 10,
            x: Math.floor(Math.random() * (gameWidth - 2*10)) + 10,
            y: Math.floor(Math.random() * (gameHeight - 2*10)) + 10,
            render() {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x * scale, this.y * scale, this.width * scale, this.height * scale);
            }
        };
    } else if (color == 'green'){
        greenApple = {
            color: "rgba(0,255,0,1)",
            width: 10, // size relative to the virtual grid
            height: 10,
            x: Math.floor(Math.random() * (gameWidth - 2*10)) + 10,
            y: Math.floor(Math.random() * (gameHeight - 2*10)) + 10,
            render() {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x * scale, this.y * scale, this.width * scale, this.height * scale);
            }
        };
    }
    
}

function createEnemy(speed,mode,x,y){
    let contrailLength = 30
    enemyFollow = {
        width: 20,
        height: 20,
        x: x,//gameWidth/2 - 10,
        y: y,//-20,
        dx: 0,
        dy: 0,
        speed : speed,
        contrail : [],
        contrailLength : contrailLength,
        color: "rgba(255,165,0,1)",
        mode: mode,
        detonated: false,
        explosion: [],
        explosionStart: 0,
        explosionTime: 300,
        finished: false,
        terminate: false,
        boomMulti: 0.8,
        fizzTime: 1500,
        effects: true,
        tele: true,

        movement() {
            if(this.detonated){return};

            if (this.mode == 'follow') {
                const dist = Math.sqrt((player.x - this.x)**2 + (player.y - this.y)**2);
                this.dx= this.speed*(player.x - this.x)/dist;
                this.dy= this.speed*(player.y - this.y)/dist;
                //console.log(this.x);
            } else if (this.mode == 'lead'){
                let targetX = player.x + (player.dx * 50)/player.speed();
                let targetY = player.y + (player.dy * 50)/player.speed();
                const dist = Math.sqrt((targetX - this.x)**2 + (targetY - this.y)**2);
                this.dx= this.speed * (targetX - this.x)/dist;
                this.dy= this.speed * (targetY - this.y)/dist;
            } else if (this.mode == 'block'){
                const centerX = gameWidth / 2;
                const centerY = gameHeight / 2;
                const distToCenter = Math.sqrt((player.x - centerX)**2 + (player.y - centerY)**2);
                targetX = player.x + 50*(centerX - player.x)/distToCenter;
                targetY = player.y + 50*(centerY - player.y)/distToCenter;
                const dist = Math.sqrt((targetX - this.x)**2 + (targetY - this.y)**2);
                this.dx= this.speed * (targetX - this.x)/dist;
                this.dy= this.speed * (targetY - this.y)/dist;
            } else {
                let target1X = player.x + (player.dx * 50)/player.speed();
                let target1Y = player.y + (player.dy * 50)/player.speed();
                const centerX = gameWidth / 2;
                const centerY = gameHeight / 2;
                const distToCenter = Math.sqrt((player.x - centerX)**2 + (player.y - centerY)**2);
                const target2X = target1X + 50*(centerX - player.x)/distToCenter;
                const target2Y = target1Y + 50*(centerY - player.y)/distToCenter;
                const dist = Math.sqrt((target2X - this.x)**2 + (target2Y  - this.y)**2);
                this.dx= this.speed * (target2X - this.x)/dist;
                this.dy= this.speed * (target2Y - this.y)/dist;
            }
            this.x += this.dx;
            this.y += this.dy;
        },

        render(count) {
            this.explosion.forEach((partical) => {
                partical.render()
            });
            this.contrail.forEach((contrail) => {
                contrail.render();
            });
            
            if (this.detonated){return}
            if (count % 30 == 0){
                rand = Math.random();
                if (rand < 0.33) {
                    this.color = "rgba(255,165,0,1)";
                } else if (rand < 0.66){
                    this.color = "rgba(255,255,0,1)";
                } else {
                    this.color =  "rgba(255,0,0,1)";
                }
            }
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x * scale, this.y * scale, this.width * scale, this.height * scale);
        },
        /*
        manageContrails() {
            
            const xpos = this.x + (this.width*Math.random() - this.width/2) + this.width/4;
            const ypos = this.y + (this.height*Math.random() - this.height/2) + this.height/4;
            const size = this.width*Math.random()/2;
            let color;

            if (this.contrail.length > this.contrailLength) {
                this.contrail.pop();
            }
            
            if(this.detonated){
                color = '';
                let contrail = new Contrail(xpos,ypos,size,color);
                this.contrail.unshift(contrail);
                return;
            };
            rand = Math.random();
                if (rand < 0.33) {
                    color = "rgba(255,165,0,1)";
                } else if (rand < 0.66){
                    color = "rgba(255,255,0,1)";
                } else {
                    color =  "rgba(255,0,0,1)";
                }
                let contrail = new Contrail(xpos,ypos,size,color);
                this.contrail.unshift(contrail);

            
        },
        */
        manageContrails() {
            if (this.detonated) {return}
            const size = this.width/4;
            const xpos = this.x + this.width/2 - size/2;
            const ypos = this.y + this.height/2 - size/2;

            let colors = [];
            let rand1 = 3*Math.random();
            let rand2 = (Math.random() - 0.5);
            let rand3 = (Math.random() - 0.5);
            let rand4 = 0.5*(Math.random() - 0.5);
            let rand5 = 0.5*(Math.random() - 0.5);
            let rand6 = 400*(Math.random() - 0.5);
            let rand7 = (Math.random() + 0.5);
            let rand8 = (Math.random() + 0.5);
            let contrail = new Drifter(xpos + this.width*rand2,ypos + this.width*rand3,-(this.dx*rand4)/10,-(this.dy*rand5)/10,(size*rand7),(size*rand8)*2,gameTime,gameTime + 2000 + rand6,this.color);
            teleParticals.push(contrail);
        },

        manageExplosion(gameTime) {
            if (this.detonated && this.explosionStart == 0){
                this.explosionStart = gameTime;
            }
            if (this.finished && !this.terminate){
                for (i = 0; i < this.explosion.length/(this.fizzTime*fps/1000); i++){
                    this.explosion.shift();
                } 
                if (gameTime >= this.explosionStart + this.explosionTime + this.fizzTime){
                    this.terminate = true;
                    return
                }          
            }
            if (this.detonated && !this.finished){
                let elapsedTime = (gameTime - this.explosionStart)/this.explosionTime;
                /*
                if (elapsedTime >= 1){
                    this.finished = true;
                    return
                }
                //console.log(elapsedTime);
                while (this.explosion.length >= 40){
                    //console.log('it is longer')
                    this.explosion.shift();
                }
                */
                this.finished = true;

                let baseNumParticals = 300;
                let baseVelocity = 10;
                let baseTime = 300;
                let sizeVar = 4;
                for (i = 0; i < baseNumParticals; i++) {
                    let rand1 = Math.random()*2*Math.PI;
                    let rand2 = Math.random()*0.5 + 0.75;
                    let rand3 = Math.random();
                    let rand4 = Math.random();
                    let rand5 = Math.random();
                    let dx = baseVelocity*Math.cos(rand1)*rand2;
                    let dy = baseVelocity*Math.sin(rand1)*rand2;
                    let size = 2 + sizeVar*rand3;
                    let color = teleParticalColors[Math.floor(4*rand4)];
                    let time = gameTime + baseTime*rand5;
                    teleParticals.push(new TelePartical(this.x,this.y,dx,dy,size,time,color))
                }
                for (i = 0; i < baseNumParticals/2; i++) {
                    const rand1 = Math.random()*2*Math.PI;
                    const rand2 = Math.random();
                    const rand3 = Math.random();
                    const rand6 = Math.random() + 0.5;
                    const dx = baseVelocity*Math.cos(rand1)*rand2*0.7;
                    const dy = baseVelocity*Math.sin(rand1)*rand2*0.7;
                    const size = 2 + sizeVar*rand3; //correct this
                    const time = gameTime + 2*baseTime*rand6; //correct this
                    let color;
                    const randc = Math.random();
                    if (randc < 0.5) {
                        color =  "rgba(255,0,0,1)";
                    } else if (randc < 0.8){
                        color = "rgba(255,255,0,1)";
                    } else {
                        color = "rgba(255,165,0,1)";
                    }
                    const xpos = this.x + this.width/2;
                    const ypos = this.y + this.height/2;
                    const drifter = new Drifter(xpos,ypos,dx,dy,size,size*4,gameTime,time,color);
                    teleParticals.push(drifter);
                }
                /*for (i = 0; i < Math.ceil(60/(Math.sqrt(elapsedTime) + 0.05)); i++){
                    const mag = 10;
                    const size = this.width*this.boomMulti*Math.random();
                    const xpos = this.x + mag*(this.width*(Math.random()*elapsedTime))*this.boomMulti - (mag*(this.width*elapsedTime)/2)*this.boomMulti;
                    const ypos = this.y + mag*(this.height*(Math.random()*elapsedTime))*this.boomMulti - (mag*(this.height*elapsedTime)/2)*this.boomMulti;
                    
                    let color;
                    let rand = Math.random() + elapsedTime;
                        if (rand < 0.3) {
                            color = "rgba(255,0,0,1)";
                        } else if (rand < 0.5){
                            color = "rgba(255,255,0,1)";
                        } else if (rand < 0.8){
                            color = "rgba(255,165,0,1)";
                        } else if (rand < 1.2){
                            color = "rgba(255,255,255,1)";
                        } else {
                            color = "rgba(128,128,128,1)";
                        }
                    let partical = new Contrail(xpos,ypos,size,color);
                    this.explosion.push(partical);
                }*/
            }
        }

    }
    enemies.push(enemyFollow);
    enemiesMade += 1;
}

function movePlayer(e) {
    switch(e.key) {
        case 'Escape':
            if (document.fullscreenElement) exitFullScreen();
            break;
    }

    if (gameOver) return;

    if ((e.key === 'ArrowUp' || e.key === 'w') && player.direction !== 'down') {
        player.direction = 'up';
        movementFlags.push(new MovementFlag('down',gameTime))
    } else if ((e.key === 'ArrowDown' || e.key === 's') && player.direction !== 'up') {
        player.direction = 'down';
        movementFlags.push(new MovementFlag('up',gameTime))
    } else if ((e.key === 'ArrowRight' || e.key === 'd') && player.direction !== 'left') {
        e.preventDefault();
        player.direction = 'right';
        movementFlags.push(new MovementFlag('left',gameTime))
    } else if ((e.key === 'ArrowLeft' || e.key === 'a') && player.direction !== 'right') {
        e.preventDefault();
        player.direction = 'left';
        movementFlags.push(new MovementFlag('right',gameTime))
    } else if (e.key === ' ' || e.key === 'e') {
        e.preventDefault();
        player.requestMissile = true;
    }

    if (!gameStarted) {
        if (player.direction){
            gameStarted = true;
        } 
    }
}

let xDown = null;
let yDown = null;
let timeDown = null;

function getTouches(evt) {
  return evt.touches ||             // browser API
         evt.originalEvent.touches; // jQuery
}

function handleTouchStart(evt) {
  const firstTouch = getTouches(evt)[0];
  xDown = firstTouch.clientX;
  yDown = firstTouch.clientY;
  timeDown = new Date().getTime();
}

function handleTouchMove(evt) {
  if (!xDown || !yDown) {
    return;
  }

  let xUp = evt.touches[0].clientX;
  let yUp = evt.touches[0].clientY;

  let xDiff = xDown - xUp;
  let yDiff = yDown - yUp;

  if (Math.abs(xDiff) > Math.abs(yDiff)) { // Most significant.
    if (xDiff > 0) {
      /* left swipe */
      movePlayer({ key: 'ArrowLeft' });
    } else {
      /* right swipe */
      movePlayer({ key: 'ArrowRight' });
    }
  } else {
    if (yDiff > 0) {
      /* up swipe */
      movePlayer({ key: 'ArrowUp' });
    } else {
      /* down swipe */
      movePlayer({ key: 'ArrowDown' });
    }
  }
  // Reset values
  xDown = null;
  yDown = null;
}

function handleTouchEnd(evt) {
  const timeUp = new Date().getTime();
  if (timeDown && (timeUp - timeDown) < 500) { // Short tap
    let timeDiff = timeUp - timeDown;
    if (timeDiff < 300) { // Double tap (300 ms)
      movePlayer({ key: ' ' }); // Space action
    }
  }
  timeDown = null;
}

//buttons

document.getElementById('play-button').addEventListener('click', function() {
    console.log('i can hear you!!!');
    document.getElementById('game-start').style.display = 'none';
    initialStart = true;
    init();
});

document.getElementById('play-again-button').addEventListener('click', function() {
    // Reset the game state
    console.log('I hear you!')
    gameClock = 0;
    player.x = gameWidth / 2;
    player.y = gameHeight / 2;
    player.dx = 0;
    player.dy = 0;
    player.direction = null;
    gameOver = false;  // Game is no longer over
    gameStarted = false; // Game has not been started
    redApple = null;
    greenApple = null;
    enemies = [];
    missiles = [];
    enemiesMade = 0;
    enemiesMade1 = 0;
    enemiesMade3 = 0;
    bossesMade = 0;
    gameState.missiles = 0;
    gameState.missileCooldown = 0;
    gameState.infMissiles = false;
    gameState.score = 0;
    gameState.lastMissileTime = 0;
    gameState.lengthMulti = 1;
    bosses = [];

    player.boostTime = 0;
    player.segments = [];
    player.snakeLength = 4*(fps/30);
    player.init();
    isPaused = false;

    teleParticals = [];
    movementFlags = [];
    // Hide the game over text and play again button
    document.getElementById('game-over').style.display = 'none';
});


function togglePause() {
    isPaused = !isPaused;
    let pauseButton = document.getElementById('pauseButton');
    pauseButton.innerText = isPaused ? "Play" : "Pause";
    if(!isPaused) {
        // reset lastTime when unpausing to avoid a jump in deltaTime
        lastTime = 0;
        requestAnimationFrame(gameLoop);
    }
    pauseButton.blur();
}

let pauseButton = document.getElementById('pauseButton');
pauseButton.addEventListener('click', togglePause);

function goFullScreen(){
    let element = document.documentElement;

    if(element.requestFullscreen) {
        element.requestFullscreen();
    } else if(element.mozRequestFullScreen) { // Firefox
        element.mozRequestFullScreen();
    } else if(element.webkitRequestFullscreen) { // Chrome, Safari and Opera
        element.webkitRequestFullscreen();
    } else if(element.msRequestFullscreen) { // IE/Edge
        element.msRequestFullscreen();
    }
}

function exitFullScreen(){
    if(document.exitFullscreen) {
        document.exitFullscreen();
    } else if(document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
    } else if(document.webkitExitFullscreen) { // Chrome, Safari and Opera
        document.webkitExitFullscreen();
    } else if(document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
    }
}

window.addEventListener('keydown', movePlayer);
window.addEventListener('resize', adjustCanvasSize);
document.addEventListener('fullscreenchange', function() {
    adjustCanvasSize();
    render(gameTime);
    fullscreenButton.innerText = document.fullscreenElement ? "Exit" : "Fullscreen";
});

if (isMobile) {
    // Remove the keydown event listener as it's not needed on mobile
    window.removeEventListener('keydown', movePlayer);
  
    // Add touch event listeners
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);
    document.addEventListener('touchend', handleTouchEnd, false);
}

fullscreenButton.addEventListener('click', function() {
    if (!document.fullscreenElement) {
        goFullScreen();
    } else {
        exitFullScreen();
    }
    render(gameTime);
    fullscreenButton.blur();
});

function parseRGBA(rgba) {
    // Remove the "rgba(" prefix and ")" suffix, then split the remaining string into components
    let components = rgba.substring(5, rgba.length - 1).split(',');

    // Parse each component into a number
    let r = parseInt(components[0], 10);
    let g = parseInt(components[1], 10);
    let b = parseInt(components[2], 10);
    let a = parseFloat(components[3]);

    // Return the components as an object
    return {r: r, g: g, b: b, a: a};
}

function getGauss(distance) {
    // If the distance is greater than 3, return 0
    if (distance > 3) {
        return 0;
    }

    // Map the distance to an index
    let index = Math.round(distance * 100);

    // Retrieve the Gaussian value from the lookup table
    return gaussianLookup[index];
}

// Virtual dimensions
let gameWidth = 1000;
let gameHeight = gameWidth / 1.8;  // This is now dependent on the aspect ratio

console.log(gameWidth)
console.log(gameHeight)
let borders = createBorders(gameWidth, gameHeight); //this is an array
let teleBorders = createTeleportationBorders(gameWidth,gameHeight);
let effectBorders = createEffectBorders(gameWidth, gameHeight)
let gridBorders = initializeGrid(gameWidth, gameHeight); //this is an object

console.log(effectBorders)
console.log(gridBorders)
console.log(teleBorders)
// Scaling factor
let scale;

//game start

init();