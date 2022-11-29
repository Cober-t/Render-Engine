// Basic Texture Shader

#type vertex
#version 460 core

layout (location = 0) in vec3 a_Position;
layout (location = 1) in vec2 a_TexCoords;

layout(location = 0) out vec2 TexCoords;

layout(std140, binding = 0) uniform Camera
{
	mat4 projection;
	mat4 view;
	mat4 model;
};

void main()
{
    TexCoords = a_TexCoords;    
    gl_Position = projection * view * model * vec4(a_Position, 1.0);
}

#type fragment
#version 460 core

layout(location = 0) out vec4 color;

layout(location = 0) in vec2 TexCoords;

uniform sampler2D texture1;

void main()
{    
    color = texture(texture1, TexCoords);
}