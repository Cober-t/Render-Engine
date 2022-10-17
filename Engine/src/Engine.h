#pragma once
//[++++++++++++++++++++++++++]
//[++++++++++ CORE ++++++++++]
//[++++++++++++++++++++++++++]
#include <core/AssetManager.h>
#include <core/Application.h>
#include <core/Logger.h>
#include <core/Timestep.h>
#include <core/Window.h>
#include <core/Layer.h>
#include <core/Events.h>


//[++++++++++++++++++++++++++]
//[++++++++ SYSTEMS +++++++++]
//[++++++++++++++++++++++++++]
#include <GUISystem/GuiLayer.h>
#include <Systems/MovementSystem.h>
#include <Systems/RenderSystem.h>


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
#include <Render/RenderGlobals.h>   
#include <Render/RenderAPI.h>   
#include <Render/Camera/EditorCamera.h>


//[++++++++++++++++++++++++++]
//[+++++++++ RENDER +++++++++]
//[++++++++++++++++++++++++++]
#include <Platforms/OpenGL/OpenGLContext.h>
#include <Platforms/OpenGL/OpenGLFramebuffer.h>
#include <Platforms/OpenGL/OpenGLRenderAPI.h>
#include <Platforms/OpenGL/OpenGLShader.h>


//[++++++++++++++++++++++++++]
//[+++++++++ IMGUI ++++++++++]
//[++++++++++++++++++++++++++]
#include <imgui/imgui.h>
#include <imgui/imconfig.h>
#include <imgui/imgui_impl_opengl3.h>
#include <imgui/imgui_impl_sdl.h>
#include <imgui/imgui_internal.h>
#include <imgui/imstb_rectpack.h>
#include <imgui/imstb_textedit.h>
#include <imgui/imstb_truetype.h>