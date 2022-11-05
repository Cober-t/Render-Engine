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
			case RenderAPI::API::None:    Logger::Warning("RendererAPI::None is currently not supported!"); return nullptr;
			case RenderAPI::API::OpenGL:  return CreateRef<OpenGLTexture>(width, height);
#endif

			// Future implementation
			//case RenderAPI::API::OpenGLES:	return CreateRef<OpenGLESTexture>(width, height);
			//case RenderAPI::API::OpenGLES3:	return CreateRef<OpenGLES3Texture>(width, height);
		}

		Logger::Log("Unknown RendererAPI!");
		return nullptr;
	}

	Ref<Texture> Texture::Create(const std::string& path)
	{
		switch (RenderAPI::GetAPI())
		{
#ifndef __EMSCRIPTEN__
			case RenderAPI::API::None:    Logger::Warning("RendererAPI::None is currently not supported!"); return nullptr;
			case RenderAPI::API::OpenGL:  return CreateRef<OpenGLTexture>(path);
#endif

			// Future implementation
			//case RenderAPI::API::OpenGLES:	return CreateRef<OpenGLESTexture>(path);
			//case RenderAPI::API::OpenGLES3:	return CreateRef<OpenGLES3Texture>(path);
		}

		Logger::Log("Unknown RendererAPI!");
		return nullptr;
	}
}