#include "pch.h"
#include "RenderAPI.h"

#ifndef __EMSCRIPTEN__
	#include "Platforms/OpenGL/OpenGLRenderAPI.h"
#endif
#include "Platforms/OpenGLES3/OpenGLES3RenderAPI.h"

#include <core/Logger.h>

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
#ifndef __EMSCRIPTEN__
			case RenderAPI::API::None:		LOG("RenderAPI::None means there is not render defined!!"); return nullptr;
			case RenderAPI::API::OpenGL:	return CreateUnique<OpenGLRenderAPI>();
#else		
			case RenderAPI::API::None:		LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGL:	LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGLES:	LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGLES3:	LOG("Creating OpenGLES3 API..."); return CreateUnique<OpenGLES3RenderAPI>();
			default:	LOG_ERROR("Unknown RendererAPI!"); break;
#endif
		}
		LOG("Unknown RenderAPI!");
		return nullptr;
	}
}