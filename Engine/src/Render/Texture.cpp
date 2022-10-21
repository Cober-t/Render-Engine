#include "pch.h"
#include "Texture.h"

#include "Render/RenderAPI.h"
#include "Systems/RenderSystem.h"

#include "Platforms/OpenGL/OpenGLTexture.h"

namespace Cober {

	Ref<Texture> Texture::Create(uint32_t width, uint32_t height)
	{
		switch (RenderAPI::GetAPI())
		{
			case RenderAPI::API::None:    Logger::Warning("RendererAPI::None is currently not supported!"); return nullptr;
			case RenderAPI::API::OpenGL:  return CreateRef<OpenGLTexture>(width, height);

			// Future implementation
			//case RenderAPI::API::OpenGLES:	return CreateRef<OpenGLESTexture>(width, height)	return nullptr;
			//case RenderAPI::API::OpenGLES3:	return CreateRef<OpenGLES3Texture>(width, height)	return nullptr;
		}

		Logger::Log("Unknown RendererAPI!");
		return nullptr;
	}

	Ref<Texture> Texture::Create(const std::string& path)
	{
		switch (RenderAPI::GetAPI())
		{
			case RenderAPI::API::None:    Logger::Warning("RendererAPI::None is currently not supported!"); return nullptr;
			case RenderAPI::API::OpenGL:  return CreateRef<OpenGLTexture>(path);

			// Future implementation
			//case RenderAPI::API::OpenGLES:	return CreateRef<OpenGLESTexture>(path)	return nullptr;
			//case RenderAPI::API::OpenGLES3:	return CreateRef<OpenGLES3Texture>(path)	return nullptr;
		}

		Logger::Log("Unknown RendererAPI!");
		return nullptr;
	}
}