#include "pch.h"

#include "core/Core.h"
#include "Render/RenderAPI.h"
#include "GraphicsContext.h"

#include "Platforms/OpenGL/OpenGLContext.h"

namespace Cober {

	Unique<GraphicsContext> GraphicsContext::Create(void* window) {
	
		switch (RenderAPI::GetAPI()) {
			case RenderAPI::API::None:		Logger::Log("RenderAPI::None means there is not render defined!!");		return nullptr;
			case RenderAPI::API::OpenGL:	return CreateUnique<OpenGLContext>(static_cast<SDL_Window*>(window));

			// Future implementation
			//case RenderAPI::API::OpenGLES:	return CreateUnique<OpenGLESContext>()	return nullptr;
			//case RenderAPI::API::OpenGLES3:	return CreateUnique<OpenGLES3Context>()	return nullptr;
		}
		Logger::Error("Unknown Context RenderAPI!");
		return nullptr;
	}
}