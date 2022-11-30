//[++++++++++++++++++++++++++]
//[+++++++++ IMGUI ++++++++++]
//[++++++++++++++++++++++++++]
#if defined __OPENGL__
	#include <imgui/imgui.h>
	#include <imgui/imconfig.h>
	#include <imgui/imgui_impl_opengl3.h>
	#include <imgui/imgui_impl_sdl.h>
	#include <imgui/imgui_internal.h>
	#include <imgui/imstb_rectpack.h>
	#include <imgui/imstb_textedit.h>
	#include <imgui/imstb_truetype.h>
#endif 

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
#include <core/Utils.h>

//[++++++++++++++++++++++++++]
//[+++++++++ EVENTS +++++++++]
//[++++++++++++++++++++++++++]
#include <Events/Events.h>


//[++++++++++++++++++++++++++]
//[++++++++ SYSTEMS +++++++++]
//[++++++++++++++++++++++++++]
#include <GUISystem/GuiLayer.h>
#ifdef __OPENGL__
#include <GUISystem/ImFileBrowser.h>
#endif
#include <Systems/MovementSystem.h>
#include <Systems/RenderSystem.h>
#include <Systems/PhysicsSystem2D.h>
#include <Systems/CollisionSystem2D.h>
#include <Systems/AnimationSystem2D.h>


//[++++++++++++++++++++++++++]
//[++++++++ ENTITIES ++++++++]
//[++++++++++++++++++++++++++]
#include <Entities/Components.h>
#include <Entities/ECS.h>
#include <Entities/Scene.h>

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
#if !defined __EMSCRIPTEN__ || __OPENGLES3__
	//#include <Platforms/OpenGL/OpenGLContext.h>
	//#include <Platforms/OpenGL/OpenGLFramebuffer.h>
	//#include <Platforms/OpenGL/OpenGLRenderAPI.h>
	//#include <Platforms/OpenGL/OpenGLShader.h>
#elif defined __OPENGLES3__
	//#include <Platforms/OpenGL/OpenGLES3Context.h>
	//#include <Platforms/OpenGL/OpenGLES3Framebuffer.h>
	//#include <Platforms/OpenGL/OpenGLES3RenderAPI.h>
	//#include <Platforms/OpenGL/OpenGLES3Shader.h>
#endif

//[++++++++++++++++++++++++++]
//[+++++++++ BOX 2D +++++++++]
//[++++++++++++++++++++++++++]
// 
//#include <box2D/b2_world.h>
//#include <box2D/b2_body.h>
//#include <box2D/b2_fixture.h>
//#include <box2D/b2_polygon_shape.h>
//#include <box2D/b2_draw.h>
//class b2World;

//[++++++++++++++++++++++++++]
//[+++ NUKLEAR GUI SYSTEM +++]
//[++++++++++++++++++++++++++]
//#include <nuklear/nuklear.h>
//#include <nuklear/nuklear_sdl_gl3.h>