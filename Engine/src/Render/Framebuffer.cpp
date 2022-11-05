#include "pch.h"

#include "Render/RenderAPI.h"
#include "Framebuffer.h"
#ifndef __EMSCRIPTEN__
#include "Platforms/OpenGL/OpenGLFramebuffer.h"
#endif
//#include "Platforms/OpenGLES/OpenGLESFramebuffer.h"
//#include "Platforms/OpenGLES3/OpenGLES3Framebuffer.h"

namespace Cober {

	Ref<Framebuffer> Framebuffer::Create(uint32_t width, uint32_t height) {

		switch (RenderAPI::GetAPI()) {
#ifndef __EMSCRIPTEN__
			case RenderAPI::API::None:		Logger::Error("RenderAPI::None means there is not render defined!!");		return nullptr;
			case RenderAPI::API::OpenGL:	return CreateRef<OpenGLFramebuffer>(width, height);
#endif

			// Future implementation
			//case RenderAPI::API::OpenGLES:	return CreateRef<OpenGLESFramebuffer>(spec)	return nullptr;
			//case RenderAPI::API::OpenGLES3:	return CreateRef<OpenGLES3Framebuffer>(spec)	return nullptr;
		}
		Logger::Error("Unknown Framebuffer RenderAPI!");
		return nullptr;
	}
}

