#include "pch.h"
#include "Buffer.h"

#include "Systems/RenderSystem.h"
#include "Render/RenderAPI.h"

#if !defined __EMSCRIPTEN__ && !defined __OPENGLES3__
	#include "Platforms/OpenGL/OpenGLBuffer.h"
#elif defined __EMSCRIPTEN__ || __OPENGLES3__
	#include "Platforms/OpenGLES3/OpenGLES3Buffer.h"
#endif

namespace Cober {

	Ref<VertexBuffer> VertexBuffer::Create(uint32_t size)
	{
		switch (RenderAPI::GetAPI())
		{
#if !defined __EMSCRIPTEN__ && !defined __OPENGLES3__
			case RenderAPI::API::None:    LOG_ERROR("RendererAPI::None is currently not supported!"); return nullptr;
			case RenderAPI::API::OpenGL:  return CreateRef<OpenGLVertexBuffer>(size);
#elif defined __EMSCRIPTEN__ || __OPENGLES3__
			case RenderAPI::API::None:		LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGL:	LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGLES:	LOG_ERROR("Wrong API");	break;
			case RenderAPI::API::OpenGLES3:	return CreateRef<OpenGLES3VertexBuffer>(size);
			default:	LOG_ERROR("Unknown RendererAPI!"); break;
#endif
		}

		return nullptr;
	}

	Ref<VertexBuffer> VertexBuffer::Create(float* vertices, uint32_t size)
	{
		switch (RenderAPI::GetAPI())
		{
#if !defined __EMSCRIPTEN__ && !defined __OPENGLES3__
			case RenderAPI::API::None:    LOG_ERROR("RendererAPI::None is currently not supported!"); return nullptr;
			case RenderAPI::API::OpenGL:  return CreateRef<OpenGLVertexBuffer>(vertices, size);
#elif defined __EMSCRIPTEN__ || __OPENGLES3__
			case RenderAPI::API::None:		LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGL:	LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGLES:	LOG_ERROR("Wrong API");	break;
			case RenderAPI::API::OpenGLES3:	return CreateRef<OpenGLES3VertexBuffer>(vertices, size);
			default:	LOG_ERROR("Unknown RendererAPI!"); break;
#endif
		}

		LOG_ERROR("Unknown RendererAPI!");
		return nullptr;
	}

	Ref<IndexBuffer> IndexBuffer::Create(uint32_t* indices, uint32_t size)
	{
		switch (RenderAPI::GetAPI())
		{
#if !defined __EMSCRIPTEN__ && !defined __OPENGLES3__
			case RenderAPI::API::None:    LOG_ERROR("RendererAPI::None is currently not supported!"); return nullptr;
			case RenderAPI::API::OpenGL:  return CreateRef<OpenGLIndexBuffer>(indices, size);
#elif defined __EMSCRIPTEN__ || __OPENGLES3__
			case RenderAPI::API::None:		LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGL:	LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGLES:	LOG_ERROR("Wrong API");	break;
			case RenderAPI::API::OpenGLES3:	return CreateRef<OpenGLES3IndexBuffer>(indices, size);
			default:	LOG_ERROR("Unknown RendererAPI!"); break;
#endif
		}

		LOG_ERROR("Unknown RendererAPI!");
		return nullptr;
	}

#ifdef __OPENGL__
	Ref<UniformBuffer> UniformBuffer::Create(uint32_t size, uint32_t binding)
	{
		switch (RenderAPI::GetAPI())
		{
			case RenderAPI::API::None:    Logger::Error("RendererAPI::None is currently not supported!"); return nullptr;
			case RenderAPI::API::OpenGL:  return CreateRef<OpenGLUniformBuffer>(size, binding);
		}

		Logger::Error("Unknown RendererAPI!");
		return nullptr;
	}
#endif
}