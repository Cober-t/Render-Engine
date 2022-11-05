#include "pch.h"
#include "Buffer.h"

#include "Systems/RenderSystem.h"
#include "Render/RenderAPI.h"

#ifndef __EMSCRIPTEN__
#include "Platforms/OpenGL/OpenGLBuffer.h"
#endif
#include "Platforms/OpenGLES3/OpenGLES3Buffer.h"

namespace Cober {

	Ref<VertexBuffer> VertexBuffer::Create(uint32_t size)
	{
		switch (RenderAPI::GetAPI())
		{
#ifndef __EMSCRIPTEN__
			case RenderAPI::API::None:    Logger::Error("RendererAPI::None is currently not supported!"); return nullptr;
			case RenderAPI::API::OpenGL:  return CreateRef<OpenGLVertexBuffer>(size);
#endif

			// Future implementation
			//case RenderAPI::API::OpenGLES:	return CreateRef<OpenGLESVertexBuffer>(size);
			case RenderAPI::API::OpenGLES3:	return CreateRef<OpenGLES3VertexBuffer>(size);
		}

		Logger::Error("Unknown RendererAPI!");
		return nullptr;
	}

	Ref<VertexBuffer> VertexBuffer::Create(float* vertices, uint32_t size)
	{
		switch (RenderAPI::GetAPI())
		{
#ifndef __EMSCRIPTEN__
			case RenderAPI::API::None:    Logger::Error("RendererAPI::None is currently not supported!"); return nullptr;
			case RenderAPI::API::OpenGL:  return CreateRef<OpenGLVertexBuffer>(vertices, size);
#endif

			// Future implementation
			//case RenderAPI::API::OpenGLES:	return CreateRef<OpenGLESVertexBuffer>(vertices, size);	return nullptr;
			case RenderAPI::API::OpenGLES3:	return CreateRef<OpenGLES3VertexBuffer>(vertices, size);
		}

		Logger::Error("Unknown RendererAPI!");
		return nullptr;
	}

	Ref<IndexBuffer> IndexBuffer::Create(uint32_t* indices, uint32_t size)
	{
		switch (RenderAPI::GetAPI())
		{
#ifndef __EMSCRIPTEN__
			case RenderAPI::API::None:    Logger::Error("RendererAPI::None is currently not supported!"); return nullptr;
			case RenderAPI::API::OpenGL:  return CreateRef<OpenGLIndexBuffer>(indices, size);
#endif

			// Future implementation
			//case RenderAPI::API::OpenGLES:	return CreateRef<OpenGLESVertexBuffer>(indices, size)	return nullptr;
			case RenderAPI::API::OpenGLES3:	return CreateRef<OpenGLES3IndexBuffer>(indices, size);
		}

		Logger::Error("Unknown RendererAPI!");
		return nullptr;
	}

	Ref<UniformBuffer> UniformBuffer::Create(uint32_t size, uint32_t binding)
	{
		switch (RenderAPI::GetAPI()) 
		{
#ifndef __EMSCRIPTEN__
		case RenderAPI::API::None:    Logger::Error("RendererAPI::None is currently not supported!"); return nullptr;
		case RenderAPI::API::OpenGL:  return CreateRef<OpenGLUniformBuffer>(size, binding);
#endif
		}

		Logger::Error("Unknown RendererAPI!");
		return nullptr;
	}
}