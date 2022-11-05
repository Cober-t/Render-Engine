#include "pch.h"

#include "core/Core.h"
#include "Render/RenderAPI.h"
#include "GraphicsContext.h"

#ifndef __EMSCRIPTEN__
#include "Platforms/OpenGL/OpenGLContext.h"
#endif
#include "Platforms/OpenGLES3/OpenGLES3Context.h"

namespace Cober {

	Unique<GraphicsContext> GraphicsContext::Create(void* window) {
	
		switch (RenderAPI::GetAPI()) {
#ifndef __EMSCRIPTEN__
			case RenderAPI::API::None:		Logger::Error("RenderAPI::None means there is not render defined!!");		return nullptr;
			case RenderAPI::API::OpenGL:	return CreateUnique<OpenGLContext>(static_cast<SDL_Window*>(window));
#endif
			// Future implementation
			//case RenderAPI::API::OpenGLES:	return CreateUnique<OpenGLESContext>();
			case RenderAPI::API::OpenGLES3:	return CreateUnique<OpenGLES3Context>(static_cast<SDL_Window*>(window));
		}
		Logger::Error("Unknown Context RenderAPI!");
		return nullptr;
	}
}