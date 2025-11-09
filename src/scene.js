export {scene};


import * as CUBE from '../../libs/objects/cube.js';
import * as SPHERE from '../../libs/objects/sphere.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';

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

  let xPos = 0;

    
let tankPos = [0, 0, 0];
let cabinAngle = 0;
let cannonAngle = 0;
let time = 0.4;
const drone_orbit = 5; 
let tireRotation = 0;


const colorDgreen = [0.1, 0.3, 0.1, 1.0];
const colorLgreen = [0.1, 0.5, 0.1, 1.0];
const colorYgreen = [0.3, 0.3, 0.1, 1.0];
const colorGwhite = [0.0, 0.0, 0.0, 0.5];
const colorLblue = [0.0, 0.3, 1.0, 0.5];
const colorDblue = [0., 0., 0.7, 1.0];


var scene = [
  {
    "name": "scene",
    "children": [
      {
    "name": "tank",
    "translation": tankPos,
    "rotation": [0, 0, 0],
    "scale": [1, 1, 1],
    "children": [
    {
      "name": "base",
      "translation": [0, 0.1, 0],
      "scale": [0.8, 0.1, 1.0],
      "primitive": CUBE,
      "color": colorDgreen,
    },

    {
      "name": "base2",
        "translation": [0, 0.2, 0],
        "scale": [1.0, 0.15, 1.2],
        "primitive": CUBE,
        "color": colorYgreen,
        "children": [
          {
          "name": "base2T",
          "translation": [0, 1.0, 0],

        }]
    },

    {
        "name": "base3",
        "translation": [0, .3, 0],
        "rotation": [0, 90, 0],
        "scale": [1.1, 0.2, 1.0],
        "primitive": CYLINDER,
        "color": colorLgreen,
        "children": [
          {
            "name": "cabin",
            "translation": [0, .7, 0],
            "rotation": [0, 0, 0],
            "scale": [0.5, 1.5 , 0.5],
            "primitive": SPHERE,
            "color": colorDgreen,
            "children": [
              {
                "name": "cabinT",
                "translation": [-0.45, 0, 0],
                "children": [
                  {
                    "name": "cannon",
                    "rotation": [0, 0, 0],  
                    "translation": [-0.05, 0, 0], 
                    "children": [
                      {
                        "name": "cannonJoint",
                        "scale": [0.15, 0.1, 0.15],
                        "primitive": SPHERE,
                        "color": colorYgreen
                      },
                      {
                        "name": "cannonBarrel",
                        "rotation": [0, 0, -90],  
                        "scale": [0.07, 1, 0.05],
                        "primitive": CYLINDER,
                        "color": colorYgreen
                        }]
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
      "translation": [-0.53, 0.1 , -.2],
      "rotation": [0,0,90],
      "scale": [0.2, 0.05, 0.2],
      "children": [
        {
          "name": "lWheel1",
          "translation": [0, 0, (1 - (numWheels - 1) / 2) * wheelSpace],
          "rotation": [0,0,0],
          "color": [0, 0, 0, 1],
          "primitive": CYLINDER

      },
      {
        "name": "lWheel2",
        "translation": [0, 0, (2 - (numWheels - 1) / 2) * wheelSpace],
        "rotation": [0,0,0],
        "color": [0, 0, 0, 1],
        "primitive": CYLINDER

      },
      {
        "name": "lWheel3",
        "translation": [0, 0, (3 - (numWheels - 1) / 2) * wheelSpace],
        "rotation": [0,0,0],
        "color": [0, 0, 0, 1],
        "primitive": CYLINDER

      },
      {
        "name": "lWheel4",
        "translation": [0, 0, (4 - (numWheels - 1) / 2) * wheelSpace],
        "rotation": [0,0,0],
        "color": [0, 0, 0, 1],
        "primitive": CYLINDER
      },
      {
        "name": "lWheel5",
        "translation": [0, 0, (5 - (numWheels - 1) / 2) * wheelSpace],
        "rotation": [0,0,0],
        "color": [0, 0, 0, 1],
        "primitive": CYLINDER
      },
      {
        "name": "lWheel6",
        "translation": [0, 0, (6 - (numWheels - 1) / 2) * wheelSpace],
        "rotation": [0,0,0],
        "color": [0, 0, 0, 1],
        "primitive": CYLINDER
      }]
    },

    {
      "name": "rWheels",
      "translation": [0.53, 0.1 , -.2],
      "rotation": [0,0,90],
      "scale": [0.2, 0.05, 0.2],
      "children": [
        {
          "name": "rWheel1",
          "translation": [0, 0, (1 - (numWheels - 1) / 2) * wheelSpace],
          "rotation": [0,0,0],
          "color": [0, 0, 0, 1],
          "primitive": CYLINDER

      },
      {
        "name": "rWheel2",
        "translation": [0, 0, (2 - (numWheels - 1) / 2) * wheelSpace],
        "rotation": [0,0,0],
        "rotation": [0,0,0],
        "color": [0, 0, 0, 1],
        "primitive": CYLINDER

      },
      {
        "name": "rWheel3",
        "translation": [0, 0, (3 - (numWheels - 1) / 2) * wheelSpace],
        "rotation": [0,0,0],
        "rotation": [0,0,0],
        "color": [0, 0, 0, 1],
        "primitive": CYLINDER,
        "children": [
          {//PUT IN LINE MODE AND SEE WHEEL SPIN
            "translation": [0.3, 0.1, 0],
            "rotation": [0,0,0],
            "scale": [0.1, 0.1, 0.1],
            "color": [1, 0, 0, 1],
            "primitive": CUBE
          }
        ]

      },
      {
        "name": "rWheel4",
        "translation": [0, 0, (4 - (numWheels - 1) / 2) * wheelSpace],
        "rotation": [0,0,0],
        "color": [0, 0, 0, 1],
        "primitive": CYLINDER
      },
      {
        "name": "rWheel5",
        "translation": [0, 0, (5 - (numWheels - 1) / 2) * wheelSpace],
        "rotation": [0,0,0],
        "color": [0, 0, 0, 1],
        "primitive": CYLINDER
      },
      {
        "name": "rWheel6",
        "translation": [0, 0, (6 - (numWheels - 1) / 2) * wheelSpace],
        "rotation": [0,0,0],
        "color": [0, 0, 0, 1],
        "primitive": CYLINDER
      }]
    }
      ]
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
            "rotation": [0, cabinAngle, 0],
            "color": colorGwhite,
            "children": [
              {
                "name": "droneCannonR",
                "translation": [0, 0, .3],
                "rotation": [cabinAngle, 0, 0],
                "children": [
                  {
                    "name": "droneCannon",
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
                    "translation": rotorUPositions[0],
                    "scale": [0.35, 0.1, 0.35],
                    "color": colorLblue,
                    "primitive": CYLINDER
                  },
                  {
                    "name": "rotorU2",
                    "translation": rotorUPositions[1],
                    "scale": [0.35, 0.1, 0.35],
                    "color": colorLblue,
                    "primitive": CYLINDER
                  },
                  {
                    "name": "rotorU3",
                    "translation": rotorUPositions[2],
                    "scale": [0.35, 0.1, 0.35],
                    "color": colorLblue,
                    "primitive": CYLINDER
                  },
                  {
                    "name": "rotorU4",
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
                    "translation": rotorDPositions[0],
                    "scale": [0.35, 0.1, 0.35],
                    "color": colorLblue,
                    "primitive": CYLINDER
                  },
                  {
                    "name": "rotorD2",
                    "translation": rotorDPositions[1],
                    "scale": [0.35, 0.1, 0.35],
                    "color": colorLblue,
                    "primitive": CYLINDER
                  },
                  {
                    "name": "rotorD3",
                    "translation": rotorDPositions[2],
                    "scale": [0.35, 0.1, 0.35],
                    "color": colorLblue,
                    "primitive": CYLINDER
                  },
                  {
                    "name": "rotorD4",
                    "translation": rotorDPositions[3],
                    "scale": [0.35, 0.1, 0.35],
                    "color": colorLblue,
                    "primitive": CYLINDER
                  }]
              }]
          }]
        }]
      }
    ]
  }
  ];