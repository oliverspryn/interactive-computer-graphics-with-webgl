"use strict";

var Coord = function() {
  this.X = 1;
  this.Y = 1;
  this.Z = 1;
};

var RenderType = {
  WIRE_FRAME: 1,
  SHADED:     2,
  BOTH:       3,
  NONE:       5
};

var ShapeType = {  
  CONFIG: {
    NUL2: -0.5, // Negative, half of the unit length
    UL2:  0.5   // Half of the unit length
  },
  
  CONE: function(iterations) {
    var poly = [
      [ 0,                    ShapeType.CONFIG.NUL2 ],
      [ ShapeType.CONFIG.UL2, ShapeType.CONFIG.NUL2 ],
      [ 0,                    ShapeType.CONFIG.UL2  ]
    ];
    
    return ShapeType.POLY(iterations, poly);
  },
  
  CYLINDER: function(iterations) {
    var poly = [
      [ 0,                    ShapeType.CONFIG.NUL2 ],
      [ ShapeType.CONFIG.UL2, ShapeType.CONFIG.NUL2 ],
      [ ShapeType.CONFIG.UL2, ShapeType.CONFIG.UL2  ],
      [ 0,                    ShapeType.CONFIG.UL2  ]
    ];
    
    return ShapeType.POLY(iterations, poly);
  },
  
  POLY: function(iterations, poly) {
    var v = [];
    if(iterations < 3) iterations = 3;
    var rad = (2 * Math.PI) / iterations;
  
  //Check the polyline
    if(poly.length <= 2) return; // Too short
    
    var nowX = 0, nowZ = 0;
    var nextX = 0, nextZ = 0;
    
  //Bottom
    for(var i = 0; i < iterations; ++i) {
      nowX = Math.cos(rad * i);
      nowZ = Math.sin(rad * i);
      
      nextX = Math.cos(rad * (i + 1));
      nextZ = Math.sin(rad * (i + 1));
      
      v.push(nowX * poly[0][0]);
      v.push(poly[0][1]);
      v.push(nowZ * poly[0][0]);
      
      v.push(nowX * poly[1][0]);
      v.push(poly[1][1]);
      v.push(nowZ * poly[1][0]);
      
      v.push(nextX * poly[1][0]);
      v.push(poly[1][1]);
      v.push(nextZ * poly[1][0]);
    }
    
  //Middle
    for(var i = 0; i < iterations; ++i) {
      for(var j = 1; j < poly.length - 2; ++j) {
        nowX = Math.cos(rad * i);
        nowZ = Math.sin(rad * i);

        nextX = Math.cos(rad * (i + 1));
        nextZ = Math.sin(rad * (i + 1));

        v.push(nowX * poly[j][0]);
        v.push(poly[j][1]);
        v.push(nowZ * poly[j][0]);

        v.push(nowX * poly[j + 1][0]);
        v.push(poly[j + 1][1]);
        v.push(nowZ * poly[j + 1][0]);

        v.push(nextX * poly[j + 1][0]);
        v.push(poly[j + 1][1]);
        v.push(nextZ * poly[j + 1][0]);
        
        v.push(nowX * poly[j][0]);
        v.push(poly[j][1]);
        v.push(nowZ * poly[j][0]);

        v.push(nextX * poly[j + 1][0]);
        v.push(poly[j + 1][1]);
        v.push(nextZ * poly[j + 1][0]);

        v.push(nextX * poly[j][0]);
        v.push(poly[j][1]);
        v.push(nextZ * poly[j][0]);
      }
    }
    
  //Top
    var last = poly.length - 1;
    
    for(var i = 0; i < iterations; ++i) {
      nowX = Math.cos(rad * i);
      nowZ = Math.sin(rad * i);
      
      nextX = Math.cos(rad * (i + 1));
      nextZ = Math.sin(rad * (i + 1));
      
      v.push(nowX * poly[last - 1][0]);
      v.push(poly[last - 1][1]);
      v.push(nowZ * poly[last - 1][0]);
      
      v.push(nextX * poly[last - 1][0]);
      v.push(poly[last - 1][1]);
      v.push(nextZ * poly[last - 1][0]);
      
      v.push(nextX * poly[last][0]);
      v.push(poly[last][1]);
      v.push(nextZ * poly[last][0]);
    }
    
    return v;
  },
  
  SPHERE: function(iterations) {
  //Generate the polyline
    var phi = Math.PI / iterations;
    var poly = [];
    var ninety = (Math.PI / 2.0) * (-1.0);
    
    for(var i = 0; i < iterations + 1; ++i) {
      poly.push([
        Math.cos((phi * i) - ninety) * ShapeType.CONFIG.UL2,
        Math.sin((phi * i) - ninety) * ShapeType.CONFIG.UL2
      ]);
    }
    
    return ShapeType.POLY(iterations, poly);
  }
};

var BufferCabinet = function() {
  this.VBO = gl.createBuffer();
  this.VCO = gl.createBuffer();
};

var VariableCabinet = function(buffCab) {
  this.buffCab = buffCab;
  
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffCab.VBO);
  this.vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(this.vPosition);
  
  this.uColor = gl.getUniformLocation(program, "uColor");
  this.uModel = gl.getUniformLocation(program, "uModel");
  this.uProj = gl.getUniformLocation(program, "uProj");
  this.uView = gl.getUniformLocation(program, "uView");
};

var Renderer = function(type, iterations, renderType) {
  this.color = [ Math.random(), Math.random(), Math.random() ];
  this.iterations = iterations;
  this.model = mat4();
  this.vertices = [];
  
  this.R = new Coord();
  this.R.X = 0; this.R.Y = 0; this.R.Z = 0; 
  this.S = new Coord();
  this.S.X = 1; this.S.Y = 1; this.S.Z = 1;
  this.T = new Coord();
  this.T.X = 0; this.T.Y = 0; this.T.Z = 0;
  
  this.renderType = (renderType == undefined ? RenderType.BOTH : renderType);
  this.type = type;
};

Renderer.prototype.render = function(bc, vc, index, regen) {
 //Generate the vertices
  if (this.vertices.length == 0 || regen == true || regen !== undefined) {
    this.vertices = this.type(this.iterations);
  }
  
  gl.bindBuffer(gl.ARRAY_BUFFER, bc.VBO);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);
  
//Apply and send the model matrix
  this.model = mat4();
  
  this.model = mult(this.model, translate(this.T.X, this.T.Y, this.T.Z));
  
  this.model = mult(this.model, rotate(this.R.X, 1, 0, 0));
  this.model = mult(this.model, rotate(this.R.Y, 0, 1, 0));
  this.model = mult(this.model, rotate(this.R.Z, 0, 0, 1));
  
  this.model = mult(this.model, scalem(this.S.X, this.S.Y, this.S.Z));
  
  gl.uniformMatrix4fv(vc.uModel, false, flatten(this.model));
  
//Draw the geometry
  if(this.renderType == RenderType.NONE) return;
  
  if(this.renderType & 2) { // SHADED
    if (selected > -1 && index == selected) {
      gl.uniform4f(vc.uColor, 1.0, 0.0, 0.0, 1.0);
    } else {
      gl.uniform4f(vc.uColor, this.color[0], this.color[1], this.color[2], 1.0);
    }
    
    gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
  }
 
  if(this.renderType & 1) { //WIRE_FRAME
    if (selected > -1 && index == selected && !(this.renderType & 2)) {
      gl.uniform4f(vc.uColor, 1.0, 0.0, 0.0, 1.0);
    } else {
      gl.uniform4f(vc.uColor, 1.0, 1.0, 1.0, 1.0);
    }
    
    gl.drawArrays(gl.LINES, 0, this.vertices.length / 3);
  }
};

Renderer.prototype.setRenderer = function(type) {
  this.renderType = type;
};

Renderer.prototype.setRotation = function(theta, x, y, z) {
  if (x == 1) this.R.X = theta;
  if (y == 1) this.R.Y = theta;
  if (z == 1) this.R.Z = theta;
};

Renderer.prototype.setScale = function(x, y, z) {
  this.S.X = x;
  this.S.Y = y;
  this.S.Z = z;
};

Renderer.prototype.setTranslation = function(x, y, z) {
  this.T.X = x;
  this.T.Y = y;
  this.T.Z = z;
};

var gl = null, program = null, shapes = [], bc = null, vc = null, selected = 0;

window.onload = function() {
  bootstrapGL();
  bootstrapUI();
};

function bootstrapGL() {
//Get the canvas and WebGL context
  var canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  
//Configure the WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1);
  
//Compile the shaders
  program = initShaders(gl, "vertex", "fragment");
  gl.useProgram(program);
  
//Load the vertices onto the GPU
  loadData();
}

function loadData() {
//Load the buffers and variable accessors
  bc = new BufferCabinet();
  vc = new VariableCabinet(bc);
  
//Set the projection matrix
  var canvas = document.getElementById("gl-canvas");

  //Thanks: https://cs.unm.edu/~angel/WebGL/7E/05/perspective2.js
  var proj = perspective(45, canvas.width / canvas.height, 1, 100);
  var view = lookAt(vec3(0.0, 0.0, 7.0), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
  
  gl.uniformMatrix4fv(vc.uProj, false, flatten(proj));
  gl.uniformMatrix4fv(vc.uView, false, flatten(view));
  
//The render "loop"
  render();
}

function render() {
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  for(var i = 0; i < shapes.length; ++i) {
    shapes[i].render(bc, vc, i);
  }
}

function addEntry(type) {
  var list = $("div.list");
  
  switch(type) {
    case ShapeType.CONE:
      list.append("<h3>Cone</h3>");
      break;
    
    case ShapeType.CYLINDER:
      list.append("<h3>Cylinder</h3>");
      break;
      
    case ShapeType.SPHERE:
      list.append("<h3>Sphere</h3>");
      break;
  }
  
  list.append(
    "<div>" + 
    "<fieldset class=\"scale\">" + 
    "<legend class=\"header\">Scale: (1, 1, 1)</legend>" + 
    "<div class=\"slider scalex\"></div>" + 
    "<div class=\"slider scaley\"></div>" + 
    "<div class=\"slider scalez\"></div>" + 
    "</fieldset>" + 
                
    "<fieldset class=\"rotate\">" + 
    "<legend class=\"header\">Rotate: (0, 0, 0)</legend>" + 
    "<div class=\"slider rotx\"></div>" + 
    "<div class=\"slider roty\"></div>" + 
    "<div class=\"slider rotz\"></div>" + 
    "</fieldset>" + 
                
    "<fieldset class=\"translate\">" + 
    "<legend class=\"header\">Translate: (0, 0, 0)</legend>" + 
    "<div class=\"slider transx\"></div>" + 
    "<div class=\"slider transy\"></div>" + 
    "<div class=\"slider transz\"></div>" + 
    "</fieldset>" + 
                
    "<fieldset class=\"rendering\">" + 
    "<legend>Rendering Mode</legend>" + 
    "<label><input type=\"checkbox\" class=\"wf\" checked>Wireframe</label>" + 
    "<label><input type=\"checkbox\" class=\"sd\" checked>Shaded</label>" + 
    "</fieldset>" + 
    "</div>"
  );
  
//Re-initialize all jQuery UI controls
  initControllers();
  $("div.list").accordion("refresh").accordion("option", "active", shapes.length);
}

function renderStyle(sd, wf) {
  var active = $("div.list").accordion("option", "active");
  active = (active == -1 ? 0 : active); // If panel is selected by default, active is not set
  var h3 = $("div.list h3").eq(active);

  if(sd && wf) {
    shapes[active].setRenderer(RenderType.BOTH);
    h3.text(h3.text().replace(" (Hidden)", ""));
  } else if(sd) {
    shapes[active].setRenderer(RenderType.SHADED);
    h3.text(h3.text().replace(" (Hidden)", ""));
  } else if(wf) {
    shapes[active].setRenderer(RenderType.WIRE_FRAME);
    h3.text(h3.text().replace(" (Hidden)", ""));
  } else {
    shapes[active].setRenderer(RenderType.NONE);
    h3.append(" (Hidden)");
  }
  
  render();
}

function initControllers() {
  var accordionBody = $("div.list div:last-child");
  
  var r  = accordionBody.find(".rotx, .roty, .rotz");
  var rh = accordionBody.find(".rotate .header");
  var rx = accordionBody.find(".rotx");
  var ry = accordionBody.find(".roty");
  var rz = accordionBody.find(".rotz");
  
  var s  = accordionBody.find(".scalex, .scaley, .scalez");
  var sh = accordionBody.find(".scale .header");
  var sx = accordionBody.find(".scalex");
  var sy = accordionBody.find(".scaley");
  var sz = accordionBody.find(".scalez");
  
  var t  = accordionBody.find(".transx, .transy, .transz");
  var th = accordionBody.find(".translate .header");
  var tx = accordionBody.find(".transx");
  var ty = accordionBody.find(".transy");
  var tz = accordionBody.find(".transz");
  
  var sd = accordionBody.find(".sd");
  var wf = accordionBody.find(".wf");
  
  r.slider({
      min: 0,
      max: 360,
      value: 0,
      slide: function(event, ui) {
        var active = $("div.list").accordion("option", "active");
        var x = $(this).hasClass("rotx") ? ui.value : rx.slider("value");
        var y = $(this).hasClass("roty") ? ui.value : ry.slider("value");
        var z = $(this).hasClass("rotz") ? ui.value : rz.slider("value");
        
        var value = "Rotate: (";
        value += x + ", ";
        value += y + ", ";
        value += z + ")";
       
        rh.text(value);
        active = (active == -1 ? 0 : active); // If panel is selected by default, active is not set
        
        shapes[active].setRotation(x, 1, 0, 0);
        shapes[active].setRotation(y, 0, 1, 0);
        shapes[active].setRotation(z, 0, 0, 1);
        render();
      }
  });
  
  s.slider({
      min: 1,
      max: 10,
      value: 1,
      step: 0.01,
      slide: function(event, ui) {
        var active = $("div.list").accordion("option", "active");
        var x = $(this).hasClass("scalex") ? ui.value : sx.slider("value");
        var y = $(this).hasClass("scaley") ? ui.value : sy.slider("value");
        var z = $(this).hasClass("scalez") ? ui.value : sz.slider("value");
        
        var value = "Scale: (";
        value += x + ", ";
        value += y + ", ";
        value += z + ")";
       
        sh.text(value);
        active = (active == -1 ? 0 : active); // If panel is selected by default, active is not set
        
        shapes[active].setScale(x, y, z);
        render();
      }
  });
  
  t.slider({
      min: -5,
      max: 5,
      value: 0,
      step: 0.01,
      slide: function(event, ui) {
        var active = $("div.list").accordion("option", "active");
        var x = $(this).hasClass("transx") ? ui.value : tx.slider("value");
        var y = $(this).hasClass("transy") ? ui.value : ty.slider("value");
        var z = $(this).hasClass("transz") ? ui.value : tz.slider("value");
        
        var value = "Translate: (";
        value += x + ", ";
        value += y + ", ";
        value += z + ")";
       
        th.text(value);
        active = (active == -1 ? 0 : active); // If panel is selected by default, active is not set
        
        shapes[active].setTranslation(x, y, z);
        render();
      }
  });
  
  sd.change(function() {
    renderStyle(sd.is(":checked"), wf.is(":checked"))
  });
  
  wf.change(function() {
    renderStyle(sd.is(":checked"), wf.is(":checked"))
  });
}

function bootstrapUI() {
//Add buttons
  $("button").button();
  
  $("button#aCone").click(function() {
    addEntry(ShapeType.CONE);
    shapes.push(new Renderer(ShapeType.CONE, $("input#iterations").spinner("value")));
    render();
  });
  
  $("button#aCylinder").click(function() {
    addEntry(ShapeType.CYLINDER);
    shapes.push(new Renderer(ShapeType.CYLINDER, $("input#iterations").spinner("value")));
    render();
  });
  
  $("button#aSphere").click(function() {
    addEntry(ShapeType.SPHERE);
    shapes.push(new Renderer(ShapeType.SPHERE, $("input#iterations").spinner("value")));
    render();
  });
  
//Iterations spinner
  $("input#iterations").spinner().spinner("option", "min", 3).focus(function() {
    $(this).blur();
  });

//Object list
  $("div.list").accordion({
    animate: false,
    collapsible: true,
    activate: function(event, ui) {
      selected = $("div.list").accordion("option", "active");
      render();
    }
  });
}