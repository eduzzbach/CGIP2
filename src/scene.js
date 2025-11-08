export {scene};
import 
{CUBE, SPHERE, CYLINDER} from './primitives.js';
import {tankPos, cabinAngle, cannonAngle, colorDgreen, colorYgreen} from './app.js';

let tankPos = [0, 0, 0];
let cabinAngle = 0;
let cannonAngle = 0;
let tireRotation = 0;


var scene = [
{
  "name": "tank",
  "translation": tankPos,
  "rotation": [0, 0, 0],
  "scale": [1, 1, 1],
  "children": [
    {
      "name": "base",
      "translation": [0, 0.1, 0],
      "rotation": [0, 0, 0],
      "scale": [0.8, 0.1, 1.0],
      "primitive": CUBE,
      "color": colorDgreen
    },
    {
      "name": "base2",
      "translation": [0, 0.07, 0],
      "scale": [1.0, 0.15, 1.2],
      "rotation": [0, cabinAngle, 0], 
      "scale": [1, 1, 1],
      "children": [
        {
          "name": "cabinMesh",
          "translation": [0, 0.8, 0],
          "rotation": [0, 0, 0],
          "scale": [0.5, 0.5, 0.5],
          "primitive": SPHERE,
          "color": colorDgreen
        },
        {
          "name": "cannon",
          "translation": [0, 0, 0.2],
          "rotation": [cannonAngle, 0, 0],  // Only store angle
          "scale": [1, 1, 1],
          "children": [
            {
              "name": "cannonBarrel",
              "translation": [0, 0, 0],
              "rotation": [90, 0, 0],  // Fixed orientation
              "scale": [0.05, 0.7, 0.05],
              "primitive": CYLINDER,
              "color": colorYgreen
            }
          ]
        }
      ]
    }
  ]
}];