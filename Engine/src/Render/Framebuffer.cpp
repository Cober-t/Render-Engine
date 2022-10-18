#include "pch.h"

#include "Render/RenderAPI.h"
#include "Framebuffer.h"
#include "Platforms/OpenGL/OpenGLFramebuffer.h"
//#include "Platforms/OpenGLES/OpenGLESFramebuffer.h"
//#include "Platforms/OpenGLES3/OpenGLES3Framebuffer.h"

namespace Cober {

	Ref<Framebuffer> Framebuffer::Create(uint32_t width, uint32_t height) {

		switch (RenderAPI::GetAPI()) {
			case RenderAPI::API::None:		Logger::Log("RenderAPI::None means there is not render defined!!");		return nullptr;
			case RenderAPI::API::OpenGL:	return CreateRef<OpenGLFramebuffer>(width, height);

			// Future implementation
			//case RenderAPI::API::OpenGLES:	return CreateUnique<OpenGLESFramebuffer>(spec)	return nullptr;
			//case RenderAPI::API::OpenGLES3:	return CreateUnique<OpenGLES3Framebuffer>(spec)	return nullptr;
		}
		Logger::Error("Unknown Framebuffer RenderAPI!");
		return nullptr;
	}
}

