#include "pch.h"
#include "VertexArray.h"

#include "Render/RenderAPI.h"
#include "Systems/RenderSystem.h"

#if !defined __EMSCRIPTEN__ && !defined __OPENGLES3__
	#include "Platforms/OpenGL/OpenGLVertexArray.h"
#elif defined __EMSCRIPTEN__ || __OPENGLES3__
	#include "Platforms/OpenGLES3/OpenGLES3VertexArray.h"
#endif

namespace Cober {

	Ref<VertexArray> VertexArray::Create()
	{
		switch (RenderAPI::GetAPI())
		{
#if !defined __EMSCRIPTEN__ && !defined __OPENGLES3__
			case RenderAPI::API::None:    LOG_WARNING("RendererAPI::None is currently not supported!"); return nullptr;
			case RenderAPI::API::OpenGL:  return CreateRef<OpenGLVertexArray>();
#elif defined __EMSCRIPTEN__ || __OPENGLES3__
			case RenderAPI::API::None:			LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGL:		LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGLES:		break; // return CreateRef<OpenGLESVertexArray>();
			case RenderAPI::API::OpenGLES3:		return CreateRef<OpenGLES3VertexArray>();
			default:	LOG_ERROR("Unknown RendererAPI!"); break;
#endif
		}
		return nullptr;
	}
}