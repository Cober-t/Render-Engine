#include "pch.h"

#include "core/Core.h"
#include "Render/RenderAPI.h"
#include "GraphicsContext.h"

#ifndef __EMSCRIPTEN__
#include "Platforms/OpenGL/OpenGLContext.h"
#endif
#include "Platforms/OpenGLES3/OpenGLES3Context.h"

namespace Cober {

	Unique<GraphicsContext> GraphicsContext::Create(void* window) {
	
		switch (RenderAPI::GetAPI()) {
#ifndef __EMSCRIPTEN__
			case RenderAPI::API::None:		LOG_ERROR("RenderAPI::None means there is not render defined!!");		return nullptr;
			case RenderAPI::API::OpenGL:	return CreateUnique<OpenGLContext>(static_cast<SDL_Window*>(window));
#else
			case RenderAPI::API::None:		LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGL:	LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGLES:	LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGLES3:	return CreateUnique<OpenGLES3Context>(static_cast<SDL_Window*>(window));
			default:	LOG_ERROR("Unknown RendererAPI!"); break;
#endif
		}
		LOG_ERROR("Unknown Context RenderAPI!");
		return nullptr;
	}
}