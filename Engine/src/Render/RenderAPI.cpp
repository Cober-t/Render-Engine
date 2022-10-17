#include "pch.h"
#include "RenderAPI.h"

#include "Platforms/OpenGL/OpenGLRenderAPI.h"
//#include "Platforms/OpenGLES3/OpenGLES3RenderAPI.h"
//#include "Platforms/OpenGLES3/OpenGLES3Context.h"

namespace Cober {

	#ifdef __OPENGL__
		RenderAPI::API RenderAPI::_api = RenderAPI::API::OpenGL;
	#elif  __OPENGLES__
		RenderAPI::API RenderAPI::_api = RenderAPI::API::OpenGLES;
	#elif  __OPENGLES3__
		RenderAPI::API RenderAPI::_api = RenderAPI::API::OpenGLES3;
	#else
		RenderAPI::API RenderAPI::_api = RenderAPI::API::None;
	#endif

	Unique<RenderAPI> RenderAPI::Create() {


		switch (_api) {
			case RenderAPI::API::None:		LOG("RenderAPI::None means there is not render defined!!"); return nullptr;
			case RenderAPI::API::OpenGL:	return CreateUnique<OpenGLRenderAPI>();						return nullptr;

			// Future implementation
			//case RenderAPI::API::OpenGLES:	return CreateUnique<OpenGLESRenderAPI>()	return nullptr;
			//case RenderAPI::API::OpenGLES3:	return CreateUnique<OpenGLES3RenderAPI>()	return nullptr;
		}
		LOG_ERROR("Unknown RenderAPI!");
		return nullptr;
	}
}