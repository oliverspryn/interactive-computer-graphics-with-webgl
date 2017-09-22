"use strict";

var Coord = function() {
  this.X = 1;
  this.Y = 1;
  this.Z = 1;
  this.W = 1;
};

var RenderMode = {
  LINEAR: 1.0,
  SPHERICAL_GENERATED: 2.0,
  SPHERICAL_EARTH: 3.0
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

var BufferCabinet = function() {
  this.VBO = gl.createBuffer();
};

var VariableCabinet = function(buffCab) {
  this.buffCab = buffCab;
  
//Buffer binding  
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffCab.VBO);
  this.vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(this.vPosition);
  
//Model and view matrices
  this.uColor = gl.getUniformLocation(program, "uColor");
  this.uModel = gl.getUniformLocation(program, "uModel");
  this.uNorm = gl.getUniformLocation(program, "uNorm");
  this.uProj = gl.getUniformLocation(program, "uProj");
  this.uView = gl.getUniformLocation(program, "uView");
  
//Texture management
  this.uRenderMode = gl.getUniformLocation(program, "uRenderMode")
  this.uTexture = [
    gl.getUniformLocation(program, "uTexture1"),
    gl.getUniformLocation(program, "uTexture2")
  ];
};

var gl = null, program = null, sphere = null, bc = null, vc = null, textures = null, mode = RenderMode.LINEAR, lightOn = true, selected = 0;

var Renderer = function(type, iterations) {
  // this.color = [ Math.random(), Math.random(), Math.random() ]; // Old
  this.color = [ 1.0, 1.0, 1.0, 1.0 ];
  this.iterations = iterations;
  this.model = mat4();
  this.vertices = [];
  
  this.R = new Coord();
  this.R.X = 0; this.R.Y = 0; this.R.Z = 0; 
  this.S = new Coord();
  this.S.X = 1; this.S.Y = 1; this.S.Z = 1;
  this.T = new Coord();
  this.T.X = 0; this.T.Y = 0; this.T.Z = 0;
  
  this.type = type;
};

Renderer.prototype.render = function(bc, vc, index, regen) {
  if (this.vertices.length == 0 || regen == true || regen !== undefined) {
    var v = this.type(this.iterations);
    this.vertices = v.vertices;
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
  gl.uniform4fv(vc.uColor, flatten(this.color));
  gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
};

Renderer.prototype.setColor = function(r, g, b) {
  this.color = [ r, g, b, 1.0 ];
}

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

//Edward Angel's algorithm
var CheckerBoard = function(imgSize, checks) {
  var c = 0;
  var patchX = 0, patchY = 0;
  this.data = new Uint8Array(4 * imgSize * imgSize);
  this.width = this.height = imgSize;
  
  for(var i = 0; i < imgSize; ++i) {
    for(var j = 0; j < imgSize; ++j) {
      patchX = Math.floor(i / (imgSize / checks));
      patchY = Math.floor(j / (imgSize / checks));
      c = ((patchX % 2) ^ (patchY % 2)) ? 255 : 0;
      
      this.data[4 * i * imgSize + 4 * j]     = c;
      this.data[4 * i * imgSize + 4 * j + 1] = c;
      this.data[4 * i * imgSize + 4 * j + 2] = c;
      this.data[4 * i * imgSize + 4 * j + 3] = 255;
    }
  }
};

var Texture = function(img, number, repeat) {
  this.img = img;
  this.texture = gl.createTexture();
  this.config(number, repeat);
};

Texture.prototype.config = function(number, repeat) {
  repeat = repeat ? repeat : gl.REPEAT;
  
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  
  if(this.img.data) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.img.width, this.img.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.img.data);
  } else {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.img);
  }
  
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, repeat);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, repeat);
  gl.activeTexture(textures[number]);
  gl.uniform1i(vc.uTexture[0], number);
};

Texture.prototype.setImage = function(img, repeat) {
  this.img = img;
  this.config(repeat);
};

window.onload = function() {
  bootstrapGL();
  bootstrapUI();
  stupidFix(new CheckerBoard(128, 64));
};

function stupidFix(tex) {
//Fixed some crazy reason why the initial image texture (checkboard, earth)
//does not get sent to the shader on the first run
  setTimeout(function() {
    for(var i = 0; i < 2; ++i) {
      new Texture(tex, 0);

      if(lightOn) {
        var img = document.getElementById('gradient');
        new Texture(img, 1);
      }

      render();
    }
  }, 7);
}

function bootstrapGL() {
//Get the canvas and WebGL context
  var canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  
//Configure the WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.1, 0.1, 0.1, 1);
  
//Compile the shaders
  program = initShaders(gl, "vertex", "fragment");
  gl.useProgram(program);
  
  textures = [
    gl.TEXTURE0,
    gl.TEXTURE1,
    gl.TEXTURE2,
    gl.TEXTURE3,
    gl.TEXTURE4,
    gl.TEXTURE5,
    gl.TEXTURE6,
    gl.TEXTURE7
  ];
  
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
  
//Generate the sphere and associated texture
  sphere = new Renderer(ShapeType.SPHERE, 75);
  sphere.setScale(3.0, 3.0, 3.0);
  
  new Texture(new CheckerBoard(128, 64), 0);

  if(lightOn) {
    var img = document.getElementById('gradient');
    new Texture(img, 1);
  }
  
//The render "loop"
  render();
}

function render() {
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniform2f(vc.uRenderMode, mode, lightOn ? 1.0 : 0.0);
  sphere.render(bc, vc, 0);
}

function bootstrapUI() {
//The checker board density slider
  //<problem>
  /*$('#checks').slider({
    max: 20,
    min: 1,
    value: 8,
    slide: function(e, ui) {
      new Texture(new CheckerBoard(128, ui.value * ui.value), 0);
      
      if(lightOn) {
        var img = document.getElementById('gradient');
        new Texture(img, 1);
      }
      
      render();
      
      $('#checkCount').text(ui.value * ui.value);
    }
  });*/
  //</problem>

//Color picker
  var color = {
    gl: {
      ALL: [ 0.0, 0.0, 0.0 ],
      R: 0.0,
      G: 0.0,
      B: 0.0
    },
    hex: {
      ALL: '#000000',
      R: '00',
      G: '00',
      B: '00'
    }
  };
  
  function colorManip() {
    var vals = [ $('#red').slider('value').toString(16), $('#green').slider('value').toString(16), $('#blue').slider('value').toString(16) ];

  //Calculate the WebGL values
    var r = vals[0];
    var g = vals[1];
    var b = vals[2];

    r = parseInt(r, 16) / 255.0;
    g = parseInt(g, 16) / 255.0;
    b = parseInt(b, 16) / 255.0;

    color.gl.ALL = [ r, g, b ];
    color.gl.R = r;
    color.gl.G = g;
    color.gl.B = b;

  //Calculate the hex values
    r = vals[0];
    g = vals[1];
    b = vals[2];

    r = (parseInt(r, 16) <= 15) ? ('0' + r) : r;
    g = (parseInt(g, 16) <= 15) ? ('0' + g) : g;
    b = (parseInt(b, 16) <= 15) ? ('0' + b) : b;

    color.hex.ALL = '#' + r + g + b;
    color.hex.R = r;
    color.hex.G = g;
    color.hex.B = b;
    
  //Set the previewer color
    $('#preview').css('background-color', color.hex.ALL)
    
  //Set the globe color
    sphere.setColor(color.gl.R, color.gl.G, color.gl.B);
    render();
  }
  
  $('#red, #green, #blue').slider({
    max: 255,
    min: 0,
    range: 'min',
    value: 255,
    change: colorManip,
    slide: colorManip
  });
  
//Application mode settings
  $('#linear').change(function() {
    if(!$(this).is(':checked')) return;
    
    mode = RenderMode.LINEAR;
    render();
  });
  
  $('#spherical').change(function() {
    if(!$(this).is(':checked')) return;
    
    mode = RenderMode.SPHERICAL_GENERATED;
    render();
  });

//The texture accordion
  $('#textures').accordion();
  
//Accordion items
  $('#checker-slider').click(function() {
    selected = 0;
    mode = RenderMode.LINEAR;
    
  //Reset the parameters
    //$('#checks').slider('value', 8);
    $('#checkCount').text(64);
    
    $('#red').slider('value', 255);
    $('#green').slider('value', 255);
    $('#blue').slider('value', 255);
    colorManip();
    
    $('#linear').prop('checked', true);
    
  //Generate the texture
    new Texture(new CheckerBoard(128, 64), 0);
    
    if(lightOn) {
      var img = document.getElementById('gradient');
      new Texture(img, 1);
    }
    
    render();
    stupidFix(new CheckerBoard(128, 64));
  });
  
  $('#earth-slider').click(function() {
    selected = 1;
    mode = RenderMode.SPHERICAL_EARTH;
  
  //Reset the parameters
    $('#red').slider('value', 255);
    $('#green').slider('value', 255);
    $('#blue').slider('value', 255);
    colorManip();
    
  //Load the earth texture
    var img1 = document.getElementById('earth');
    new Texture(img1, 0);
    
    if(lightOn) {
      var img2 = document.getElementById('gradient');
      new Texture(img2, 1);
    }
    
    render();
    stupidFix(img1);
  });
  
//The rotation sliders
  function rotate() {
    var theta = $('#theta').slider('value');
    var phi = $('#phi').slider('value');
    
    sphere.setRotation(theta, 1, 0, 0);
    sphere.setRotation(phi, 0, 1, 0);
    render();
  }
  
  $('#theta, #phi').slider({
    max: 360,
    min: 0,
    change: rotate,
    slide: rotate
  });
  
//Light toggle
  $('#light').change(function() {
    lightOn = $(this).is(':checked');
    render();
    
    if(lightOn)
      stupidFix(selected == 0 ? new CheckerBoard(128, 64) : document.getElementById('earth'));
  });
}
