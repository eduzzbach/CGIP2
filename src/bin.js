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
    multTranslation([0.0, 0.5, 0.2]);
    multRotationX(cannonAngle);
    multRotationX(90);
    multScale([0.05, 0.7, 0.05]);
    gl.uniform4fv(uColor, colorYgreen);
    uploadModelView();
    CYLINDER.draw(gl, program, mode);
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



     projectiles.push({
          pos: [finalX, finalY, finalZ],
          vel: [dirX * 0.2, dirY * 0.2, dirZ * 0.2],
          time: 0
        });

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
        