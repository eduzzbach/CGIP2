import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../../libs/utils.js";
import { ortho, lookAt, flatten } from "../../libs/MV.js";
import { modelView, loadMatrix, multRotationX, multRotationY, multRotationZ, multScale, multTranslation, popMatrix, pushMatrix } from "../../libs/stack.js";

import * as CUBE from '../../libs/objects/cube.js';
import * as SPHERE from '../../libs/objects/sphere.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';

let time = 0;
let speed = 1 / 5.0;
let animation = true;
let tankPos = [0.0, 0.0, 0.0];
let cabinAngle = 0;
let cannonAngle = 0;
let tireRotation = 0;
let multiView = false;
let theta = 0;
let gamma = 0;
let zoom = 1.0;



const floorSize = 20;
const tileSize = 0.25;
const tileHeight = 0.05;



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

const fView = lookAt([0, 0.6, 1], [0, 0.6, 0], [0, 1, 0]);
const sView = lookAt([1, 0.6, 0.], [0, 0.6, 0], [0, 1, 0]);
const tView = lookAt([0, 1.6, 0], [0, 0.6, 0], [0, 0, -1]);
const oView = lookAt([2, 1.2, 1], [0, 0.6, 0], [0, 1, 0]);



function setup(shaders) {
  let canvas = document.getElementById("gl-canvas");
  let aspect = canvas.width / canvas.height;

  /** @type WebGL2RenderingContext */
  let gl = setupWebGL(canvas);

  // Drawing mode (gl.LINES or gl.TRIANGLES)
  let mode = gl.TRIANGLES;

  let program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);

  let mProjection = ortho(-1 * aspect, aspect, -1, 1, 0.01, 3);
  let mView = oView;

  resize_canvas();
  window.addEventListener("resize", resize_canvas);

  function radians(deg) {
    return deg * Math.PI / 180.0;
  }

  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();

    if (event.deltaY < 0) {
      zoom *= 1.1;
    } else {
      zoom *= 0.9;
    }
    zoom = Math.min(Math.max(zoom, 0.1), 10.0);

    updateZoomDisplay();
  });

  //unapdated
  document.onkeydown = function (event) {
    switch (event.key) {
      case '1':
        // Front view
        mView = fView;
        break;

      case '2':
        // Right view
        mView = sView;
        break;

      case '3':
        // Top view
        mView = tView;
        break;

      case '4':
        // Axometric view(not done)
        const isoDistance = 2.0;
        const angle = Math.PI / 4; // 45°
        const heightAngle = Math.atan(Math.tan(radians(35.26))); // 35.26° elevation
        const eye = [
          isoDistance * Math.cos(angle),
          isoDistance * Math.sin(heightAngle),
          isoDistance * Math.sin(angle)
        ];

        mView = lookAt(eye, [0, 0.6, 0], [0, 1, 0]);
        break;

      case '0':
        //toggle multiple views or single view
        multiView = !multiView;

        break;

      case '8':
        //toggle between axonometric view and oblique view when view 4
        const obliqueAngle = 45;
        const depthAngle = 63.4;
        const oblique = obliqueMatrix(obliqueAngle, depthAngle);
        //mView = fView;
        mView = mult(ortho(- aspect * zoom, aspect * zoom, -zoom, zoom, 0.1, 5), oblique);
        break;

      case '9':
        // toggle between parallel vs perspective views

        break;

      //case 'arrow keys':
      // adjust axonometric/oblique parameters
      case 'ArrowUp':
        gamma += 0.5;
        break;
      case 'ArrowDown':
        gamma -= 0.5;
        break;

      case 'ArrowLeft':
        theta += 0.5;
        break;

      case 'ArrowRight':
        theta -= 0.5;
        break;

      case 'r':
      case 'R':
        //reset projection to the initial view and zoom
        const range = 2.0;
        mProjection = ortho(-aspect * zoom * range, aspect * zoom * range, -zoom * range, zoom * range, 0.01, 10);
        mView = oView;
        zoom = 1.0;
        break;

      case 'q':
      case 'Q':
        //move forwards
        tankPos[0] -= 0.05 * Math.sin(-radians(cabinAngle));
        tankPos[2] += 0.05 * Math.cos(radians(cabinAngle));
        tireRotation += 5;
        break;

      case 'e':
      case 'E':
        //move backwards (ele vira de acordo com a direção que o canhão aponta
        //agora não se eles querem que as rodas tambêm rodem)
        tankPos[0] += 0.05 * Math.sin(-radians(cabinAngle));
        tankPos[2] -= 0.05 * Math.cos(radians(cabinAngle));
        tireRotation -= 5;
        break;

      case 'w':
      case 'W':
        //raise cannon
        if (cannonAngle > -75)
          cannonAngle -= 5;
        break;

      case 's':
      case 'S':
        //lower cannon
        if (cannonAngle < 10)
          cannonAngle += 5;
        break;

      case 'a':
      case 'A':
        //rotate cabin counter clockwise
        cabinAngle += 5;
        break;

      case 'd':
      case 'D':
        //rotate cabin clockwise
        cabinAngle -= 5;
        break;

      case 'z':
      case 'Z':
        //shoot tomato
        break;

      case ' ':
      case 'Spacebar':
        // changes between wireframe and solid
        mode = (mode === gl.TRIANGLES) ? gl.LINES : gl.TRIANGLES;
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

  function obliqueMatrix(thetaDeg = 45, gammaDeg = 45) {
    theta = thetaDeg * Math.PI / 180.0;
    gamma = gammaDeg * Math.PI / 180.0;

    // Standard oblique shear matrix
    return [
      1, 0, Math.cos(theta) / Math.tan(gamma), 0,
      0, 1, Math.sin(theta) / Math.tan(gamma), 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }

  function uploadModelView() {
    uploadMatrix("u_model_view", modelView());
  }

  function uploadMatrix(name, m) {
    gl.uniformMatrix4fv(gl.getUniformLocation(program, name), false, flatten(m));
  }

  function floor(floorSize, tileSize, tileHeight) {

    for (let i = -floorSize / 2; i < floorSize / 2; i++) {
      for (let j = -floorSize / 2; j < floorSize / 2; j++) {
        pushMatrix();

        multTranslation([i * tileSize, -tileHeight / 2, j * tileSize]);
        multScale([tileSize, tileHeight, tileSize]);

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
      multRotationY(tireRotation);

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
    multRotationY(cabinAngle);
    pushMatrix();
    multTranslation([0.0, 0.0, 0.3]);
    multRotationX(cannonAngle);
    multRotationX(90);
    multScale([0.2, 0.85, 0.2]);
    gl.uniform4fv(uColor, colorDblue);
    uploadModelView();
    CYLINDER.draw(gl, program, mode);
    popMatrix();
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
    multTranslation([0.0, 0.5, 0.2]);
    multRotationZ(90);
    multScale([0.1, 0.1, 0.1]);
    gl.uniform4fv(uColor, colorYgreen);
    uploadModelView();
    CYLINDER.draw(gl, program, mode);
    popMatrix();
    pushMatrix();
    pushMatrix();
    multTranslation([0.0, 0.5, 0.2]);
    multRotationX(cannonAngle);
    multRotationX(90);
    multScale([0.05, 0.7, 0.05]);
    gl.uniform4fv(uColor, colorYgreen);
    uploadModelView();
    CYLINDER.draw(gl, program, mode);
    popMatrix();
    popMatrix();
  }

  // makes the cabin of the tank
  function tankCabin() {
    const uColor = gl.getUniformLocation(program, "u_color");
    pushMatrix();
    multRotationY(cabinAngle);
    pushMatrix();
    multScale([0.5, 0.5, 0.5]);
    multTranslation([0, 0.8, 0]);
    gl.uniform4fv(uColor, colorDgreen);
    uploadModelView();
    SPHERE.draw(gl, program, mode);
    popMatrix();
    tankCannon();
    popMatrix();
  }

  // makes the tank's base
  function tankBase() {
    const uColor = gl.getUniformLocation(program, "u_color");

    pushMatrix();
    multTranslation([0, 0.1, 0]);
    multScale([0.8, 0.1, 1.0]);
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
    multRotationY(90);
    multScale([1.1, 0.2, 1.0]);
    multTranslation([0, 1.5, 0]);
    gl.uniform4fv(uColor, colorLgreen);
    uploadModelView();
    CYLINDER.draw(gl, program, mode);
    popMatrix();
  }

  //mixes the whole tank's body
  function tank() {
    multTranslation(tankPos);
    sideTires(tireSize, tireHeight, tireColor, tireSpacing, numTiresPerSide, 0.53, 0.1);
    sideTires(tireSize, tireHeight, tireColor, tireSpacing, numTiresPerSide, -0.53, 0.1);
    tankBase();
    tankCabin();
    drone();
  }

  function render() {
    if (animation) time += speed;
    window.requestAnimationFrame(render);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    const range = 2.0;

    if (!multiView) {
      mProjection = ortho(-aspect * zoom * range, aspect * zoom * range, -zoom * range, zoom * range, 0.01, 10);
      uploadProjection(mProjection);
      loadMatrix(mView);

      gl.viewport(0, 0, canvas.width, canvas.height);
      floor(floorSize, tileSize, tileHeight);
      tank();
    } else {

      const halfWidth = canvas.width / 2;
      const halfHeight = canvas.height / 2;

      // Helper to render one view
      function drawView(viewMatrix, x, y, w, h) {
        gl.viewport(x, y, w, h);
        mProjection = ortho(-aspect * zoom * range, aspect * zoom * range, -zoom * range, zoom * range, 0.01, 10);
        uploadProjection(mProjection);
        loadMatrix(viewMatrix);
        floor(floorSize, tileSize, tileHeight);
        tank();
      }

      // Define the 4 camera views:
      const views = {
        front: fView,
        right: sView,
        top: tView,
        axon: lookAt(
          [2 * Math.cos(Math.PI / 4), 2 * Math.sin(radians(35.26)), 2 * Math.sin(Math.PI / 4)],
          [0, 0.6, 0],
          [0, 1, 0]
        ),
      };

      // Render each in its quadrant
      drawView(views.front, 0, halfHeight, halfWidth, halfHeight);         // top-left
      drawView(views.right, halfWidth, halfHeight, halfWidth, halfHeight); // top-right
      drawView(views.top, 0, 0, halfWidth, halfHeight);                    // bottom-left
      drawView(views.axon, halfWidth, 0, halfWidth, halfHeight);           // bottom-right
    }
  }
}

const urls = ["shader.vert", "shader.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))