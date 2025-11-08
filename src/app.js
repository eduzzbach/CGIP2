import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../../libs/utils.js";
import { ortho, lookAt, flatten, mult, perspective } from "../../libs/MV.js";
import { modelView, loadMatrix, multRotationX, multRotationY, multRotationZ, multScale, multTranslation, popMatrix, pushMatrix } from "../../libs/stack.js";
import { scene } from './scene.js';

import * as CUBE from '../../libs/objects/cube.js';
import * as SPHERE from '../../libs/objects/sphere.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';

let speed = 1 / 5.0;
let animation = true;
let theta = 45;
let gamma = 63.4;
let zoom = 1.0;
let projectiles = [];
let time = 0;

const tank = scene[0];
const rWheels = scene[1];
const lWheels = scene[2];
const drone = scene[3];

let nodeMap = new Map();

  function buildNodeMap(node) {
  nodeMap.set(node.name, node);
  if (node.children) {
    for (let child of node.children) {
      buildNodeMap(child);
    }
  }
  }


//projection booleans
let multiView = false;
let isOblique = false;
let isPerspective = false;

//floor constants
const floorSize = 20;
const tileSize = 0.25;
const tileHeight = 0.05;

//tire constants
const tireSize = 0.2;
const tireHeight = 0.1;
const tireColor = [0.0, 0.0, 0.0, 1.0];
const tireSpacing = 0.2;
const numTiresPerSide = 6;


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

    // updateZoomDisplay();
  });

  

  //
  //case 'arrow keys':
  // adjust axonometric/oblique parameters
  /*
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
  });*/


  document.onkeydown = function (event) {
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
        if (isOblique) {
          mView = oView;
        }
        else {
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
        break;

      case '0':
        //toggle multiple views or single view
        multiView = !multiView;
        break;

      case '8':
        //toggle between axonometric view and oblique view when view 4
        isOblique = !isOblique;
        if (isOblique) {
          // use same eye position as axonometric but from slightly different direction
          const eye = [1.5, 1.2, 1.0];
          mView = lookAt(eye, [0, 0.6, 0], [0, 1, 0]);
        } else {
          mView = oView; // back to normal axonometric
        }
        break;

      case '9':
        // toggle between parallel vs perspective views
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
        //move forwards
        tankPos[0] -= 0.05 * Math.sin(-radians(cabinAngle));
        tankPos[2] += 0.05 * Math.cos(radians(cabinAngle));
        //tankPos[0] -= 0.05; estes é caso não seja preciso
        //tankPos[2] += 0.05; que o tanque ande na direção que o canhão está apontado
        tireRotation += 5;
        break;

      case 'e':
      case 'E':
        //move backwards (ele vira de acordo com a direção que o canhão aponta
        //agora não sei eles querem que as rodas tambêm rodem a evidenciar essa cena)
        tankPos[0] += 0.05 * Math.sin(-radians(cabinAngle));
        tankPos[2] -= 0.05 * Math.cos(radians(cabinAngle));
        // tankPos[0] += 0.05; estes é caso não seja precisa
        // tankPos[2] -= 0.05; que o tanque ande na direção que o canhão está apontado
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


      //quando mudas as coordenadas da cabine ou do canhão, os tomatos deixam de sair de dentro do canhão
      //do código que faz cenas aqui é procurar nas linhas: 533 a 542, 603 a 611 
      case 'z':
      case 'Z':
        const cannonLength = 0.7;

        // Start from tank position
        let worldX = tankPos[0];
        let worldY = tankPos[1];
        let worldZ = tankPos[2];

        // Apply cabin rotation (around Y-axis)
        const cabinRad = radians(cabinAngle);

        // Cannon base offset from tank center (adjust these to match your tankCannon function)
        const cannonBaseX = 0.0;
        const cannonBaseY = 0.5;  // Height of cannon base
        const cannonBaseZ = 0.2;  // Forward offset

        // Rotate cannon base by cabin angle
        const rotatedBaseX = cannonBaseZ * Math.sin(-cabinRad);
        const rotatedBaseZ = cannonBaseZ * Math.cos(cabinRad);

        worldX += rotatedBaseX;
        worldY += cannonBaseY;
        worldZ += rotatedBaseZ;

        // Apply cannon elevation (around X-axis)
        const cannonRad = radians(cannonAngle);
        const tipOffsetZ = cannonLength * Math.cos(cannonRad);
        const tipOffsetY = cannonLength * Math.sin(cannonRad);

        // Rotate cannon tip by cabin angle again
        const rotatedTipX = tipOffsetZ * Math.sin(-cabinRad);
        const rotatedTipZ = tipOffsetZ * Math.cos(cabinRad);

        const finalX = worldX + rotatedTipX;
        const finalY = worldY - tipOffsetY;  // Negative because cannon points "down" when elevated
        const finalZ = worldZ + rotatedTipZ;

        // Direction vector
        const dirX = Math.sin(-cabinRad) * Math.cos(cannonRad);
        const dirY = -Math.sin(cannonRad);
        const dirZ = Math.cos(cabinRad) * Math.cos(cannonRad);

        projectiles.push({
          pos: [finalX, finalY, finalZ],
          vel: [dirX * 0.2, dirY * 0.2, dirZ * 0.2],
          time: 0
        });
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

  buildNodeMap(tank);
  buildNodeMap(rWheels);
  buildNodeMap(lWheels);
  buildNodeMap(drone);


  


  function drawNode(gl, program, node, mode) {
    pushMatrix();

    // apply transformations in fixed order
    if (node.translation) multTranslation(node.translation);
    if (node.rotation) {
        multRotationX(node.rotation[0]);
        multRotationY(node.rotation[1]);
        multRotationZ(node.rotation[2]);
    }
    if (node.scale) multScale(node.scale);

    // draw if leaf
    if (node.primitive) {
        const uColor = gl.getUniformLocation(program, "u_color");
        gl.uniform4fv(uColor, node.color || [1, 1, 1, 1]);
        uploadModelView();
        node.primitive.draw(gl, program, mode);
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


  function tomatoes() {
    //render projectiles
    for (let p of projectiles) {
      pushMatrix();
      multTranslation(p.pos);
      multScale([0.05, 0.05, 0.05]); // small sphere
      const uColor = gl.getUniformLocation(program, "u_color");
      gl.uniform4fv(uColor, [1.0, 0.0, 0.0, 1.0]); // red projectile
      uploadModelView();
      SPHERE.draw(gl, program, mode);
      popMatrix();
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

    for (let p of projectiles) {
      p.time += 0.016; // roughly 60fps
      p.pos[0] += p.vel[0];
      p.pos[1] += p.vel[1];
      p.pos[2] += p.vel[2];
      // Add gravity
      p.vel[1] -= 0.01; // gravity effect
    }
    // Remove projectiles that hit the ground or go too far
    projectiles = projectiles.filter(p => p.pos[1] > 0 && Math.abs(p.pos[0]) < 50 && Math.abs(p.pos[2]) < 50);

    if (!multiView) {
      mProjection = baseOrtho; //original view

      //renders the perspective view
      if (isPerspective) {
        const fov = 60; // field of view in degrees
        const near = 0.1;
        const far = 20.0;
        mProjection = perspective(fov, aspect, near, far);
      } else {
        mProjection = baseOrtho;
      }

      // renders the oblique view
      if (isOblique) {
        const oblique = obliqueMatrix(theta, gamma);
        mProjection = mult(oblique, baseOrtho);
      }

      uploadProjection(mProjection);
      loadMatrix(mView);
      gl.viewport(0, 0, canvas.width, canvas.height);
      floor(floorSize, tileSize, tileHeight);
      drawNode(gl, program, tank, mode);
      drawNode(gl, program, rWheels, mode);
      drawNode(gl, program, lWheels, mode);
      drawNode(gl, program, drone, mode);



    
    }
    else { //when multiview is true

      const halfWidth = canvas.width / 2;
      const halfHeight = canvas.height / 2;

      // Helper to render one view
      function drawView(viewMatrix, x, y, w, h) {
        gl.viewport(x, y, w, h);
        mProjection = baseOrtho;
        uploadProjection(mProjection);
        loadMatrix(viewMatrix);
        floor(floorSize, tileSize, tileHeight);
        drawNode(gl, program, tank, mode);
        drawNode(gl, program, drone, mode);
        drawNode(gl, program, place_holder, mode);
      drawNode(gl, program, place_holder2, mode);


        
        // desenhar os nos recursivamente
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

    tomatoes();
  }
}

const urls = ["shader.vert", "shader.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))