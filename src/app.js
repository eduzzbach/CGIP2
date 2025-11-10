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
let gamma = 63.4;
let zoom = 1.0;
let projectiles = [];
let time = 0;

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

//floor constants
const floorSize = 20;
const tileSize = 0.25;
const tileHeight = 0.05;


//types of views
const fView = lookAt([0, 0.6, 1], [0, 0.6, 0], [0, 1, 0]); // front view
const sView = lookAt([1, 0.6, 0.], [0, 0.6, 0], [0, 1, 0]); // side view
const tView = lookAt([0, 1.6, 0], [0, 0.6, 0], [0, 0, -1]); // top view
const oView = lookAt([2, 1.2, 1], [0, 0.6, 0], [0, 1, 0]); // original view



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

  // renders the axometric view
  function toggleAxometric() {
    const isoDistance = 2.0;
    const angle = Math.PI / 4; // 45°
    const heightAngle = Math.atan(Math.tan(radians(35.26))); // 35.26° elevation
    const eye = [
      isoDistance * Math.cos(angle),
      isoDistance * Math.sin(heightAngle),
      isoDistance * Math.sin(angle)
    ];

    mView = lookAt(eye, [0, 0.6, 0], [0, 1, 0]);
  }


  //convert degrees in radians
  function radians(deg) {
    return deg * Math.PI / 180.0;
  }

  function getWD(node){
    const def = [0, -1, 0];
    
    if(!node) return def;
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

    const dir = mult(M, vec4(def, 0)); // w=0 means no translation
    const len = Math.sqrt(dir[0]**2 + dir[1]**2 + dir[2]**2);
    return [dir[0]/len, dir[1]/len, dir[2]/len];
  }

  function getWP(node) {
    const def = [0,0,0];
    if (!node) return def;

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
        M = mult(M, rotateZ(n.rotation[2]));
        M = mult(M, rotateY(n.rotation[1]));
        M = mult(M, rotateX(n.rotation[0]));
      }
      if (n.scale) M = mult(M, scalem(...n.scale));
    }

    // Apply to origin
    const pos = mult(M, vec4(def, 1));
    return [pos[0], pos[1], pos[2]];
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

  window.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowUp":
        if (isOblique) {
          gamma += 1;
          gamma = Math.min(Math.max(gamma, 1), 89);
          console.log(`γ = ${gamma.toFixed(1)}°`);
        }
        event.preventDefault();
        break;

      case "ArrowDown":
        if (isOblique) {
          gamma -= 1;
          gamma = Math.min(Math.max(gamma, 1), 89);
          console.log(`γ = ${gamma.toFixed(1)}°`);
        }
        event.preventDefault();
        break;

      case "ArrowLeft":
        if (isOblique) {
          theta += 1;
          console.log(`θ = ${theta.toFixed(1)}°`);
        }
        event.preventDefault();
        break;

      case "ArrowRight":
        if (isOblique) {
          theta -= 1;
          console.log(`θ = ${theta.toFixed(1)}°`);
        }
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

      case '4': //case '8' alters the type of view in this case
        // Axometric view

        toggleAxometric();
        break;

      case '0':
        //toggle multiple views or single view
        multiView = !multiView;
        break;

      case '8':
        //toggle between axonometric view and oblique view when view 4
        if (!isPerspective)
          isOblique = !isOblique;

        if (isOblique) {
          // use same eye position as axonometric but from slightly different direction
          const eye = [1.5, 1.2, 1.0];
          mView = lookAt(eye, [0, 0.6, 0], [0, 1, 0]);
        } else {
          toggleAxometric(mView);
        }


        break;

      case '9':
        // toggle between parallel vs perspective views
        if (!isOblique)
          isPerspective = !isPerspective;
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



      case 'w':
      case 'W':
        //raise cannon
        if (cannonAngle > 85)
          cannonAngle -= 5;

        if (cannonNode) {
          cannonNode.rotation = [cannonAngle, 0, 0];
        }


        break;

      case 's':
      case 'S':
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
        let dir = [0, -1, 0];        

        if (cannonFireNode && tomatoContainerNode) {
          
          pos = getWP(cannonFireNode);
          dir = getWD(cannonFireNode);
          tomatoContainerNode.translation = [pos[0], pos[1], pos[2]];
          const newTomato = {
            translation: [...pos],
            vel: [0.2 * dir[0], 0.2 * dir[1], 0.2 * dir[2]],
            color: [1.0, 0.0, 0.0, 1.0],
            time: 0,
            primitive: SPHERE
          };

          // attach to scene graph
          tomatoContainerNode.children.push(newTomato);
          console.log("addded toamto")
          buildNodeMap(newTomato, tomatoContainerNode);
        }

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

  //matrix usada para a projeção oblíqua
  function obliqueMatrix(thetaDeg = 45, gammaDeg = 45) {
    theta = thetaDeg * Math.PI / 180.0;
    gamma = gammaDeg * Math.PI / 180.0;

    const cotGamma = 1 / Math.tan(gamma);
    const l = Math.cos(theta) * cotGamma;
    const m = Math.sin(theta) * cotGamma;
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

  function render() {
    //este animation é usado para a rotação do drone
    if (animation) time += speed;
    window.requestAnimationFrame(render);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    // é preciso mudar um bocado o range para a proj. Oblíqua ver-se bem
    const range = isOblique ? 3.0 : 2.0;
    const baseOrtho = ortho(-aspect * zoom * range, aspect * zoom * range, -zoom * range, zoom * range, 0.01, 10);


    if (!multiView) {
      mProjection = baseOrtho; //original view


      if (!isOblique && !isPerspective) {
        mProjection = baseOrtho;
      }
      else if (isOblique) {
        const oblique = obliqueMatrix(theta, gamma);
        mProjection = mult(baseOrtho, oblique);
      } if (isPerspective) {
        const fov = 60;
        const near = 0.1;
        const far = 20.0;
        mProjection = perspective(fov, aspect, near, far);
      }

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
        togglePerspective(baseOrtho);
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
        axon: lookAt(
          [2 * Math.cos(Math.PI / 4), 2 * Math.sin(radians(35.26)), 2 * Math.sin(Math.PI / 4)],
          [0, 0.6, 0],
          [0, 1, 0]
        ),
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