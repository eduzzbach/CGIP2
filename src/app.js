import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../../libs/utils.js";
import { ortho, lookAt, flatten, mult, perspective, mat4, translate, rotateX, rotateY, rotateZ, scalem, vec4 } from "../../libs/MV.js";
import { modelView, loadMatrix, multRotationX, multRotationY, multRotationZ, multScale, multTranslation, popMatrix, pushMatrix } from "../../libs/stack.js";
import { genTomato, scene } from './scene.js';

import * as CUBE from '../../libs/objects/cube.js';
import * as SPHERE from '../../libs/objects/sphere.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as PYRAMID from '../../libs/objects/pyramid.js';


let speed = 1 / 5.0;
let animation = true;
let theta = 45;
let gamma = 35;
let zoom = 1.0;
let time = 0;
const isoDistance = 2.0;

let menu = true;

let tankPos = [0, 0, 0];
let cabinAngle = 0;
let cannonAngle = 90;
const drone_orbit = 3;
let tireRotation = 0;
const tomatoSpeed = 3;

const graphScene = scene[0];

let nodeMap = new Map();

let multiView = false;
let isOblique = false;
let isPerspective = false;

const frontV = 'front';
const sideV = 'side';
const topV = 'top';
const axoV = 'axiometric';
const obliqV = 'oblique';
const persV = 'perspective';
const orthoV = 'orthometric';
let currentView = orthoV;
let lastView = orthoV;

const floorSize = 20;
const tileSize = 0.25;
const tileHeight = 0.05;


const fView = lookAt([0, 0.6, 1], [0, 0.6, 0], [0, 1, 0]);
const sView = lookAt([1, 0.6, 0.], [0, 0.6, 0], [0, 1, 0]);
const tView = lookAt([0, 1.6, 0], [0, 0.6, 0], [0, 0, -1]);
const oView = lookAt([2, 1.2, 1], [0, 0.6, 0], [0, 1, 0]);
let aView; // Axonometric view



function setup(shaders) {
  let canvas = document.getElementById("gl-canvas");
  let aspect = canvas.width / canvas.height;

  /** @type WebGL2RenderingContext */
  let gl = setupWebGL(canvas);

  let mode = gl.TRIANGLES;

  let program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);

  let mProjection = ortho(-1 * aspect, aspect, -1, 1, 0.01, 3);
  let mView = oView;

  resize_canvas();
  window.addEventListener("resize", resize_canvas);

  function togglePerspective(baseOrtho) {
    if (isPerspective) {
      const fov = 60;
      const near = 0.1;
      const far = 20.0;
      mProjection = perspective(fov, aspect, near, far);
    } else {
      mProjection = baseOrtho;
    }
  }

  function toggleAxonometric() {
    const thetaDeg = theta * Math.PI / 180;
    const gammaDeg = gamma * Math.PI / 180;
    const eye = [
      isoDistance * Math.cos(gammaDeg) * Math.sin(thetaDeg),
      isoDistance * Math.sin(gammaDeg),
      isoDistance * Math.cos(gammaDeg) * Math.cos(thetaDeg)
    ];

    aView = lookAt(eye, [0, 0.6, 0], [0, 1, 0]);
  }

  function toggleOblique(baseOrtho) {
    const thetaDeg = theta;
    const l = 1;

    mView = lookAt([2, 1.2, 1], [0, 0.6, 0], [0, 1, 0]);;

    mProjection = mult(baseOrtho, obliqueMatrix(thetaDeg, l));

  }

  function toggleMenu() {
    const menuDiv = document.getElementById("menu");
    if (!menuDiv) return;

    menu = !menu; // flip boolean
    menuDiv.style.display = menu ? "block" : "none";
  }



  function radians(deg) {
    return deg * Math.PI / 180.0;
  }


  function getModel(node) {
    const def = [0, -1, 0];

    if (!node) return def;
    const chain = [];
    let current = node;
    while (current) {
      chain.unshift(current);
      current = current.parent;
    }

    let M = mat4();
    for (const n of chain) {
      if (n.translation) M = mult(M, translate(...n.translation));
      if (n.rotation) {
        M = mult(M, rotateZ(n.rotation[2]));
        M = mult(M, rotateY(n.rotation[1]));
        M = mult(M, rotateX(n.rotation[0]));
      }
      if (n.scale) M = mult(M, scalem(...n.scale));
    }

    return M;
  }

  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();

    if (event.deltaY < 0) {
      zoom *= 1.1;
    } else {
      zoom *= 0.9;
    }
    zoom = Math.min(Math.max(zoom, 0.1), 10.0);

  });

  window.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowUp":
        gamma += 1;
        gamma = Math.min(Math.max(gamma, 1), 89);
        updateView();

        event.preventDefault();
        break;

      case "ArrowDown":

        gamma -= 1;
        gamma = Math.min(Math.max(gamma, 1), 89);
        updateView();
        event.preventDefault();
        break;

      case "ArrowLeft":

        theta += 1;
        updateView();

        event.preventDefault();
        break;

      case "ArrowRight":

        theta -= 1;
        updateView();

        event.preventDefault();
        break;
    }
  });


  document.onkeydown = function (event) {

    const tankNode = nodeMap.get("tank");
    const cabinNode = nodeMap.get("cabin");
    const cannonNode = nodeMap.get("cannonBarrel");
    const cannonFireNode = nodeMap.get("cannonFire");
    const tomatoContainerNode = nodeMap.get("tomatoes");
    const leftWheelNames = ['lWheel1', 'lWheel2', 'lWheel3', 'lWheel4', 'lWheel5', 'lWheel6'];
    const rightWheelNames = ['rWheel1', 'rWheel2', 'rWheel3', 'rWheel4', 'rWheel5', 'rWheel6'];

    console.log("Key pressed:", event.key);
    switch (event.key) {
      case 'h':
      case 'H':
        toggleMenu();
        break;
      case '1':
        // Front view
        currentView = frontV;
        lastView = frontV;
        mView = fView;
        break;

      case '2':
        // Side view
        currentView = sideV;
        lastView = sideV;
        mView = sView;
        break;

      case '3':
        // Top view
        currentView = topV;
        lastView = topV;
        mView = tView;
        break;

      case '4':
        // Axonometric view
        currentView = axoV;
        lastView = axoV;
        isOblique = false;
        updateView();
        break;

      case '0':
        multiView = !multiView;
        break;

      case '8':
          isOblique = !isOblique;
          if (isOblique) {
            currentView = obliqV;
            lastView = obliqV;
          } else {
            currentView = axoV;
            lastView = axoV;
          }
          updateView();
        break;

      case '9':
        if (!isPerspective) {
          lastView = currentView;
          isPerspective = true;
          currentView = persV;
        } else {
          isPerspective = false;
          currentView = lastView;
        }
        updateView();
        break;

      case 'r':
      case 'R':
        const range = 2.0;
        mProjection = ortho(-aspect * zoom * range, aspect * zoom * range, -zoom * range, zoom * range, 0.01, 10);
        mView = oView;
        zoom = 1.0;
        currentView = orthoV;
        lastView = orthoV;
        break;

      case 'q':
      case 'Q':
        tankPos[0] -= 0.05 * Math.sin(-radians(cabinAngle));
        tankPos[2] += 0.05 * Math.cos(radians(cabinAngle));

        if (tankNode) {
          tankNode.translation = [...tankPos];
        }


        tireRotation += 5;

        leftWheelNames.forEach(wheelName => {
          let wheel = nodeMap.get(wheelName);
          if (wheel) {
            wheel.rotation = [0, 360 * tireRotation / 180, 0];
          }
        });

        rightWheelNames.forEach(wheelName => {
          let wheel = nodeMap.get(wheelName);
          if (wheel) {
            wheel.rotation = [0, 360 * tireRotation / 180, 0];
          }
        });

        break;

      case 'e':
      case 'E':

        tankPos[0] += 0.05 * Math.sin(-radians(cabinAngle));
        tankPos[2] -= 0.05 * Math.cos(radians(cabinAngle));

        if (tankNode) {
          tankNode.translation = [...tankPos];
        }

        tireRotation -= 5;

        leftWheelNames.forEach(wheelName => {
          let wheel = nodeMap.get(wheelName);
          if (wheel) {
            wheel.rotation = [0, 360 * tireRotation / 180, 0];
          }
        });

        rightWheelNames.forEach(wheelName => {
          let wheel = nodeMap.get(wheelName);
          if (wheel) {
            wheel.rotation = [0, 360 * tireRotation / 180, 0];
          }
        });
        break;

      case 's':
      case 'S':
        if (cannonAngle > 85){
          cannonAngle -= 5;
        }
        if (cannonNode) {
          cannonNode.rotation = [cannonAngle, 0, 0];
        }
        break;

      case 'w':
      case 'W':
        if (cannonAngle < 130){
          cannonAngle += 5;
        }
        if (cannonNode) {
          cannonNode.rotation = [cannonAngle, 0, 0];
        }
        break;

      case 'a':
      case 'A':
        if(cabinAngle < 80){
          cabinAngle += 5;
        }
        if (cabinNode) {
          cabinNode.rotation = [0, cabinAngle, 0];
        }
        break;

      case 'd':
      case 'D':
        if (cabinAngle > -80 ){
            cabinAngle -= 5;
        }
        if (cabinNode) {
          cabinNode.rotation = [0, cabinAngle, 0];
        }
        break;


      case 'z':
      case 'Z':

        let pos = [0, 0, 0];
        let dir = [0, -1, 0];
        let m = mat4();


        if (cannonFireNode && tomatoContainerNode) {

          m = getModel(cannonFireNode);

          const posTmp = mult(m, vec4(pos, 1));
          pos = [posTmp[0], posTmp[1], posTmp[2]];

          dir = mult(m, vec4(dir, 0));
          const len = Math.sqrt(dir[0] ** 2 + dir[1] ** 2 + dir[2] ** 2);
          dir = [dir[0] / len, dir[1] / len, dir[2] / len];

          tomatoContainerNode.translation = [pos[0], pos[1], pos[2]];
          const t = genTomato(pos, dir);
          tomatoContainerNode.children.push(t);
          buildNodeMap(t, tomatoContainerNode);
        }

        break;

      case ' ':
      case 'Spacebar':
        mode = (mode === gl.TRIANGLES) ? gl.LINES : gl.TRIANGLES;
        break;

    }
  }

  gl.clearColor(0.3, 0.3, 0.3, 1.0);
  gl.enable(gl.DEPTH_TEST);

  CUBE.init(gl);
  CYLINDER.init(gl);
  SPHERE.init(gl);
  PYRAMID.init(gl);


  function buildNodeMap(node, parent = null) {
    node.parent = parent;
    nodeMap.set(node.name, node);
    if (node.children) {
      node.children.forEach(c => buildNodeMap(c, node));
    }
  }

  buildNodeMap(graphScene);

  function drawNode(gl, program, node, mode) {
    pushMatrix();

    if (node.translation) multTranslation(node.translation);
    if (node.rotation) {
      multRotationZ(node.rotation[2]);
      multRotationY(node.rotation[1]);
      multRotationX(node.rotation[0]);
    }
    if (node.scale) multScale(node.scale);

    if (node.primitive) {
      const uColor = gl.getUniformLocation(program, "u_color");
      gl.uniform4fv(uColor, node.color);
      uploadModelView();
      node.primitive.draw(gl, program, mode);
      if (node.lines) {
        gl.uniform4fv(uColor, [0, 0, 0, 1]);
        uploadModelView();
        node.primitive.draw(gl, program, gl.LINES);
      }
    }

    if (node.children) for (const child of node.children){
      drawNode(gl, program, child, mode);
    }
    popMatrix();
  }

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

  function obliqueMatrix(thetaDeg, l) {

    const thetaRad = radians(thetaDeg);

    return [
      [1, 0, -l*Math.cos(thetaRad), 0],
      [0, 1, -l*Math.sin(thetaRad), 0],
      [0, 0, 0, 0],
      [0, 0, 0, 1]
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
        gl.uniform4fv(uColor, [0, 0, 0, 1]);
        uploadModelView();
        CUBE.draw(gl, program, gl.LINES);
        popMatrix();
      }
    }
  }

  function spinDrone() {
    const droneOrbit = nodeMap.get("drone");
    if (droneOrbit) {
      droneOrbit.rotation = [0, 360 * time / (drone_orbit * 180), 0];
    }
  }


  function tomatoes() {

    const tomatoContainer = nodeMap.get("tomatoes");

    if (tomatoContainer.children) {

      for (const t of tomatoContainer.children) {
        t.translation[0] += tomatoSpeed * t.vel[0];
        t.translation[1] += tomatoSpeed * t.vel[1];
        t.translation[2] += tomatoSpeed * t.vel[2];

        t.vel[1] -= 0.01; //GRAVITY

      }
    }
  }

  function updateView(baseOrtho) {

    switch (currentView) {
      case frontV:
      case sideV:
      case topV:
        mProjection = baseOrtho;
        break;

      case axoV:
        toggleAxonometric();
        mView = aView;
        mProjection = baseOrtho;
        break;

      case obliqV:

        // apply oblique shear to base ortho projection
        toggleOblique(baseOrtho);
        break;

      case persV:
        togglePerspective(baseOrtho);

        break;
      case orthoV:
        mView = oView;
        mProjection = baseOrtho;
      default:
        break;
    }
  }

  function render() {
    if (animation) time += speed;
    window.requestAnimationFrame(render);
    toggleAxonometric();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    const range = isOblique ? 3.0 : 2.0;
    const baseOrtho = ortho(-aspect * zoom * range, aspect * zoom * range, -zoom * range, zoom * range, 0.01, 10);


    if (!multiView) {
      updateView(baseOrtho);

      uploadProjection(mProjection);
      loadMatrix(mView);
      gl.viewport(0, 0, canvas.width, canvas.height);
      floor(floorSize, tileSize, tileHeight);
      spinDrone();
      tomatoes();
      drawNode(gl, program, graphScene, mode);
    }
    else { //when multiview is true

      const halfWidth = canvas.width / 2;
      const halfHeight = canvas.height / 2;

      // Helper to render one view
      function drawView(viewMatrix, x, y, w, h) {
        mProjection = baseOrtho;
        uploadProjection(mProjection);
        loadMatrix(viewMatrix);
        gl.viewport(x, y, w, h);
        floor(floorSize, tileSize, tileHeight);
        spinDrone();
        tomatoes();
        drawNode(gl, program, graphScene, mode);

      }

      // Define the 4 camera views:
      const views = {
        front: fView,
        right: sView,
        top: tView,
        axon: aView,
      };

      if (multiView) {
        // Render each in its quadrant
        drawView(views.front, 0, halfHeight, halfWidth, halfHeight);         // top-left
        drawView(views.right, halfWidth, halfHeight, halfWidth, halfHeight); // top-right
        drawView(views.top, 0, 0, halfWidth, halfHeight);                    // bottom-left
        drawView(views.axon, halfWidth, 0, halfWidth, halfHeight);           // bottom-right
      }
    }


  }
}

const urls = ["shader.vert", "shader.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))