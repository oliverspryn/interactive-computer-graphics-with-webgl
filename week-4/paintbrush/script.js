"use strict";

function Point() {
  this.x = 0;
  this.y = 0;
}

var canvas = null, VBO = null, CBO = null, gl = null, program = null, currentThickness = null, currentColor = null;
var v = [], breaks = [], colors = [], thickness = [];

window.onload = function() {
//Get the canvas and WebGL context
  canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  
//Configure the WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1, 1, 1, 1);
  
//Compile the shaders
  program = initShaders(gl, "vertex", "fragment");
  gl.useProgram(program);
  
//Get the canvas and listen to its events
  var down = false;
  
  canvas.addEventListener("mousedown", function() {
    down = true;
    
    currentColor = toRGB(document.getElementById("color").value);    
    currentThickness = document.getElementById("thickness").value;    
    thickness.push(currentThickness);
  });
  
  canvas.addEventListener("mouseup", function() {
    down = false;
    breaks.push(v.length / 2);
    console.log(colors);
  });
  
  canvas.addEventListener("mousemove", function(e) {
  //Leave now!
    if(!down) return; // ... and never come back!!! ~ Gollum
  
    loadData(toClipCoord(e.clientX, e.clientY));
  });
  
//Clear the canvas!
  var clear = document.getElementById("clear");
  
  clear.addEventListener("click", function() {
    currentThickness = null;
    currentColor = null;
    v = [];
    breaks = [];
    colors = [];
    thickness = [];
    
    gl.clear(gl.COLOR_BUFFER_BIT);
  });
  
//Load the vertices and colors onto the GPU
  VBO = gl.createBuffer();
  CBO = gl.createBuffer();
  //loadData();
};

function toClipCoord(x, y) {
  var size = canvas.getBoundingClientRect();
  
//Put the origin to the center of the canvas
  x -= (size.width / 2.0);
  y -= (size.height / 2.0);
  y *= -1.0;
  
//Translate to the clip coordinates
  x /= (size.width / 2.0);
  y /= (size.height / 2.0);
  
//Build the return object
  var p = new Point();
  p.x = x;
  p.y = y;
  
  return p;
}

function pxToClipCoord(x, y) {
  var CLIP_HEIGHT = 2;
  var CLIP_WIDTH = 2;
  var size = canvas.getBoundingClientRect();
  
//Build the return object
  var p = new Point();
  p.x = x / (size.width / CLIP_WIDTH);
  p.y = y / (size.width / CLIP_HEIGHT);
  
  return p;
}

function toRGB(hex) { //Thanks: http://stackoverflow.com/a/11508164/663604
  var muffin = parseInt(hex.replace("#", ""), 16);
  var r = ((muffin >> 16) & 255) / 255;
  var g = ((muffin >> 8)  & 255) / 255;
  var b = ((muffin >> 0)  & 255) / 255;
  
  return [r, g, b];
}

function loadData(pt) {  
  if(currentThickness == 1) {
    v.push(pt.x);
    v.push(pt.y);
    
    colors.push(currentColor[0]); //R
    colors.push(currentColor[1]); //G
    colors.push(currentColor[2]); //B ... should have used an object for this
  } else {
    var offset = Math.floor(currentThickness / 2);
    offset = pxToClipCoord(offset, offset);

    //Left triangle
    v.push(pt.x - offset.x); // +---------+    Assume this square represents the brush
    v.push(pt.y + offset.y); // | \       |    point. It is built with two triangles,
                             // |   \     |    left then right with a clockwise winding
    v.push(pt.x + offset.x); // |     \   |    order, starting from the top left.
    v.push(pt.y - offset.y); // |       \ |    The user's cursor would be at the center
                             // +---------+    of the square.
    v.push(pt.x - offset.x);
    v.push(pt.y - offset.y);

    //Right triangle
    v.push(pt.x - offset.x);
    v.push(pt.y + offset.y);

    v.push(pt.x + offset.x);
    v.push(pt.y + offset.y);

    v.push(pt.x + offset.x);
    v.push(pt.y - offset.y);
    
    //Load the colors
    for(var i = 0; i < 6; ++i) {
      colors.push(currentColor[0]); //R
      colors.push(currentColor[1]); //G
      colors.push(currentColor[2]); //B ... should have used an object for this
    }
  }
  
//Load the vertices onto the GPU
  gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(v), gl.STATIC_DRAW);
  
//Having VBO selected as the buffer, bind the vertex(x,y) pairs to the out shader variable
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
  
//Load the colors onto the GPU
  gl.bindBuffer(gl.ARRAY_BUFFER, CBO);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
  
//Gain access to the color variable
  var vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);
  
//The render "loop"
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  if(breaks.length == 0)
    gl.drawArrays(thickness[0] == 1 ? gl.LINE_STRIP : gl.TRIANGLES, 0, v.length / 2);
  else {
    var start = 0;
    
    for(var i = 0; i < breaks.length; ++i) {
      gl.drawArrays(thickness[i] == 1 ? gl.LINE_STRIP : gl.TRIANGLES, start, breaks[i] - start);
      start = breaks[i] + 1;
    }
    
    gl.drawArrays(thickness[breaks.length] == 1 ? gl.LINE_STRIP : gl.TRIANGLES, start, (v.length / 2) - start);
  }
}