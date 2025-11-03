#version 300 es

precision mediump float;

out vec4 fcolor;
uniform vec4 u_color;

void main() {
    fcolor = u_color; 
}