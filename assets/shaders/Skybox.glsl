// Basic Texture Shader

#type vertex
#version 460 core

layout (location = 0) in vec3 a_Position;
layout (location = 1) in vec2 a_TexCoords;

layout(std140, binding = 0) uniform Camera
{
	mat4 projection;
	mat4 view;
};
layout(location = 0) out vec3 TexCoords;

void main()
{
    TexCoords = a_Position;
    vec4 pos = projection * view * vec4(a_Position, 1.0);
    gl_Position = pos.xyww;
} 

#type fragment
#version 460 core

layout(location = 0) out vec4 color;

layout(location = 0) in vec3 TexCoords;

uniform samplerCube skybox;

void main()
{    
    color = texture(skybox, TexCoords);
}