#include "pch.h"
#include "VertexArray.h"

#include "Render/RenderAPI.h"
#include "Systems/RenderSystem.h"
#ifndef __EMSCRIPTEN__
#include "Platforms/OpenGL/OpenGLVertexArray.h"
#endif
#include "Platforms/OpenGLES3/OpenGLES3VertexArray.h"

namespace Cober {

	Ref<VertexArray> VertexArray::Create()
	{
		switch (RenderAPI::GetAPI())
		{
#ifndef __EMSCRIPTEN__
			case RenderAPI::API::None:    LOG_WARNING("RendererAPI::None is currently not supported!"); return nullptr;
			case RenderAPI::API::OpenGL:  return CreateRef<OpenGLVertexArray>();
#else		
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