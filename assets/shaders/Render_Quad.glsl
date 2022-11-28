#type vertex
#version 300 es

layout(location = 0) in vec3 a_Position;
layout(location = 1) in vec4 a_Color;
layout(location = 2) in vec2 a_TexCoord;
layout(location = 3) in float a_TexIndex;
layout(location = 4) in float a_TilingFactor;
layout(location = 5) in float a_EntityID;
// WebGL doesnt support integers
// the EntityID is only useful for the editor, 
// but could be useful on a future for some random game framebuffer reason
//layout(location = 5) in int a_EntityID;

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

//#ifdef __EMSCRIPTEN__
uniform sampler2D u_Textures[16];
//#else
//uniform sampler2D u_Textures[32];
//#endif

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
//		case 16: texColor = texture(u_Textures[16], TexCoord * TilingFactor) * Color; break;
//		case 17: texColor = texture(u_Textures[17], TexCoord * TilingFactor) * Color; break;
//		case 18: texColor = texture(u_Textures[18], TexCoord * TilingFactor) * Color; break;
//		case 19: texColor = texture(u_Textures[19], TexCoord * TilingFactor) * Color; break;
//		case 20: texColor = texture(u_Textures[20], TexCoord * TilingFactor) * Color; break;
//		case 21: texColor = texture(u_Textures[21], TexCoord * TilingFactor) * Color; break;
//		case 22: texColor = texture(u_Textures[22], TexCoord * TilingFactor) * Color; break;
//		case 23: texColor = texture(u_Textures[23], TexCoord * TilingFactor) * Color; break;
//		case 24: texColor = texture(u_Textures[24], TexCoord * TilingFactor) * Color; break;
//		case 25: texColor = texture(u_Textures[25], TexCoord * TilingFactor) * Color; break;
//		case 26: texColor = texture(u_Textures[26], TexCoord * TilingFactor) * Color; break;
//		case 27: texColor = texture(u_Textures[27], TexCoord * TilingFactor) * Color; break;
//		case 28: texColor = texture(u_Textures[28], TexCoord * TilingFactor) * Color; break;
//		case 29: texColor = texture(u_Textures[29], TexCoord * TilingFactor) * Color; break;
//		case 30: texColor = texture(u_Textures[30], TexCoord * TilingFactor) * Color; break;
//		case 31: texColor = texture(u_Textures[31], TexCoord * TilingFactor) * Color; break;
	}

	if (texColor.a == 0.0)
		discard;

	o_Color = texColor;
	//o_EntityID = v_EntityID;
}