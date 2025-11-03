import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../../libs/utils.js";
import { ortho, lookAt, flatten } from "../../libs/MV.js";
import { modelView, loadMatrix, multRotationX, multRotationY, multRotationZ, multScale, multTranslation, popMatrix, pushMatrix } from "../../libs/stack.js";

import * as CUBE from '../../libs/objects/cube.js';
import * as SPHERE from '../../libs/objects/sphere.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';

let time = 0;
let speed = 1 / 5.0;
let animation = true;

const tireSize = 0.2;
const tireHeight = 0.1;
const tireColor = [0.0, 0.0, 0.0, 1.0];
const tireSpacing = 0.2;
const numTiresPerSide = 6;

const drone_orbit = 50;

const colorDgreen = [0.1, 0.3, 0.1, 1.0];
const colorLgreen = [0.1, 0.5, 0.1, 1.0];
const colorYgreen = [0.3, 0.3, 0.1, 1.0];
const colorGwhite = [0.0, 0.0, 0.0, 0.5];
const colorLblue = [0.0, 0.0, 1.0, 0.5];
const colorDblue = [0.0, 0.0, 0.5, 1.0];


function setup(shaders) {
  let canvas = document.getElementById("gl-canvas");
  let aspect = canvas.width / canvas.height;

  /** @type WebGL2RenderingContext */
  let gl = setupWebGL(canvas);

  // Drawing mode (gl.LINES or gl.TRIANGLES)
  let mode = gl.TRIANGLES;

  let program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);

  let mProjection = ortho(-1 * aspect, aspect, -1, 1, 0.01, 3);
  let mView = lookAt([2, 1.2, 1], [0, 0.6, 0], [0, 1, 0]);

  let zoom = 1.0;

  /** Model parameters */
  let ag = 0;
  let rg = 0;
  let rb = 0;
  let rc = 0;

  resize_canvas();
  window.addEventListener("resize", resize_canvas);

  //unapdated
  document.onkeydown = function (event) {
    switch (event.key) {
      case '1':
        // Front view
        mView = lookAt([0, 0.6, 1], [0, 0.6, 0], [0, 1, 0]);
        break;
      case '2':
        // Top view
        mView = lookAt([0, 1.6, 0], [0, 0.6, 0], [0, 0, -1]);
        break;
      case '3':
        // Right view
        mView = lookAt([1, 0.6, 0.], [0, 0.6, 0], [0, 1, 0]);
        break;
      case '4':
        mView = lookAt([2, 1.2, 1], [0, 0.6, 0], [0, 1, 0]);
        break;
      case '9':
        mode = gl.LINES;
        break;
      case '0':
        mode = gl.TRIANGLES;
        break;
      case 'p':
        ag = Math.min(0.050, ag + 0.005);
        break;
      case 'o':
        ag = Math.max(0, ag - 0.005);
        break;
      case 'q':
        rg += 1;
        break;
      case 'e':
        rg -= 1;
        break;
      case 'w':
        rc = Math.min(120, rc + 1);
        break;
      case 's':
        rc = Math.max(-120, rc - 1);
        break;
      case 'a':
        rb -= 1;
        break;
      case 'd':
        rb += 1;
        break;
      case '+':
        zoom /= 1.1;
        break;
      case '-':
        zoom *= 1.1;
        break;
    }
  }

  gl.clearColor(0.3, 0.3, 0.3, 1.0);
  gl.enable(gl.DEPTH_TEST);   // Enables Z-buffer depth test

  CUBE.init(gl);
  CYLINDER.init(gl);
  SPHERE.init(gl);

  window.requestAnimationFrame(render);


  function resize_canvas(event) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    aspect = canvas.width / canvas.height;

    gl.viewport(0, 0, canvas.width, canvas.height);
    mProjection = ortho(-aspect * zoom, aspect * zoom, -zoom, zoom, 0.1, 5);
  }

  function uploadProjection(mProjection) {
    uploadMatrix("u_projection", mProjection);
  }

  function uploadModelView() {
    uploadMatrix("u_model_view", modelView());
  }

  function uploadMatrix(name, m) {
    gl.uniformMatrix4fv(gl.getUniformLocation(program, name), false, flatten(m));
  }

  function floor() {
    const size = 20;
    const tileSize = 0.25;
    const height = 0.05;

    for (let i = -size / 2; i < size / 2; i++) {
      for (let j = -size / 2; j < size / 2; j++) {
        pushMatrix();

        multTranslation([i * tileSize, -height / 2, j * tileSize]);
        multScale([tileSize, height, tileSize]);

        const isWhite = (i + j) % 2 === 0;
        const color = isWhite ? [1.0, 1.0, 1.0, 1.0] : [0.5, 0.5, 0.5, 1.0];
        const uColor = gl.getUniformLocation(program, "u_color");
        gl.uniform4fv(uColor, color);


        uploadModelView();
        CUBE.draw(gl, program, mode);
        popMatrix();
      }
    }
  }

  //makes the tires
  function sideTires(tireSize, tireHeight, color, spacing, numTires, yPos, zPos) {
    const uColor = gl.getUniformLocation(program, "u_color");

    for (let i = 0; i < numTires; i++) {
      pushMatrix();
      multRotationZ(90);
      const xPos = (i - (numTires - 1) / 2) * spacing;
      multRotationY(90);
      multTranslation([xPos, yPos, zPos]);

      multScale([tireSize, tireHeight / 2, tireSize]);


      gl.uniform4fv(uColor, color);
      uploadModelView();
      CYLINDER.draw(gl, program, mode);
      popMatrix();

    }
  }

  //body of the drone with the propellers and cannon
  function drone_body(uColor) {
    gl.uniform4fv(uColor, colorGwhite);
    uploadModelView();
    SPHERE.draw(gl, program, mode);

    pushMatrix();
    multTranslation([0.0, 0.0, 0.3]);
    multRotationX(90);
    multScale([0.2, 0.9, 0.2]);
    gl.uniform4fv(uColor, colorDblue);
    uploadModelView();
    CYLINDER.draw(gl, program, mode);
    popMatrix();

    const rotorUPositions = [
      [0.4, 0.3, 0.4],
      [-0.4, 0.3, 0.4],
      [0.4, 0.3, -0.4],
      [-0.4, 0.3, -0.4]
    ];
    const rotorDPositions = [
      [-0.4, -0.3, -0.4],
      [0.4, -0.3, -0.4],
      [-0.4, -0.3, 0.4],
      [0.4, -0.3, 0.4]
    ];
    for (const [x, y, z] of rotorUPositions) {
      pushMatrix();
      multTranslation([x, y, z]);
      multScale([0.5, 0.1, 0.5]);
      gl.uniform4fv(uColor, colorLblue);
      uploadModelView();
      CYLINDER.draw(gl, program, mode);
      popMatrix();
    }

    for (const [x, y, z] of rotorDPositions) {
      pushMatrix();
      multTranslation([x, y, z]);
      multScale([0.5, 0.1, 0.5]);
      gl.uniform4fv(uColor, colorLblue);
      uploadModelView();
      CYLINDER.draw(gl, program, mode);
      popMatrix();
    }


  }

  // makes the rotation of the drone's body
  function drone() {
    const uColor = gl.getUniformLocation(program, "u_color");
    pushMatrix();
    multRotationY(360 * time / drone_orbit);
    multTranslation([0.5, 0.8, 0.5]);
    multRotationY(-360 * time / drone_orbit); //stops it fromm rotating over its axis
    multScale([0.2, 0.2, 0.2]);
    drone_body(uColor);
    popMatrix();
  }

  // makes the tank's cannon 
  function tankCannon() {
    const uColor = gl.getUniformLocation(program, "u_color");
    pushMatrix();
    multTranslation([1.0, 0.8, 1.0]);
    multRotationX(90);
    multScale([0.1, 0.5, 0.1]);
    gl.uniform4fv(uColor, colorYgreen);
    uploadModelView();
    CYLINDER.draw(gl, program, mode);
    popMatrix();
  }

  // makes the top head of the tank
  function tankTop() {
    const uColor = gl.getUniformLocation(program, "u_color");

    pushMatrix();
    multScale([0.5, 0.5, 0.5]);
    multTranslation([0, 0.8, 0]);
    gl.uniform4fv(uColor, colorDgreen);
    uploadModelView();
    SPHERE.draw(gl, program, mode);
    popMatrix();
  }

  // makes the tank's base
  function tankBase() {
    const uColor = gl.getUniformLocation(program, "u_color");

    pushMatrix();
    multTranslation([0, 0.07, 0]);
    multScale([1, 0.1, 1.0]);
    gl.uniform4fv(uColor, colorDgreen);
    uploadModelView();
    CUBE.draw(gl, program, mode);
    popMatrix();

    pushMatrix();
    multTranslation([0, 0.07, 0]);
    multScale([1.0, 0.15, 1.2]);
    multTranslation([0, 1.0, 0]);
    gl.uniform4fv(uColor, colorYgreen);
    uploadModelView();
    CUBE.draw(gl, program, mode);
    popMatrix();

    pushMatrix();
    multRotationY(45);
    multScale([1, 0.2, 1.0]);
    multTranslation([0, 1.5, 0]);
    gl.uniform4fv(uColor, colorLgreen);
    uploadModelView();
    CYLINDER.draw(gl, program, mode);
    popMatrix();
  }

  //mixes the whole tank's body
  function tank() {
    sideTires(tireSize, tireHeight, tireColor, tireSpacing, numTiresPerSide, 0.55, 0.1);
    sideTires(tireSize, tireHeight, tireColor, tireSpacing, numTiresPerSide, -0.55, 0.1);
    tankBase();
    tankTop();
    tankCannon();
    drone();
  }

  function render() {
    if (animation) time += speed;
    window.requestAnimationFrame(render);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    // Send the mProjection matrix to the GLSL program
    const range = 2.0;
    mProjection = ortho(-aspect * zoom * range, aspect * zoom * range, -zoom * range, zoom * range, 0.01, 10);
    uploadProjection(mProjection);

    // Load the ModelView matrix with the Worl to Camera (View) matrix
    loadMatrix(mView);
    floor();
    tank();
  }
}

const urls = ["shader.vert", "shader.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))