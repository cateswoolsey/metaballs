//Credit to Jamie Wong's tutorial: https://jamie-wong.com/2014/08/19/metaballs-and-marching-squares/

let gridSize = 1.2 //grid size
let metaballs = [];
const influenceThreshold = .8;  //value to determine if point is inside vs outside metaball
let canvas;
let noiseOffset = 1;

function setup() {
  canvas = createCanvas(700, 400); 
  centerCanvas(); 
  createMetaballs(6);
}

function centerCanvas() {
  // Calculate the x and y offset to center the canvas
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  canvas.position(x, y);
}

function windowResized() {
  centerCanvas(); // Re-center the canvas if the window is resized
}

function draw() {
  perlinBackground();

  stroke(20, 20, 60);
  noFill();  
  strokeWeight(15); 
  rect(0, 0, width, height);

  metaballs.forEach(metaball => metaball.move());  //update position of each metaball
  drawMarchingSquares();  //draw contours/outlines of metaballs
  filter(BLUR, 2);  //blur filter (helps smooth edges + creates cool look)
}

function perlinBackground() { //perlin background helper function
  //create perlin noise background (create depth without slowing down metaballs)
  noStroke();

  //loop to create noise across entire canvas (increments alter position of rectangle)
  for (let x = 0; x < width; x += 10) { 
    for (let y = 0; y < height; y += 10) {

      //3D perlin noise value based on coordinates and offset
      let noiseValue = noise(x * 0.03, y * 0.03, noiseOffset);

      //color each rectangle in Perlin noise background
      fill(200 + noiseValue * 55, 200 + noiseValue * 55, 255, 3.5); //bluish white, very transparent (helps with layering)
      rect(x, y, 10, 10);
    }
  }
  noiseOffset += 0.05; //increase noise offset over time (creates change and movement in)
}

class Metaball {
  constructor(x, y, radius) {
    this.position = createVector(x, y);
    this.radius = radius;
    this.velocity = p5.Vector.random2D().mult(2.25); //random movement and set speed
  }

  move() { //move helper function (moves metaballs)
    this.position.add(this.velocity);
    this.constrainEdges();
  }

  constrainEdges() { //constrain edges helper function (ensures metaballs stay within canvas)
    //reverse direction if edge is hit
    if (this.position.x < this.radius || this.position.x > width - this.radius) {
      this.velocity.x *= -1;
      this.position.x = constrain(this.position.x, this.radius, width - this.radius);
    }
    if (this.position.y < this.radius || this.position.y > height - this.radius) {
      this.velocity.y *= -1;
      this.position.y = constrain(this.position.y, this.radius, height - this.radius);
    }
  }

  influence(x, y) { //influence helper function
    //uses f(x,y)=Σ(from i=0 to n)[(r_i^2)/((x-x_i)^2+(y-y_i)^2)](from Jamie Wong's tutorial)
    //returns high value when a point is close to the metaball’s center and a low value when it’s far away 
    //if combined influence is above influenceThreshold, point is considered "inside" blob (otherwise, point is considered "outside" blob)
    const dx = this.position.x - x;
    const dy = this.position.y - y;
    return this.radius * this.radius / (dx * dx + dy * dy);
  }
}

function createMetaballs(count) { //create metaballs helper function
  //creates # metaballs, with random width, height, size
  for (let i = 0; i < count; i++) {
    metaballs.push(new Metaball(random(width), random(height), random(30, 60)));
  }
}

function drawMarchingSquares() { //marching squares helper function
  stroke(20, 20, 60);
  strokeWeight(10);
  noFill();

  //loop iterates canvas with gridSize steps (creates grid of points)
  for (let x = 0; x < width; x += gridSize) {
    for (let y = 0; y < height; y += gridSize) {
      const cellValues = getGridCellValues(x, y); //get combined influence at each corner of cell at point (x,y)
      const state = getState(cellValues); 
      drawShape(state, x, y, cellValues);
    }
  }
}

function getGridCellValues(x, y) {
  //returns an array of four influence values at the corners of cell
  //starts top left corner and moves clockwise
  return [
    combinedInfluence(x, y),
    combinedInfluence(x + gridSize, y),
    combinedInfluence(x + gridSize, y + gridSize),
    combinedInfluence(x, y + gridSize)
  ];
}

function getState([topLeft, topRight, bottomRight, bottomLeft]) {
  //checks whether corner is inside vs outside of blob
  //every corner can be inside (1) or outside (0)
  //converts grid cell's corner values into a 4-bit integer (0-15) based on corner being inside vs outside
  return (topLeft > influenceThreshold ? 1 : 0) << 3 |
         (topRight > influenceThreshold ? 1 : 0) << 2 |
         (bottomRight > influenceThreshold ? 1 : 0) << 1 |
         (bottomLeft > influenceThreshold ? 1 : 0);
}

function interpolate(x1, y1, f1, x2, y2, f2) { //interpolate helper function
  //uses Qy=By+(Dy-By)*[((1-f(Bx,By)/f(Dx, Dy)-f(Bx,By)))] (from Jamie Wong's tutorial) 
  //gets where contour line intersects edge between two points
  const epsilon = 1e-6; //small epsilon for more precision
  //if f1 and f2 are too close in value, return the midpoint (avoids division problem)
  if (abs(f2 - f1) < epsilon) {
    return {
      x: (x1 + x2) / 2, y: (y1 + y2) / 2
    };
  }

  //influenceThreshold replaces 1
  let t = (influenceThreshold - f1) / (f2 - f1);
  //constrain t (make sure its within [0,1] to prevent floating point artifacts)
  if (t < 0) t = 0;
  if (t > 1) t = 1;

  return {
    x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t
  };
}

function drawShape(state, x, y, cellValues) { 
  //draws contour line within cell based on the state of its four corners

  //influence values at each corner of the cell
  const [topLeft, topRight, bottomRight, bottomLeft] = cellValues;

  //coordinates of top left corner 
  const x1 = x;
  const y1 = y;
  //coordinates of bottom right corner
  const x2 = x + gridSize;
  const y2 = y + gridSize;

  beginShape();
  switch (state) { //determines which contour line drawn based on state 
    //4-bit integer means cases ranging from 0-15, but two don't need to be drawn (case 0000 and 1111)
    //each case, interpolate() find the exact points on the cell edges where influence threshold is crossed
    //these points are added with vertex() to draw contour line segment

    case 1: { //bottom left corner is inside threshold
      const p1 = interpolate(x1, y1, topLeft, x1, y2, bottomLeft);
      const p2 = interpolate(x1, y2, bottomLeft, x2, y2, bottomRight);
      vertex(p1.x, p1.y);
      vertex(p2.x, p2.y);
      break;
    }
    case 2: { //bottom right corner is inside threshold
      const p1 = interpolate(x1, y2, bottomLeft, x2, y2, bottomRight);
      const p2 = interpolate(x2, y1, topRight, x2, y2, bottomRight);
      vertex(p1.x, p1.y);
      vertex(p2.x, p2.y);
      break;
    }
    case 3: { //bottom left and bottom right corners are inside threshold
      const p1 = interpolate(x1, y1, topLeft, x1, y2, bottomLeft);
      const p2 = interpolate(x2, y1, topRight, x2, y2, bottomRight);
      vertex(p1.x, p1.y);
      vertex(p2.x, p2.y);
      break;
    }
    case 4: { //top right corner is inside threshold
      const p1 = interpolate(x1, y1, topLeft, x2, y1, topRight);
      const p2 = interpolate(x2, y1, topRight, x2, y2, bottomRight);
      vertex(p1.x, p1.y);
      vertex(p2.x, p2.y);
      break;
    }
    case 5: { //top left and bottom right corners are inside threshold
      const p1 = interpolate(x1, y1, topLeft, x1, y2, bottomLeft);
      const p2 = interpolate(x1, y1, topLeft, x2, y1, topRight);
      vertex(p1.x, p1.y);
      vertex(p2.x, p2.y);
      endShape(CLOSE);
      beginShape();
      const p3 = interpolate(x1, y2, bottomLeft, x2, y2, bottomRight);
      const p4 = interpolate(x2, y1, topRight, x2, y2, bottomRight);
      vertex(p3.x, p3.y);
      vertex(p4.x, p4.y);
      break;
    }
    case 6: { //top left and top right corners are inside threshold
      const p1 = interpolate(x1, y1, topLeft, x2, y1, topRight);
      const p2 = interpolate(x1, y2, bottomLeft, x2, y2, bottomRight);
      vertex(p1.x, p1.y);
      vertex(p2.x, p2.y);
      break;
    }
    case 7: { //top left, top right, and bottom left corners are inside threshold
      const p1 = interpolate(x1, y1, topLeft, x1, y2, bottomLeft);
      const p2 = interpolate(x1, y1, topLeft, x2, y1, topRight);
      vertex(p1.x, p1.y);
      vertex(p2.x, p2.y);
      break;
    }
    case 8: { //top left corner is inside threshold
      const p1 = interpolate(x1, y1, topLeft, x2, y1, topRight);
      const p2 = interpolate(x1, y2, bottomLeft, x2, y2, bottomRight);
      vertex(p1.x, p1.y);
      vertex(p2.x, p2.y);
      break;
    }
    case 9: { //top left and bottom left corners are inside threshold
      const p1 = interpolate(x1, y1, topLeft, x1, y2, bottomLeft);
      const p2 = interpolate(x2, y1, topRight, x2, y2, bottomRight);
      vertex(p1.x, p1.y);
      vertex(p2.x, p2.y);
      break;
    }
    case 10: { //top left and top right corners are inside threshold
      const p1 = interpolate(x1, y1, topLeft, x2, y1, topRight);
      const p2 = interpolate(x2, y1, topRight, x2, y2, bottomRight);
      vertex(p1.x, p1.y);
      vertex(p2.x, p2.y);
      endShape(CLOSE);
      beginShape();
      const p3 = interpolate(x1, y2, bottomLeft, x2, y2, bottomRight);
      const p4 = interpolate(x1, y1, topLeft, x1, y2, bottomLeft);
      vertex(p3.x, p3.y);
      vertex(p4.x, p4.y);
      break;
    }
    case 11: { //top left, bottom left, and bottom right corners are inside threshold
      const p1 = interpolate(x1, y1, topLeft, x1, y2, bottomLeft);
      const p2 = interpolate(x1, y2, bottomLeft, x2, y2, bottomRight);
      vertex(p1.x, p1.y);
      vertex(p2.x, p2.y);
      break;
    }
    case 12: { //top left and top right corners are inside threshold
      const p1 = interpolate(x1, y1, topLeft, x2, y1, topRight);
      const p2 = interpolate(x1, y2, bottomLeft, x2, y2, bottomRight);
      vertex(p1.x, p1.y);
      vertex(p2.x, p2.y);
      break;
    }
    case 13: { //top left, bottom left, and top right corners are inside threshold
      const p1 = interpolate(x1, y1, topLeft, x1, y2, bottomLeft);
      const p2 = interpolate(x2, y1, topRight, x2, y2, bottomRight);
      vertex(p1.x, p1.y);
      vertex(p2.x, p2.y);
      break;
    }
    case 14: { //all corners (except bottom left) are inside threshold
      const p1 = interpolate(x1, y1, topLeft, x2, y1, topRight);
      const p2 = interpolate(x1, y2, bottomLeft, x2, y2, bottomRight);
      vertex(p1.x, p1.y);
      vertex(p2.x, p2.y);
      break;
    }
  }
  endShape();
}

function combinedInfluence(x, y) {
  //sum influence of all metaballs at point (x, y)
  return metaballs.reduce((sum, metaball) => sum + metaball.influence(x, y), 0);
}

