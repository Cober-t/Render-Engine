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
			case RenderAPI::API::None:		LOG_ERROR("RenderAPI::None means there is not render defined!!");		return nullptr;
			case RenderAPI::API::OpenGL:	return CreateRef<OpenGLFramebuffer>(width, height);
#else
			case RenderAPI::API::None:		LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGL:	LOG_ERROR("Wrong API"); break;
			case RenderAPI::API::OpenGLES:	break; //return CreateRef<OpenGLESFramebuffer>(spec);
			case RenderAPI::API::OpenGLES3:	break; //return CreateRef<OpenGLES3Framebuffer>(spec);
			default:	LOG_ERROR("Unknown RendererAPI!"); break;
#endif
		}
		LOG_ERROR("Unknown Framebuffer RenderAPI!");
		return nullptr;
	}
}

