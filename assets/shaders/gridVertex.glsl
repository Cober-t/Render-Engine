#version 430

precision highp float;
precision highp int;

layout (location=0) in vec3 position;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform vec2 coordShift;
uniform mat4 modelMatrix;

out highp vec3 vertexPosition;

const float PLANE_SCALE = __CONSTANT_PLANE_SCALE;   //assigned during shader compillation

void main()
{
    // generate position data for the fragment shader
    // does not take view matrix or projection matrix into account
    // TODO: +3.0 part is contingent on the actual mesh. It is supposed to be it's lowest possible coordinate.
    // TODO: the mesh here is 6x6 with -3..3 coords. I normalize it to 0..6 for correct fragment shader calculations
    vertexPosition = vec3((position.x+3.0)*PLANE_SCALE+coordShift.x, position.y, (position.z+3.0)*PLANE_SCALE+coordShift.y);

    // position data for the OpenGL vertex drawing
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}