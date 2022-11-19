#include "pch.h"

#include <core/Logger.h>

#include "RenderAPI.h"

#if defined __EMSCRIPTEN__ || __OPENGLES3__
	#include "Platforms/OpenGLES3/OpenGLES3RenderAPI.h"
#else
	#include "Platforms/OpenGL/OpenGLRenderAPI.h"
#endif

namespace Cober {

	#ifdef __OPENGL__
		RenderAPI::API RenderAPI::_api = RenderAPI::API::OpenGL;
	#elif  __OPENGLES__
		RenderAPI::API RenderAPI::_api = RenderAPI::API::OpenGLES;
	#elif  __OPENGLES3__ || __EMSCRIPTEN__
		RenderAPI::API RenderAPI::_api = RenderAPI::API::OpenGLES3;
	#else
		RenderAPI::API RenderAPI::_api = RenderAPI::API::None;
	#endif

	Unique<RenderAPI> RenderAPI::Create() {

		switch (_api) {
#if !defined __EMSCRIPTEN__ && !defined __OPENGLES3__
			case RenderAPI::API::None:		LOG("RenderAPI::None means there is not render defined!!"); return nullptr;
			case RenderAPI::API::OpenGL:	return CreateUnique<OpenGLRenderAPI>();
#elif defined __EMSCRIPTEN__ || __OPENGLES3__
			case RenderAPI::API::None:		LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGL:	LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGLES:	LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGLES3:	return CreateUnique<OpenGLES3RenderAPI>();
			default:	LOG_ERROR("Unknown RendererAPI!"); break;
#endif
		}
		LOG("Unknown RenderAPI!");
		return nullptr;
	}
}