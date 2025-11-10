export {scene};


import * as CUBE from '../../libs/objects/cube.js';
import * as SPHERE from '../../libs/objects/sphere.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as PYRAMID from '../../libs/objects/pyramid.js';

const numWheels = 6
const wheelSpace = 1
 
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

const colorDgreen = [0.2, 0.3, 0.1, 1.0];
const colorLgreen = [0.3, 0.4, 0.1, 1.0];
const colorYgreen = [0.3, 0.3, 0.1, 1.0];
const colorGwhite = [0.0, 0.0, 0.0, 0.5];
const colorLblue = [0.0, 0.3, 1.0, 0.5];
const colorDblue = [0., 0., 0.7, 1.0];
const colorDGray = [0.1, 0.1, 0.1, 1];



var scene =
[
  {
    "name": "scene",
    "translation": [0,0,0],
    "children": [
      {
        "name": "tank",
        "rotation": [0, 0, 0],
        "scale": [1, 1, 1],
        "children": [
          {
            "name": "base",
            "lines": true,
            "translation": [0, 0.1, 0],
            "scale": [0.8, 0.1, 1],
            "primitive": CUBE,
            "color": colorDgreen,
            "children": [
              {
                "name": "base2",
                "lines": true,
                "translation": [0, 1, 0],
                "scale": [1.1, 1.2, 1.2],
                "primitive": CUBE,
                "color": colorYgreen,
                "children": [
                  {
                    "name": "base2PL",
                    "lines":true,
                    "translation": [0, 0,0.55],
                    "rotation": [90, 0, 0],
                    "scale": [1, 0.1, 1],
                    "primitive": PYRAMID,
                    "color": colorYgreen
                  },
                  {
                    "name": "base2PR",
                    "lines":true,
                    "translation": [0, 0,-0.55],
                    "rotation": [-90, 0, 0],
                    "scale": [1, 0.1, 1],
                    "primitive": PYRAMID,
                    "color": colorYgreen
                  },
                  {
                    "name": "base3",
                    "lines": true,
                    "translation": [0, 1, 0],
                    "rotation": [0, 180, 0],
                    "scale": [1, 1, 0.8],                                      
                    "primitive": CUBE,
                    "color": colorLgreen,
                    "children": [
                      {
                        "name": "cabin",
                        "lines": true,
                        "translation": [0, 1, 0],
                        "rotation": [0, 0, 0],
                        "scale": [0.5, 2.5 , 0.5],
                        "primitive": SPHERE,
                        "color": colorDgreen,
                        "children": [
                          {
                            "name": "cannon",
                            "lines": true,
                            "rotation":[0, 0, 0],
                            "children": [    
                              {
                                "name": "cannonT",
                                "translation": [0, 0, -.5], 
                                "rotation": [0, 0, 0],
                                "children": [
                                  {
                                    "name": "cannonJoint",
                                    "lines": true,
                                    "translation": [0, 0, 0],
                                    "scale": [0.1, 0.1 ,0.05],
                                    "color": colorYgreen,
                                    "primitive": SPHERE,
                                    "children": [
                                      {
                                        "name": "cannonBarrel",
                                        "lines": true,
                                        "translation": [0, 0, 0],  
                                        "rotation": [90, 0, 0],  
                                        "scale": [0.7, 25, 0.7],  
                                        "primitive": CYLINDER,  
                                        "color": colorYgreen,
                                        "children": [
                                          {
                                            "name": "cannonMuzzle",
                                            "lines": true,
                                            "translation": [0 , -0.5, 0],
                                            "scale": [1.2, 0.05, 1.200],
                                            "color": colorYgreen,
                                            "primitive": SPHERE,
                                            "children":[
                                              {
                                                "name": "cannonFire",
                                                "mModel": null,
                                                "lines": true,
                                                "scale": [0.6, 2, 0.6],
                                                "color": colorYgreen,
                                                "primitive": CYLINDER
                                              }]
                                          }]
                                      }] 
                                  }]
                              },
                              {
                                "name": "entrance",
                                "translation": [0, 0.5, 0],
                                "scale": [0.2, 0.01, 0.2],
                                "color": colorYgreen,
                                "primitive": CYLINDER, 
                                "children": [
                                  {                                           
                                    "name": "entrance2",
                                    "lines": true,
                                    "translation": [0, 1.5, 0],
                                    "scale": [0.9, 0, 0.9],
                                    "color": colorDgreen,
                                    "primitive": CYLINDER
                                  }]
                                }]
                          }]
                      },
                      {
                        "name": "base3P",
                        "lines":true,
                        "translation": [0, 0,-0.55],
                        "rotation": [-90, 0, 0],
                        "scale": [1, .1, 1],
                        "primitive": PYRAMID,
                        "color": colorLgreen
                      },
                      {
                        "name": "base3PL",
                        "lines":true,
                        "translation": [0, 0,0.55],
                        "rotation": [90, 0, 0],
                        "scale": [1, .1, 1],
                        "primitive": PYRAMID,
                        "color": colorLgreen
                      }]
                  }]
              }]
          },
          {
            "name": "drone",
            "rotation": [0,0, 0],
            "children": [
              {
                "name": "droneT",
                "translation": [.5, 1.2, .5],
                "rotation": [0, 0, 0],
                "scale": [0.3, 0.3, 0.3],
                "children": [
                  {
                    "name": "droneBody",
                    "primitive": SPHERE, 
                    "rotation": [0, 0, 0],
                    "color": colorGwhite,
                    "children": [
                      {
                        "name": "droneCannonR",
                        "translation": [0, 0, .3],
                        "rotation": [0, 0, 0],
                        "children": [
                          {
                            "name": "droneCannon",
                            "lines": true,
                            "rotation": [90, 0, 0],
                            "scale": [0.2, 0.85, 0.2],
                            "primitive": CYLINDER,
                            "color": colorDblue,
                            
                        }]
                      },
                      {
                          "name": "rotorsU",
                          "children": [
                          {
                            "name": "rotorU1",
                            "lines": true,
                            "translation": rotorUPositions[0],
                            "scale": [0.35, 0.1, 0.35],
                            "color": colorLblue,
                            "primitive": CYLINDER
                          },
                          {
                            "name": "rotorU2",
                            "lines": true,
                            "translation": rotorUPositions[1],
                            "scale": [0.35, 0.1, 0.35],
                            "color": colorLblue,
                            "primitive": CYLINDER
                          },
                          {
                            "name": "rotorU3",
                            "lines": true,
                            "translation": rotorUPositions[2],
                            "scale": [0.35, 0.1, 0.35],
                            "color": colorLblue,
                            "primitive": CYLINDER
                          },
                          {
                            "name": "rotorU4",
                            "lines": true,
                            "translation": rotorUPositions[3],
                            "scale": [0.35, 0.1, 0.35],
                            "color": colorLblue,
                            "primitive": CYLINDER
                          }]
                      },
                      {
                        "name": "rotorsD",
                        "children": [
                          {
                            "name": "rotorD1",
                            "lines": true,
                            "translation": rotorDPositions[0],
                            "scale": [0.35, 0.1, 0.35],
                            "color": colorLblue,
                            "primitive": CYLINDER
                          },
                          {
                            "name": "rotorD2",
                            "lines": true,
                            "translation": rotorDPositions[1],
                            "scale": [0.35, 0.1, 0.35],
                            "color": colorLblue,
                            "primitive": CYLINDER
                          },
                          {
                            "name": "rotorD3",
                            "lines": true,
                            "translation": rotorDPositions[2],
                            "scale": [0.35, 0.1, 0.35],
                            "color": colorLblue,
                            "primitive": CYLINDER
                          },
                          {
                            "name": "rotorD4",
                            "lines": true,
                            "translation": rotorDPositions[3],
                            "scale": [0.35, 0.1, 0.35],
                            "color": colorLblue,
                            "primitive": CYLINDER
                          }]
                      }]
                  }]
              }]
          },
          {
            "name": "wheels",
            "children": [
              {
                "name": "lWheels",
                "translation": [-0.47, 0.11 , -.2],
                "rotation": [0,0,-90],
                "scale": [0.22, 0.05, 0.2],
                "children": [
                  {
                    "name": "lWheel1",
                    "lines": true,
                    "translation": [0, 0, (1 - (numWheels - 1) / 2) * wheelSpace],
                    "rotation": [0,0,0],
                    "color": colorDGray,
                    "primitive": CYLINDER
                  },
                  {
                    "name": "lWheel2",
                    "lines": true,
                    "translation": [0, 0, (2 - (numWheels - 1) / 2) * wheelSpace],
                    "rotation": [0,0,0],
                    "color": colorDGray,
                    "primitive": CYLINDER
                  },
                  {
                    "name": "lWheel3",
                    "lines": true,
                    "translation": [0, 0, (3 - (numWheels - 1) / 2) * wheelSpace],
                    "rotation": [0,0,0],
                    "color": colorDGray,
                    "primitive": CYLINDER
                  },
                  {
                    "name": "lWheel4",
                    "lines": true,
                    "translation": [0, 0, (4 - (numWheels - 1) / 2) * wheelSpace],
                    "rotation": [0,0,0],
                    "color": colorDGray,
                    "primitive": CYLINDER
                  },
                  {
                    "name": "lWheel5",
                    "lines": true,
                    "translation": [0, 0, (5 - (numWheels - 1) / 2) * wheelSpace],
                    "rotation": [0,0,0],
                    "color": colorDGray,
                    "primitive": CYLINDER,
                    "children": [
                    {//PUT IN LINE MODE AND SEE WHEEL SPIN
                      "translation": [0.3, 0.1, 0],
                      "rotation": [0,0,0],
                      "scale": [0.1, 0.1, 0.1],
                      "color": [1, 0, 0, 1],
                      "primitive": CUBE
                    }]
                  },
                  {
                    "name": "lWheel6",
                    "lines": true,
                    "translation": [0, 0, (6 - (numWheels - 1) / 2) * wheelSpace],
                    "rotation": [0,0,0],
                    "color": colorDGray,
                    "primitive": CYLINDER
                  }]
              },
              {
                "name": "rWheels",
                "translation": [0.47, 0.11 , -.2],
                "rotation": [0,0,-90],
                "scale": [0.22, 0.05, 0.2],
                "children": [
                  {
                    "name": "rWheel1",
                    "lines": true,
                    "translation": [0, 0, (1 - (numWheels - 1) / 2) * wheelSpace],
                    "rotation": [0,0,0],
                    "color": colorDGray,
                    "primitive": CYLINDER
                },
                {
                  "name": "rWheel2",
                  "lines": true,
                  "translation": [0, 0, (2 - (numWheels - 1) / 2) * wheelSpace],
                  "rotation": [0,0,0],
                  "rotation": [0,0,0],
                  "color": colorDGray,
                  "primitive": CYLINDER
                },
                {
                  "name": "rWheel3",
                  "lines": true,
                  "translation": [0, 0, (3 - (numWheels - 1) / 2) * wheelSpace],
                  "rotation": [0,0,0],
                  "rotation": [0,0,0],
                  "color": colorDGray,
                  "primitive": CYLINDER,
                  "children": [
                    {//PUT IN LINE MODE AND SEE WHEEL SPIN
                      "translation": [0.3, 0.1, 0],
                      "rotation": [0,0,0],
                      "scale": [0.1, 0.1, 0.1],
                      "color": [1, 0, 0, 1],
                      "primitive": CUBE
                    }]
                },
                {
                    "name": "rWheel4",
                    "lines": true,
                    "translation": [0, 0, (4 - (numWheels - 1) / 2) * wheelSpace],
                    "rotation": [0,0,0],
                    "color": colorDGray,
                    "primitive": CYLINDER
                },
                {
                  "name": "rWheel5",
                  "lines": true,
                  "translation": [0, 0, (5 - (numWheels - 1) / 2) * wheelSpace],
                  "rotation": [0,0,0],
                  "color": colorDGray,
                  "primitive": CYLINDER
                },
                {
                  "name": "rWheel6",
                  "lines": true,
                  "translation": [0, 0, (6 - (numWheels - 1) / 2) * wheelSpace],
                  "rotation": [0,0,0],
                  "color": colorDGray,
                  "primitive": CYLINDER
                }]
              }]
          }]
      }, 
      {
        "name": "tomatoes",
        "translation": [0, 0, 0],
        "scale": [0.03, 0.03, 0.03],
        "children": []
      }]
  }
];