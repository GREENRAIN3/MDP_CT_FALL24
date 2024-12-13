let flock = [];
let bgColor;
let perlinOffsets = [];
let usePerlinNoise = false;
let useTrail = true;  // 控制残影效果

function setup() {
  let canvas = createCanvas(1200, 600);
  canvas.parent('p5-container');

  bgColor = color(50, 150, 200);  // 初始背景颜色

  // 创建多个 Boid
  for (let i = 0; i < 150; i++) {
    flock.push(new Boid(random(width), random(height)));
    perlinOffsets.push(createVector(random(1000), random(1000)));
  }
}

function draw() {
  // 不再使用完全不透明的背景颜色来覆盖每一帧
  if (useTrail) {
    // 只绘制一个半透明的矩形，用于创造残影效果
    fill(bgColor.levels[0], bgColor.levels[1], bgColor.levels[2], 20);  // 让背景具有透明度
    rect(0, 0, width, height);
  } else {
    // 如果不使用残影，则使用完全不透明的背景
    background(bgColor);
  }

  // 更新并显示 Boid
  for (let i = 0; i < flock.length; i++) {
    let boid = flock[i];

    // 根据布尔值切换 Perlin 噪声和经典 Flocking 行为
    if (usePerlinNoise) {
      boid.perlinNoiseMovement(perlinOffsets[i]);
    } else {
      boid.flock(flock);
    }

    boid.update();
    boid.edges();
    boid.show();
  }
}

// 当鼠标点击时，切换轨迹模式并更改背景颜色和残影效果
function mousePressed() {
  usePerlinNoise = !usePerlinNoise;  // 切换机制
  useTrail = !useTrail;  // 切换残影效果
  bgColor = color(random(255), random(255), random(255));  // 随机更改背景颜色
}

// Boid 类定义
class Boid {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D();
    this.acceleration = createVector();
    this.maxSpeed = 4;
    this.maxForce = 0.2;
    this.trail = [];  // 存储 Boid 的运动轨迹
    this.trailMaxLength = 20;  // 轨迹的最大长度
  }

  perlinNoiseMovement(offset) {
    let angleX = map(noise(offset.x), 0, 1, -TWO_PI, TWO_PI);
    let angleY = map(noise(offset.y), 0, 1, -TWO_PI, TWO_PI);
    this.velocity.x = cos(angleX) * this.maxSpeed;
    this.velocity.y = sin(angleY) * this.maxSpeed;
    offset.x += 0.01;
    offset.y += 0.01;
  }

  flock(boids) {
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids);
    let separation = this.separation(boids);

    alignment.mult(1.0);
    cohesion.mult(1.0);
    separation.mult(1.5);

    this.applyForce(alignment);
    this.applyForce(cohesion);
    this.applyForce(separation);
  }

  align(boids) {
    let perceptionRadius = 50;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < perceptionRadius) {
        steering.add(other.velocity);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  separation(boids) {
    let perceptionRadius = 25;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < perceptionRadius) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.div(d);
        steering.add(diff);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  cohesion(boids) {
    let perceptionRadius = 50;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < perceptionRadius) {
        steering.add(other.position);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.sub(this.position);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);

    // 添加当前位置到轨迹中
    this.trail.push(this.position.copy());
    if (this.trail.length > this.trailMaxLength) {
      this.trail.shift();  // 保持轨迹长度
    }
  }

  edges() {
    if (this.position.x > width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = height;
  }

  show() {
    let theta = this.velocity.heading() + radians(90);

    // 绘制 Boid 的运动尾迹
    strokeWeight(2);
    noFill();
    beginShape();
    for (let i = 0; i < this.trail.length; i++) {
      let pos = this.trail[i];
      let alpha = map(i, 0, this.trail.length, 0, 255);  // 尾迹透明度渐变
      stroke(255, alpha);  // 设置尾迹颜色的透明度渐变
      vertex(pos.x, pos.y);
    }
    endShape();

    // 绘制 Boid 本身
    stroke(255);
    strokeWeight(4);
    fill(255);
    push();
    translate(this.position.x, this.position.y);
    rotate(theta);
    beginShape();
    vertex(0, -10);
    vertex(-5, 10);
    vertex(5, 10);
    endShape(CLOSE);
    pop();
  }
}

