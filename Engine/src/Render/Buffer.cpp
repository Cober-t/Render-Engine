#include "pch.h"
#include "Buffer.h"

#include "Systems/RenderSystem.h"
#include "Render/RenderAPI.h"

#include "Platforms/OpenGL/OpenGLBuffer.h"

namespace Cober {

	//VertexBuffer* VertexBuffer::Create(uint32_t size)
	//{
	//	switch (RenderAPI::GetAPI())
	//	{
	//		case RenderAPI::API::None:    Logger::Error("RendererAPI::None is currently not supported!"); return nullptr;
	//		case RenderAPI::API::OpenGL:  return new OpenGLVertexBuffer(size);

	//		// Future implementation
	//		//case RenderAPI::API::OpenGLES:	return CreateRef<OpenGLESVertexBuffer>(size)	return nullptr;
	//		//case RenderAPI::API::OpenGLES3:	return CreateRef<OpenGLES3VertexBuffer>(size)	return nullptr;
	//	}

	//	Logger::Error("Unknown RendererAPI!");
	//	return nullptr;
	//}

	VertexBuffer* VertexBuffer::Create(float* vertices, uint32_t size)
	{
		switch (RenderAPI::GetAPI())
		{
			case RenderAPI::API::None:    Logger::Error("RendererAPI::None is currently not supported!"); return nullptr;
			case RenderAPI::API::OpenGL:  return new OpenGLVertexBuffer(vertices, size);

			// Future implementation
			//case RenderAPI::API::OpenGLES:	return CreateRef<OpenGLESVertexBuffer>(vertices, size)	return nullptr;
			//case RenderAPI::API::OpenGLES3:	return CreateRef<OpenGLES3VertexBuffer>(vertices, size)	return nullptr;
		}

		Logger::Error("Unknown RendererAPI!");
		return nullptr;
	}

	IndexBuffer* IndexBuffer::Create(uint32_t* indices, uint32_t size)
	{
		switch (RenderAPI::GetAPI())
		{
			case RenderAPI::API::None:    Logger::Error("RendererAPI::None is currently not supported!"); return nullptr;
			case RenderAPI::API::OpenGL:  return new OpenGLIndexBuffer(indices, size);

			// Future implementation
			//case RenderAPI::API::OpenGLES:	return CreateRef<OpenGLESVertexBuffer>(indices, size)	return nullptr;
			//case RenderAPI::API::OpenGLES3:	return CreateRef<OpenGLES3VertexBuffer>(indices, size)	return nullptr;
		}

		Logger::Error("Unknown RendererAPI!");
		return nullptr;
	}

}