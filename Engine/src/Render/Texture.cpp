#include "pch.h"
#include "Texture.h"

#include "Render/RenderAPI.h"
#include "Systems/RenderSystem.h"

#ifndef __EMSCRIPTEN__
#include "Platforms/OpenGL/OpenGLTexture.h"
#endif
#include "Platforms/OpenGLES3/OpenGLES3Texture.h"

namespace Cober {

	Ref<Texture> Texture::Create(uint32_t width, uint32_t height)
	{
		switch (RenderAPI::GetAPI())
		{
#ifndef __EMSCRIPTEN__
			case RenderAPI::API::None:    LOG_WARNING("RendererAPI::None is currently not supported!"); return nullptr;
			case RenderAPI::API::OpenGL:  break; // return CreateRef<OpenGLTexture>(width, height);
#else		
			case RenderAPI::API::None:			LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGL:		LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGLES:		break; //return CreateRef<OpenGLESTexture>(width, height);
			case RenderAPI::API::OpenGLES3:		break; //return CreateRef<OpenGLES3Texture>(width, height);
			default:	LOG_ERROR("Unknown RendererAPI!"); break;
#endif
		}
		return nullptr;
	}

	Ref<Texture> Texture::Create(const std::string& path)
	{
		switch (RenderAPI::GetAPI())
		{
#ifndef __EMSCRIPTEN__
			case RenderAPI::API::None:    LOG_WARNING("RendererAPI::None is currently not supported!"); return nullptr;
			case RenderAPI::API::OpenGL:  break; // return CreateRef<OpenGLTexture>(path);
#else		
			case RenderAPI::API::None:			LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGL:		LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGLES:		break; //return CreateRef<OpenGLESTexture>(path);
			case RenderAPI::API::OpenGLES3:		break; //return CreateRef<OpenGLES3Texture>(path);
			default:	LOG_ERROR("Unknown RendererAPI!"); break;
#endif
		}
		return nullptr;
	}
}