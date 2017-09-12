"use strict";

//Point object
function Point(x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.rotate = function(theta) {
  //x' = x cos(d theta) - y sin(d theta)
  //y' = x sin(d theta) + y cos(d theta)
  //such that d = sqrt(x^2 + y^2)
  
  var d = Math.sqrt((this.x * this.x) + (this.y * this.y));
  var radTheta = theta * (Math.PI / 180.0);
  var xold = this.x, yold = this.y;
  
  this.x = xold * Math.cos(d * radTheta) - yold * Math.sin(d * radTheta);
  this.y = xold * Math.sin(d * radTheta) + yold * Math.cos(d * radTheta);
}

var VBO = null, gl = null, program = null;

window.onload = function() {
//Get the canvas and WebGL context
  var canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  
//Configure the WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1);
  
//Compile the shaders
  program = initShaders(gl, "vertex", "fragment");
  gl.useProgram(program);
  
//Now listen for changes to the sliders
  var rotation = document.getElementById("rotation");
  var divisions = document.getElementById("tessellation");
  
  divisions.addEventListener("change", function() {
    loadData(divisions.value, rotation.value);
  });
  
  rotation.addEventListener("change", function() {
    loadData(divisions.value, rotation.value);
  });
  
//Load the vertices onto the GPU
  VBO = gl.createBuffer();
  loadData(divisions.value, rotation.value);
};

function loadData(divisions, rotation) {
//Generate the tessellated triangle
  var v = createVertices(divisions, rotation);
  
//Load the vertices onto the GPU
  gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(v), gl.STATIC_DRAW);
  
//Having VBO selected as the buffer, bind the vertex(x,y) pairs to the out shader variable
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
  
//The render "loop"
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, v.length / 2);
}

function createVertices(divisions, rotation) {
//Config
  var radius = 0.5;
  var v = [];
  
//Unit triangle
  var sin60 = Math.sin(60 * (Math.PI / 180.0));      // sin(60 deg)
  var height = (radius * 2.0) / divisions;           // Height of a small triangle
  var length = height / sin60;                       // Side length of a triangle
  var len2 = length / 2.0;                           // Length / 2
  
//Large triangle
  var largeHeight = radius * 2.0;                    // Height of overall triangle
  var largeLength = largeHeight / sin60;             // Side length of overaell triangle
  var largeToOrigin = (largeLength / 2.0) / sin60;   // Overall triangle distance from origin to corner
  
//Punch out the rows
  var direction = 1; // 1 = up, -1 = down
  var prevCol = 1;
  var rowTop = largeToOrigin;
  var rowBottom = rowTop - height;
  var startLeft = len2 * -1.0;
  
  for(var row = 0; row < divisions; ++row) {
    var startNow = startLeft;
    var one, two, three;
    
    for(var col = 0; col < prevCol; ++col) {
      if(direction == 1) {                             // Up
        one = new Point(startNow, rowBottom);
        one.rotate(rotation);
        v.push(one.x); v.push(one.y);                     // Bottom-left
        two = new Point(startNow + len2, rowTop);
        two.rotate(rotation);
        v.push(two.x); v.push(two.y);                     // Top
        three = new Point(startNow + length, rowBottom);
        three.rotate(rotation);
        v.push(three.x); v.push(three.y);                 // Bottom-right
      } else {                                         // Down
        one = new Point(startNow, rowTop);
        one.rotate(rotation);
        v.push(one.x); v.push(one.y);                     // Top-right
        two = new Point(startNow + len2, rowBottom);
        two.rotate(rotation);
        v.push(two.x); v.push(two.y);                     // Bottom
        three = new Point(startNow + length, rowTop);
        three.rotate(rotation);
        v.push(three.x); v.push(three.y);                 // Top-left
      }
      
      direction *= -1;
      startNow += len2;
    }
    
    direction = 1;
    prevCol += 2;
    rowTop -= height;
    rowBottom -= height;
    startLeft -= len2;
  }
  
  return v;
}