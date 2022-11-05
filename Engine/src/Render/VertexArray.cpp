#include "pch.h"
#include "VertexArray.h"

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
			case RenderAPI::API::None:    Logger::Warning("RendererAPI::None is currently not supported!"); return nullptr;
			case RenderAPI::API::OpenGL:  return CreateRef<OpenGLVertexArray>();
#endif
			// Future implementation
			//case RenderAPI::API::OpenGLES:	return CreateRef<OpenGLESVertexArray>();
			case RenderAPI::API::OpenGLES3:	return CreateRef<OpenGLES3VertexArray>();
		}

		Logger::Warning("Unknown RendererAPI!");
		return nullptr;
	}
}