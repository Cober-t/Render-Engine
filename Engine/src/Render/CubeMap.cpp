#include "pch.h"

#include "CubeMap.h"
#include "Render/RenderAPI.h"

#if !defined __EMSCRIPTEN__ && !defined __OPENGLES3__
#include "Platforms/OpenGL/OpenGLCubeMap.h"
#elif defined __EMSCRIPTEN__ || __OPENGLES3__
#include "Platforms/OpenGLES3/OpenGLES3CubeMap.h"
#endif

namespace Cober {

	Ref<CubeMap> CubeMap::Create()
	{
		switch (RenderAPI::GetAPI())
		{
#if !defined __EMSCRIPTEN__ && !defined __OPENGLES3__
		case RenderAPI::API::None:    LOG_WARNING("RendererAPI::None is currently not supported!"); return nullptr;
		case RenderAPI::API::OpenGL:  return CreateRef<OpenGLCubeMap>();
#elif defined __EMSCRIPTEN__ || __OPENGLES3__
		case RenderAPI::API::None:			LOG_ERROR("Wrong API"); break;
		case RenderAPI::API::OpenGL:		LOG_ERROR("Wrong API"); break;
		case RenderAPI::API::OpenGLES:		LOG_ERROR("Wrong API"); break;
			//case RenderAPI::API::OpenGLES3:		return CreateRef<OpenGLES3CubeMap>();
		default:	LOG_ERROR("Unknown RendererAPI!"); break;
#endif
		}
		return nullptr;
	}
}