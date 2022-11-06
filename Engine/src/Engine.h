#pragma once
//[++++++++++++++++++++++++++]
//[++++++++++ CORE ++++++++++]
//[++++++++++++++++++++++++++]
#include <core/Application.h>
#include <core/AssetManager.h>
#include <core/Logger.h>
#include <core/Timestep.h>
#include <core/Window.h>
#include <core/Layer.h>
#include <core/Events.h>
#include <core/Scene.h>
#include <core/UUID.h>


//[++++++++++++++++++++++++++]
//[++++++++ SYSTEMS +++++++++]
//[++++++++++++++++++++++++++]
#include <GUISystem/GuiLayer.h>
#include <Systems/MovementSystem.h>
#include <Systems/RenderSystem.h>
#include <Systems/PhysicsSystem.h>


//[++++++++++++++++++++++++++]
//[++++++++ ENTITIES ++++++++]
//[++++++++++++++++++++++++++]
#include <Entities/Components.h>
#include <Entities/ECS.h>


//[++++++++++++++++++++++++++]
//[+++++++++ RENDER +++++++++]
//[++++++++++++++++++++++++++]
#include <Render/GraphicsContext.h>   
#include <Render/Framebuffer.h>
#include <Render/Shader.h>
#include <Render/Texture.h>
#include <Render/Buffer.h>
#include <Render/RenderGlobals.h>   
#include <Render/RenderAPI.h>   
#include <Render/Render2D.h>   
#include <Render/DebugRenderer.h>
#include <Render/Camera/EditorCamera.h>


//[++++++++++++++++++++++++++]
//[+++++++++ Platform +++++++++]
//[++++++++++++++++++++++++++]
#ifndef __EMSCRIPTEN__
	#include <Platforms/OpenGL/OpenGLContext.h>
	#include <Platforms/OpenGL/OpenGLFramebuffer.h>
	#include <Platforms/OpenGL/OpenGLRenderAPI.h>
	#include <Platforms/OpenGL/OpenGLShader.h>
#else
	//#include <Platforms/OpenGL/OpenGLES3Context.h>
	//#include <Platforms/OpenGL/OpenGLES3Framebuffer.h>
	//#include <Platforms/OpenGL/OpenGLES3RenderAPI.h>
	//#include <Platforms/OpenGL/OpenGLES3Shader.h>
#endif


//[++++++++++++++++++++++++++]
//[+++++++++ IMGUI ++++++++++]
//[++++++++++++++++++++++++++]

#ifndef __EMSCRIPTEN__
	#include <imgui/imgui.h>
	#include <imgui/imconfig.h>
	#include <imgui/imgui_impl_opengl3.h>
	#include <imgui/imgui_impl_sdl.h>
	#include <imgui/imgui_internal.h>
	#include <imgui/imstb_rectpack.h>
	#include <imgui/imstb_textedit.h>
	#include <imgui/imstb_truetype.h>
#endif 




//[++++++++++++++++++++++++++]
//[+++++++++5 BOX 2D +++++++++]
//[++++++++++++++++++++++++++]
// 
//#include <box2D/b2_world.h>
//#include <box2D/b2_body.h>
//#include <box2D/b2_fixture.h>
//#include <box2D/b2_polygon_shape.h>
//class b2World;

//[++++++++++++++++++++++++++]
//[+++ NUKLEAR GUI SYSTEM +++]
//[++++++++++++++++++++++++++]
//#include <nuklear/nuklear.h>
//#include <nuklear/nuklear_sdl_gl3.h>