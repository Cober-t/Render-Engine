#include "pch.h"
#include "VertexArray.h"

#include "Systems/RenderSystem.h"
#include "Platforms/OpenGL/OpenGLVertexArray.h"

namespace Cober {

	Ref<VertexArray> VertexArray::Create()
	{
		switch (RenderAPI::GetAPI())
		{
			case RenderAPI::API::None:    Logger::Warning("RendererAPI::None is currently not supported!"); return nullptr;
			case RenderAPI::API::OpenGL:  return CreateRef<OpenGLVertexArray>();

			// Future implementation
			//case RenderAPI::API::OpenGLES:	return CreateRef<OpenGLESVertexArray>(width, height)	return nullptr;
			//case RenderAPI::API::OpenGLES3:	return CreateRef<OpenGLES3VertexArray>(width, height)	return nullptr;
		}

		Logger::Warning("Unknown RendererAPI!");
		return nullptr;
	}
}