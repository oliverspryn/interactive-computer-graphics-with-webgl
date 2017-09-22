"use strict";

var Coord = function() {
  this.X = 1;
  this.Y = 1;
  this.Z = 1;
  this.W = 1;
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
    var n = [], v = [];
    if(iterations < 3) iterations = 3;
    var rad = (2 * Math.PI) / iterations;
  
  //Check the polyline
    if(poly.length <= 2) return; // Too short
    
    var nowX = 0, nowZ = 0;
    var nextX = 0, nextZ = 0;
    
    var a, b, c;
    var norm = null;
    var nu = null, nv = null;
    var verts = 0;
    
  //Bottom
    for(var i = 0; i < iterations; ++i) {
      nowX = Math.cos(rad * i);
      nowZ = Math.sin(rad * i);
      
      nextX = Math.cos(rad * (i + 1));
      nextZ = Math.sin(rad * (i + 1));
      
      v.push(nowX * poly[0][0]);
      v.push(poly[0][1]);
      v.push(nowZ * poly[0][0]);
      a = verts;
      verts += 3;
      
      v.push(nowX * poly[1][0]);
      v.push(poly[1][1]);
      v.push(nowZ * poly[1][0]);
      b = verts;
      verts += 3;
      
      v.push(nextX * poly[1][0]);
      v.push(poly[1][1]);
      v.push(nextZ * poly[1][0]);
      c = verts;
      verts += 3;
      
      nu = subtract(vec3(v[b + 0], v[b + 1], v[b + 2]), vec3(v[a + 0], v[a + 1], v[a + 2]));
      nv = subtract(vec3(v[c + 0], v[c + 1], v[c + 2]), vec3(v[b + 0], v[b + 1], v[b + 2]));
      norm = normalize(cross(nu, nv));
      n.push(norm);
      n.push(norm);
      n.push(norm);
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
        a = verts;
        verts += 3; 

        v.push(nowX * poly[j + 1][0]);
        v.push(poly[j + 1][1]);
        v.push(nowZ * poly[j + 1][0]);
        b = verts;
        verts += 3;
        
        v.push(nextX * poly[j + 1][0]);
        v.push(poly[j + 1][1]);
        v.push(nextZ * poly[j + 1][0]);
                
        c = verts;
        verts += 3;
      
        nu = subtract(vec3(v[b + 0], v[b + 1], v[b + 2]), vec3(v[a + 0], v[a + 1], v[a + 2]));
        nv = subtract(vec3(v[c + 0], v[c + 1], v[c + 2]), vec3(v[b + 0], v[b + 1], v[b + 2]));
        norm = normalize(cross(nu, nv));
        n.push(norm);
        n.push(norm);
        n.push(norm);
        
        v.push(nowX * poly[j][0]);
        v.push(poly[j][1]);
        v.push(nowZ * poly[j][0]);
        a = verts;
        verts += 3;
        
        v.push(nextX * poly[j + 1][0]);
        v.push(poly[j + 1][1]);
        v.push(nextZ * poly[j + 1][0]);
        b = verts;
        verts += 3;
        
        v.push(nextX * poly[j][0]);
        v.push(poly[j][1]);
        v.push(nextZ * poly[j][0]);       
        
        c = verts;
        verts += 3;
        
        nu = subtract(vec3(v[b + 0], v[b + 1], v[b + 2]), vec3(v[a + 0], v[a + 1], v[a + 2]));
        nv = subtract(vec3(v[c + 0], v[c + 1], v[c + 2]), vec3(v[b + 0], v[b + 1], v[b + 2]));
        norm = normalize(cross(nu, nv));
        n.push(norm);
        n.push(norm);
        n.push(norm);
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
      a = verts;
      verts += 3;
      
      v.push(nextX * poly[last][0]);
      v.push(poly[last][1]);
      v.push(nextZ * poly[last][0]);
      b = verts;
      verts += 3;
      
      v.push(nextX * poly[last - 1][0]);
      v.push(poly[last - 1][1]);
      v.push(nextZ * poly[last - 1][0]);    
      
      c = verts;
      verts += 3;

      nu = subtract(vec3(v[b + 0], v[b + 1], v[b + 2]), vec3(v[a + 0], v[a + 1], v[a + 2]));
      nv = subtract(vec3(v[c + 0], v[c + 1], v[c + 2]), vec3(v[b + 0], v[b + 1], v[b + 2]));
      norm = normalize(cross(nu, nv));
      n.push(norm);
      n.push(norm);
      n.push(norm);
    }
    
    return {
      normals: n,
      vertices: v
    };
  },
  
  SPHERE: function(iterations) {
  //Generate the polyline
    var phi = Math.PI / iterations;
    var poly = [];
    var ninety = (Math.PI / 2.0);
    
    for(var i = 0; i < iterations + 1; ++i) {
      poly.push([
        Math.cos((phi * i) - ninety) * ShapeType.CONFIG.UL2,
        Math.sin((phi * i) - ninety) * ShapeType.CONFIG.UL2
      ]);
    }
    
    return ShapeType.POLY(iterations, poly);
  }
};

var LightType = {
  AMBIENT: 0,
  DIRECTIONAL: 1,
  POINT: 2
};

var BufferCabinet = function() {
  this.VBO = gl.createBuffer();
  this.VNO = gl.createBuffer();
};

var VariableCabinet = function(buffCab) {
  this.buffCab = buffCab;
  
//Buffer binding
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffCab.VNO);
  this.vNormal = gl.getAttribLocation(program, "vNormal");
  gl.vertexAttribPointer(this.vNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(this.vNormal);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffCab.VBO);
  this.vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(this.vPosition);
  
//Light properties
  this.ulColor = gl.getUniformLocation(program, "ulColor");
  this.ulDirection = gl.getUniformLocation(program, "ulDirection");
  
//Model and view matrices
  this.uColor = gl.getUniformLocation(program, "uColor");
  this.uModel = gl.getUniformLocation(program, "uModel");
  this.uNorm = gl.getUniformLocation(program, "uNorm");
  this.uProj = gl.getUniformLocation(program, "uProj");
  this.uView = gl.getUniformLocation(program, "uView");
  
//Materials
  this.umAmb = gl.getUniformLocation(program, "umAmb");
  this.umDiff = gl.getUniformLocation(program, "umDiff");
  this.umShin = gl.getUniformLocation(program, "umShin");
  this.umSpec = gl.getUniformLocation(program, "umSpec");
  
//Lights
  this.ulAmb = gl.getUniformLocation(program, "ulAmb");
  this.ulDiff = gl.getUniformLocation(program, "ulDiff");
  this.ulPos = gl.getUniformLocation(program, "ulPos");
  this.ulSpec = gl.getUniformLocation(program, "ulSpec");
};

var Renderer = function(type, iterations, renderType) {
  this.color = [ Math.random(), Math.random(), Math.random() ];
  this.iterations = iterations;
  this.model = mat4();
  this.norm = mat4();
  this.normals = [];
  this.vertices = [];
  
  this.ambient = new Coord();
  this.ambient.X = 0.1; this.ambient.Y = 0.1; this.ambient.Z = 0.1;
  this.diffuse = new Coord();
  this.diffuse.X = 1.0; this.diffuse.Y = 0.8; this.diffuse.Z = 0.0;
  this.shininess = new Coord();
  this.shininess.X = 100.0;
  this.specular = new Coord();
  this.specular.X = 1.0; this.specular.Y = 1.0; this.specular.Z = 1.0;
  
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
    var v = this.type(this.iterations);
    this.normals = v.normals
    this.vertices = v.vertices;
  }
  
  gl.bindBuffer(gl.ARRAY_BUFFER, bc.VBO);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, bc.VNO);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);
  
//Apply and send the model and normal matrices
  this.model = mat4();
  this.model = mult(this.model, translate(this.T.X, this.T.Y, this.T.Z));
  this.model = mult(this.model, rotate(this.R.X, 1, 0, 0));
  this.model = mult(this.model, rotate(this.R.Y, 0, 1, 0));
  this.model = mult(this.model, rotate(this.R.Z, 0, 0, 1));
  this.model = mult(this.model, scalem(this.S.X, this.S.Y, this.S.Z));
  
  this.norm = transpose(inverse4(this.model));
  
  gl.uniformMatrix4fv(vc.uModel, false, flatten(this.model));
  gl.uniformMatrix4fv(vc.uNorm, false, flatten(this.norm));
  
//Set the material properties
  gl.uniform4fv(vc.umAmb, flatten(this.ambient));
  gl.uniform4fv(vc.umDiff, flatten(this.diffuse));
  gl.uniform1f(vc.umShin, flatten(this.shininess));
  gl.uniform4fv(vc.umSpec, flatten(this.specular));
  
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

var Light = function() {
  this.ambient = new Coord();
  this.diffuse = new Coord();
  this.position = new Coord();
  this.specular = new Coord();
};

Light.prototype.render = function(bc, vc) {
  gl.uniform4fv(vc.ulAmb, flatten(this.ambient));
  gl.uniform4fv(vc.ulDiff, flatten(this.diffuse));
  gl.uniform4fv(vc.ulPos, flatten(this.position));
  gl.uniform4fv(vc.ulSpec, flatten(this.specular));
};

Light.prototype.setAmbient = function(r, g, b, a) {
  this.ambient.X = r;
  this.ambient.Y = g;
  this.ambient.Z = b;
  this.ambient.W = a;
};

Light.prototype.setDiffuse = function(r, g, b, a) {
  this.diffuse.X = r;
  this.diffuse.Y = g;
  this.diffuse.Z = b;
  this.diffuse.W = a;
};

Light.prototype.setPosition = function(x, y, z) {
  this.position.X = x;
  this.position.Y = y;
  this.position.Z = z;
};

Light.prototype.setSpecular = function(r, g, b, a) {
  this.specular.X = r;
  this.specular.Y = g;
  this.specular.Z = b;
  this.specular.W = a;
};

var gl = null, program = null, shapes = [], lights = [], bc = null, vc = null, selected = 0, actionPacket = null;

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

function associate(objectIdx, actionIdx) {
  var act = $("div.panel button").eq(actionIdx);
  var obj = $("li.list-group-item").eq(objectIdx);
  var category = obj.hasClass("geometry") ? "geometry" : "light";
  actionPacket = {
    change: null,
    labels: [],
    max: 1,
    min: 0,
    step: 1
  };
  
//Get the object name
  $("div.panel-heading").text(obj.text());
  
//Build the action object
  if(category == "geometry") {
    if(act.hasClass("translate")) {
      actionPacket.change = shapes[objectIdx].T;
      actionPacket.labels = ['X', 'Y', 'Z'];
      actionPacket.max = 5;
      actionPacket.min = -5;
      actionPacket.step = 0.01
    } else if(act.hasClass("rotate")) {
      actionPacket.change = shapes[objectIdx].R;
      actionPacket.labels = ['X', 'Y', 'Z'];
      actionPacket.max = 360;
      actionPacket.min = -360;
      actionPacket.step = 0.01
    } else if(act.hasClass("scale")) {
      actionPacket.change = shapes[objectIdx].S;
      actionPacket.labels = ['X', 'Y', 'Z'];
      actionPacket.max = 5;
      actionPacket.min = 0.1;
      actionPacket.step = 0.01
    } else if(act.hasClass("material-ambient")) {
      actionPacket.change = shapes[objectIdx].ambient;
      actionPacket.labels = ['R', 'G', 'B', 'A'];
      actionPacket.max = 1.0;
      actionPacket.min = 0.0;
      actionPacket.step = 0.01
    } else if(act.hasClass("material-diffuse")) {
      actionPacket.change = shapes[objectIdx].diffuse;
      actionPacket.labels = ['R', 'G', 'B', 'A'];
      actionPacket.max = 1.0;
      actionPacket.min = 0.0;
      actionPacket.step = 0.01
    } else if(act.hasClass("material-shininess")) {
      actionPacket.change = shapes[objectIdx].shininess;
      actionPacket.labels = ['Shininess'];
      actionPacket.max = 200.0;
      actionPacket.min = 0.0;
      actionPacket.step = 1
    } else if(act.hasClass("material-specular")) {
      actionPacket.change = shapes[objectIdx].specular;
      actionPacket.labels = ['R', 'G', 'B', 'A'];
      actionPacket.max = 1.0;
      actionPacket.min = 0.0;
      actionPacket.step = 0.01
    }
  } else {
     if(act.hasClass("light-ambient")) {
      actionPacket.change = shapes[objectIdx].ambient;
      actionPacket.labels = ['R', 'G', 'B', 'A'];
      actionPacket.max = 1.0;
      actionPacket.min = 0.0;
      actionPacket.step = 0.01
    } else if(act.hasClass("light-diffuse")) {
      actionPacket.change = shapes[objectIdx].diffuse;
      actionPacket.labels = ['R', 'G', 'B', 'A'];
      actionPacket.max = 1.0;
      actionPacket.min = 0.0;
      actionPacket.step = 0.01
    } else if(act.hasClass("light-position")) {
      actionPacket.change = shapes[objectIdx].position;
      actionPacket.labels = ['X', 'Y', 'Z'];
      actionPacket.max = 5;
      actionPacket.min = -5;
      actionPacket.step = 0.01
    } else if(act.hasClass("light-specular")) {
      actionPacket.change = shapes[objectIdx].specular;
      actionPacket.labels = ['R', 'G', 'B', 'A'];
      actionPacket.max = 1.0;
      actionPacket.min = 0.0;
      actionPacket.step = 0.01
    }
  }
  
//Execute the action object
  if(actionPacket.labels.length > 0) {
    var g1 = $("div#group1");
    g1.show();
    g1.children("label").text(actionPacket.labels[0]);
    g1.children("input").attr("min", actionPacket.min).attr("max", actionPacket.max).attr("step", actionPacket.step);
    g1.children("input").val(actionPacket.change.X);
  } else {
    $("div#group1").hide();
  }
  
  if(actionPacket.labels.length > 1) {
    var g2 = $("div#group2");
    g2.show();
    g2.children("label").text(actionPacket.labels[1]);
    g2.children("input").attr("min", actionPacket.min).attr("max", actionPacket.max).attr("step", actionPacket.step);
    g2.children("input").val(actionPacket.change.Y);
  } else {
    $("div#group2").hide();
  }
  
  if(actionPacket.labels.length > 2) {
    var g3 = $("div#group3");
    g3.show();
    g3.children("label").text(actionPacket.labels[2]);
    g3.children("input").attr("min", actionPacket.min).attr("max", actionPacket.max).attr("step", actionPacket.step);
    g3.children("input").val(actionPacket.change.Z);
  } else {
    $("div#group3").hide();
  }
  
  if(actionPacket.labels.length > 3) {
    var g4 = $("div#group4");
    g4.show();
    g4.children("label").text(actionPacket.labels[3]);
    g4.children("input").attr("min", actionPacket.min).attr("max", actionPacket.max).attr("step", actionPacket.step);
    g4.children("input").val(actionPacket.change.W);
  } else {
    $("div#group4").hide();
  }
}

function addEntry(trigger) {
  var t = $(trigger);
  
  
//Show the controls panel
  var c = $("div.panel");
  c.show();
  
  if(t.attr("data-category") == "geometry") {
    c.find("button.geometry").show().first().addClass("active");
    c.find("button.light").hide();
  } else {
    c.find("button.geometry").hide();
    c.find("button.light").show().first().addClass("active");
  }
  
//Add the object to the list
  var list = $("ul.objects");
  list.children("li.active").removeClass("active");
  list.append("<li class='active list-group-item " + t.attr("data-category") + "'>" + t.attr("data-name") + "</li>");
  
  shapes.push(new Renderer(ShapeType.CYLINDER, $("input#iterations").spinner("value")));
  associate($("li.list-group-item").length - 1, 0);
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

function bootstrapUI() {
  $("button.add").click(function() {
    $("button.list-group-item").removeClass("active");
    addEntry(this);
    render();
  });
  
  $("button.list-group-item").click(function() {
    var actIdx = $("button.list-group-item").index(this);
    var objIdx = $("li.list-group-item.active").index();
    
    if(actIdx >= 0) {
      $("button.list-group-item.active").removeClass("active");
      $("button.list-group-item").eq(actIdx).addClass("active");
      
      associate(objIdx, actIdx);
    }
  });
  
  $("input#slider1").on("input", function() {
    actionPacket.change.X = parseFloat($(this).val());
    render();
  });
  
  $("input#slider2").on("input", function() {
    actionPacket.change.Y = parseFloat($(this).val());
    render();
  });
  
  $("input#slider3").on("input", function() {
    actionPacket.change.Z = parseFloat($(this).val());
    render();
  });
  
  $("input#slider4").on("input", function() {
    actionPacket.change.W = parseFloat($(this).val());
    render();
  });
  
  $("input#iterations").spinner().spinner("option", "min", 3).focus(function() {
    $(this).blur();
  });
}