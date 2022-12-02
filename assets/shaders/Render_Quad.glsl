#type vertex
#version 300 es

layout(location = 0) in vec3 a_Position;
layout(location = 1) in vec4 a_Color;
layout(location = 2) in vec2 a_TexCoord;
layout(location = 3) in float a_TexIndex;
layout(location = 4) in float a_TilingFactor;
layout(location = 5) in float a_EntityID;

uniform mat4 u_ViewProjection;

out vec4 Color;
out vec2 TexCoord;
out float TilingFactor;
out float v_TexIndex;
out float v_EntityID;

void main()
{
	Color = a_Color;
	TexCoord = a_TexCoord;
	TilingFactor = a_TilingFactor;
	v_TexIndex = a_TexIndex;
	v_EntityID = a_EntityID;

	gl_Position = u_ViewProjection * vec4(a_Position, 1.0);
}

#type fragment
#version 300 es

precision mediump float;

layout(location = 0) out vec4 o_Color;
//layout(location = 1) out float o_EntityID;

in vec4 Color;
in vec2 TexCoord;
in float TilingFactor;
in float v_TexIndex;
//in float v_EntityID;

// Max for WebGL
uniform sampler2D u_Textures[16];

void main()
{
	vec4 texColor;
	
	switch(int(v_TexIndex))
	{
		case  0: texColor = texture(u_Textures[ 0], TexCoord * TilingFactor) * Color; break;
		case  1: texColor = texture(u_Textures[ 1], TexCoord * TilingFactor) * Color; break;
		case  2: texColor = texture(u_Textures[ 2], TexCoord * TilingFactor) * Color; break;
		case  3: texColor = texture(u_Textures[ 3], TexCoord * TilingFactor) * Color; break;
		case  4: texColor = texture(u_Textures[ 4], TexCoord * TilingFactor) * Color; break;
		case  5: texColor = texture(u_Textures[ 5], TexCoord * TilingFactor) * Color; break;
		case  6: texColor = texture(u_Textures[ 6], TexCoord * TilingFactor) * Color; break;
		case  7: texColor = texture(u_Textures[ 7], TexCoord * TilingFactor) * Color; break;
		case  8: texColor = texture(u_Textures[ 8], TexCoord * TilingFactor) * Color; break;
		case  9: texColor = texture(u_Textures[ 9], TexCoord * TilingFactor) * Color; break;
		case 10: texColor = texture(u_Textures[10], TexCoord * TilingFactor) * Color; break;
		case 11: texColor = texture(u_Textures[11], TexCoord * TilingFactor) * Color; break;
		case 12: texColor = texture(u_Textures[12], TexCoord * TilingFactor) * Color; break;
		case 13: texColor = texture(u_Textures[13], TexCoord * TilingFactor) * Color; break;
		case 14: texColor = texture(u_Textures[14], TexCoord * TilingFactor) * Color; break;
		case 15: texColor = texture(u_Textures[15], TexCoord * TilingFactor) * Color; break;
	}

	if (texColor.a == 0.0)
		discard;

	o_Color = texColor;
	//o_EntityID = v_EntityID;
}