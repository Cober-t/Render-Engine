#include "pch.h"

#include "core/Core.h"
#include "Render/RenderAPI.h"
#include "GraphicsContext.h"

#if !defined __EMSCRIPTEN__ && !defined __OPENGLES3__
	#include "Platforms/OpenGL/OpenGLContext.h"
#elif defined __EMSCRIPTEN__ || __OPENGLES3__
	#include "Platforms/OpenGLES3/OpenGLES3Context.h"
#endif

namespace Cober {

	Unique<GraphicsContext> GraphicsContext::Create(void* window) {
	
		switch (RenderAPI::GetAPI()) {
#if !defined __EMSCRIPTEN__ && !defined __OPENGLES3__
			case RenderAPI::API::None:		LOG_ERROR("RenderAPI::None means there is not render defined!!");		return nullptr;
			case RenderAPI::API::OpenGL:	return CreateUnique<OpenGLContext>(static_cast<SDL_Window*>(window));
#elif defined __EMSCRIPTEN__ || __OPENGLES3__
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