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
			case RenderAPI::API::None:    LOG_ERROR("RendererAPI::None is currently not supported!"); return nullptr;
			case RenderAPI::API::OpenGL:  return CreateRef<OpenGLVertexBuffer>(size);
#else
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
#ifndef __EMSCRIPTEN__
			case RenderAPI::API::None:    LOG_ERROR("RendererAPI::None is currently not supported!"); return nullptr;
			case RenderAPI::API::OpenGL:  return CreateRef<OpenGLVertexBuffer>(vertices, size);
#else
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
#ifndef __EMSCRIPTEN__
			case RenderAPI::API::None:    LOG_ERROR("RendererAPI::None is currently not supported!"); return nullptr;
			case RenderAPI::API::OpenGL:  return CreateRef<OpenGLIndexBuffer>(indices, size);
#else
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

	Ref<UniformBuffer> UniformBuffer::Create(uint32_t size, uint32_t binding)
	{
#ifndef __EMSCRIPTEN__
		switch (RenderAPI::GetAPI()) 
		{
		case RenderAPI::API::None:    LOG_ERROR("RendererAPI::None is currently not supported!"); return nullptr;
		case RenderAPI::API::OpenGL:  return CreateRef<OpenGLUniformBuffer>(size, binding);
		default:	LOG_ERROR("Unknown RendererAPI!"); break;
		}
#endif
		return nullptr;
	}
}