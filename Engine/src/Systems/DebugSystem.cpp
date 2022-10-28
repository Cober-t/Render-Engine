#include "pch.h"

#include "DebugSystem.h"
#include "Platforms/OpenGL/OpenGLDebugPhysics.h"

#include "core/Core.h"

namespace Cober {

	DebugSystem* DebugSystem::Create() {

		switch (RenderAPI::GetAPI()) {
		case RenderAPI::API::None:		Logger::Log("RenderAPI::None means there is not render defined!!"); return nullptr;
		case RenderAPI::API::OpenGL:	return new OpenGLDebugPhysics();

			// Future implementation
			//case RenderAPI::API::OpenGLES:	return CreateUnique<OpenGLESRenderAPI>()	return nullptr;
			//case RenderAPI::API::OpenGLES3:	return CreateUnique<OpenGLES3RenderAPI>()	return nullptr;
		}
		Logger::Error("Unknown RenderAPI!");
		return nullptr;
	}
}