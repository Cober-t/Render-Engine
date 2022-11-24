// Basic Texture Shader

#type vertex
#version 460 core

layout(location = 0) in vec3 a_Position;

layout(std140, binding = 0) uniform Camera
{
	mat4 u_Projection;
	mat4 u_View;
};

void main()
{

	gl_Position = u_Projection * u_View * vec4(a_Position, 1.0);
}

#type fragment
#version 460 core

layout(location = 0) out vec4 color;

layout (binding = 0) uniform sampler2D u_Textures[32];

void main()
{
	
	color = vec4(1.0, 0.0, 0.0, 1.0);
}