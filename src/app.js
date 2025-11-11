import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../../libs/utils.js";
import { ortho, lookAt, flatten, mult, perspective, mat4, translate, rotateX, rotateY, rotateZ, scalem, vec4 } from "../../libs/MV.js";
import { modelView, loadMatrix, multRotationX, multRotationY, multRotationZ, multScale, multTranslation, popMatrix, pushMatrix } from "../../libs/stack.js";
import { scene } from './scene.js';

import * as CUBE from '../../libs/objects/cube.js';
import * as SPHERE from '../../libs/objects/sphere.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as PYRAMID from '../../libs/objects/pyramid.js';


let speed = 1 / 5.0;
let animation = true;
let theta = 45;
let gamma = 35;
let zoom = 1.0;
let projectiles = [];
let time = 0;
const isoDistance = 2.0;

let menu = true;

let tankPos = [0, 0, 0];
let cabinAngle = 0;
let cannonAngle = 90;
const drone_orbit = 3;
let tireRotation = 0;
const projectile_power = 5;

const graphScene = scene[0];

let nodeMap = new Map();

//projection booleans
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

//floor constants
const floorSize = 20;
const tileSize = 0.25;
const tileHeight = 0.05;


//types of views
const fView = lookAt([0, 0.6, 1], [0, 0.6, 0], [0, 1, 0]); // front view
const sView = lookAt([1, 0.6, 0.], [0, 0.6, 0], [0, 1, 0]); // side view
const tView = lookAt([0, 1.6, 0], [0, 0.6, 0], [0, 0, -1]); // top view
const oView = lookAt([2, 1.2, 1], [0, 0.6, 0], [0, 1, 0]); // original view
let aView; // Axonometric view



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

  // renders the perspective view
  function togglePerspective(baseOrtho) {
    if (isPerspective) {
      const fov = 60; // field of view in degrees
      const near = 0.1;
      const far = 20.0;
      mProjection = perspective(fov, aspect, near, far);
    } else {
      mProjection = baseOrtho;
    }
  }

  // renders the Axonomeric view
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

  //renders the Oblique view
  function toggleOblique(baseOrtho) {
    const thetaDeg = theta * Math.PI / 180;
    const gammaDeg = gamma * Math.PI / 180;

    mView = lookAt([2, 1.2, 1], [0, 0.6, 0], [0, 1, 0]);;

    mProjection = mult(baseOrtho, obliqueMatrix(thetaDeg, gammaDeg));

  }


  function toggleMenu() {
    const menuDiv = document.getElementById("menu");
    if (!menuDiv) return;

    menu = !menu; // flip boolean
    menuDiv.style.display = menu ? "block" : "none";
  }



  //convert degrees in radians
  function radians(deg) {
    return deg * Math.PI / 180.0;
  }

  function getWorldPosition(node) {
    if (!node) return [0, 0, 0];

    // Gather transforms from root → node
    const chain = [];
    let current = node;
    while (current) {
      chain.unshift(current);
      current = current.parent;
    }

    // Build transform matrix
    let M = mat4();
    for (const n of chain) {
      if (n.translation) M = mult(M, translate(...n.translation));
      if (n.rotation) {
        M = mult(M, rotateX(n.rotation[0]));
        M = mult(M, rotateY(n.rotation[1]));
        M = mult(M, rotateZ(n.rotation[2]));
      }
      if (n.scale) M = mult(M, scalem(...n.scale));
    }

    // Apply to origin
    const p = mult(M, vec4(0, 0, 0, 1));
    return [p[0], p[1], p[2]];
  }

  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();

    if (event.deltaY < 0) {
      zoom *= 1.1;
    } else {
      zoom *= 0.9;
    }
    zoom = Math.min(Math.max(zoom, 0.1), 10.0);

    // updateZoomDisplay();
  });
  //
  //case 'arrow keys':
  // adjust axonometric/oblique parameters



  window.addEventListener("keydown", function (event) {

    const tankNode = nodeMap.get("tank");
    const cabinNode = nodeMap.get("cabin");
    const cannonNode = nodeMap.get("cannonBarrel");
    const cannonTipNode = nodeMap.get("cannonTipNode");
    const leftWheelNames = ['lWheel1', 'lWheel2', 'lWheel3', 'lWheel4', 'lWheel5', 'lWheel6'];
    const rightWheelNames = ['rWheel1', 'rWheel2', 'rWheel3', 'rWheel4', 'rWheel5', 'rWheel6'];
    console.log("Key pressed:", event.key);
    switch (event.key) {

      case 'h':
      case 'H':
        toggleMenu();
        break;

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

      case '1':
        // Front view
        currentView = frontV;
        lastView = frontV;
        mView = fView;
        break;

      case '2':
        // Right view
        currentView = sideV;
        lastView = sideV;
        mView = sView;
        break;

      case '3':
        // Top view
        currentView = topV;
        lastView = sideV;
        mView = tView;
        break;

      case '4': //case '8' alters the type of view in this case
        // Axonometric view
        currentView = axoV;
        lastView = axoV;
        isOblique = false;
        updateView();
        break;

      case '0':
        //toggle multiple views or single view
        multiView = !multiView;
        break;

      case '8':
        //toggle between axonometric view and oblique view when view 4
        if (currentView === axoV || currentView === obliqV) { // only toggle from axo/oblique
          isOblique = !isOblique;
          if (isOblique) {
            currentView = obliqV;
            lastView = obliqV;
          } else {
            currentView = axoV;
            lastView = axoV;
          }
          updateView();
        }
        break;
      case '9':
        // toggle between parallel vs perspective views
        if (!isPerspective) {
          // store the current view to return to later
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
        //reset projection to the initial view and zoom
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
        //raise cannon
        if (cannonAngle > 80)
          cannonAngle -= 5;

        if (cannonNode) {
          cannonNode.rotation = [cannonAngle, 0, 0];
        }


        break;

      case 'w':
      case 'W':
        //lower cannon
        if (cannonAngle < 130)
          cannonAngle += 5;
        if (cannonNode) {
          cannonNode.rotation = [cannonAngle, 0, 0];
        }

        break;

      case 'a':
      case 'A':
        //rotate cabin counter clockwise
        cabinAngle += 5;

        if (cabinNode) {
          cabinNode.rotation = [0, cabinAngle, 0];
        }
        break;

      case 'd':
      case 'D':
        //rotate cabin clockwise
        cabinAngle -= 5;
        if (cabinNode) {
          cabinNode.rotation = [0, cabinAngle, 0];
        }
        break;


      //quando mudas as coordenadas da cabine ou do canhão, os tomatos deixam de sair de dentro do canhão
      //do código que faz cenas aqui é procurar nas linhas: 533 a 542, 603 a 611 
      case 'z':
      case 'Z':

        let pos = [0, 0, 0];
        const dirX = Math.sin(radians(-cabinAngle)) * Math.cos(radians(cannonAngle));
        const dirY = -Math.sin(radians(cannonAngle));
        const dirZ = Math.cos(radians(cabinAngle)) * Math.cos(radians(cannonAngle));

        const cannonTipNode = nodeMap.get("cannonTip");
        const tomatoContainer = nodeMap.get("tomatoes");

        if (cannonTipNode && tomatoContainer) {
          pos = getWorldPosition(cannonTipNode);
          tomatoContainer.translation = [pos[0], pos[1], pos[2] + 0.4];
          const newTomato = {
            translation: [...pos],
            vel: [0.2 * dirX, 0.2 * dirY, 0.2 * dirZ],
            color: [1.0, 0.0, 0.0, 1.0],
            time: 0,
            primitive: SPHERE
          };

          // attach to scene graph
          tomatoContainer.children.push(newTomato);
          console.log("addded toamto")
          buildNodeMap(newTomato, tomatoContainer);
        }

        break;

      case ' ':
      case 'Spacebar':
        // changes between wireframe and solid
        mode = (mode === gl.TRIANGLES) ? gl.LINES : gl.TRIANGLES;
        break;

    }
  });

  gl.clearColor(0.3, 0.3, 0.3, 1.0);
  gl.enable(gl.DEPTH_TEST);   // Enables Z-buffer depth test

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

    // apply transformations in fixed order
    if (node.translation) multTranslation(node.translation);
    if (node.rotation) {
      multRotationZ(node.rotation[2]);  // Z first
      multRotationY(node.rotation[1]);  // Y second  
      multRotationX(node.rotation[0]);
    }  // X l
    if (node.scale) multScale(node.scale);

    // draw if leaf
    if (node.primitive) {
      const uColor = gl.getUniformLocation(program, "u_color");
      gl.uniform4fv(uColor, node.color);
      uploadModelView();
      node.primitive.draw(gl, program, mode);
      if (node.lines) {
        gl.uniform4fv(uColor, [0, 0, 0, 1]); // Black lines
        uploadModelView(); // Re-upload same matrix
        node.primitive.draw(gl, program, gl.LINES);
      }

    }


    // recurse
    if (node.children) for (const child of node.children)
      drawNode(gl, program, child, mode);

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

  //matrix used for oblique view
  function obliqueMatrix(thetaDeg, gammaDeg) {

    const cotGamma = 1 / Math.tan(gammaDeg);
    const l = Math.cos(thetaDeg) * cotGamma;
    const m = Math.sin(thetaDeg) * cotGamma;

    // Standard oblique shear matrix
    return [
      [1, 0, l, 0],
      [0, 1, m, 0],
      [0, 0, 1, 0],
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
        t.translation[0] += projectile_power * t.vel[0];
        t.translation[1] += projectile_power * t.vel[1];
        t.translation[2] += projectile_power * t.vel[2];
        // Add gravity
        t.vel[1] -= 0.01; // g

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
    //este animation é usado para a rotação do drone
    if (animation) time += speed;
    window.requestAnimationFrame(render);
    toggleAxonometric(); // activates axonometric view setup(doesn't set mView to axonometric view)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    // é preciso mudar um bocado o range para a proj. Oblíqua ver-se bem
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