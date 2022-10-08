#version 430

layout (location = 0) in vec3 pos;

uniform mat4 _projection;
uniform mat4 _view;

void main()
{
	gl_Position = _projection * _view * vec4(pos, 1.0); 
}