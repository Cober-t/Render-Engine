#include "pch.h"
#include "core/Core.h"
#include "RenderGlobals.h"

namespace Cober {

	//Unique<RenderAPI> RenderGlobals::_api = RenderAPI::Create();
	static Unique<RenderAPI> _api;

	void RenderGlobals::Create() {
		_api = RenderAPI::Create();
	}

	void RenderGlobals::Init() {
		_api->Init();
	}

	void RenderGlobals::SetViewport(uint32_t x, uint32_t y, uint32_t width, uint32_t height) {
		_api->SetViewport(x, y, width, height);
	}

	void RenderGlobals::SetClearColor(const glm::vec4& color) {
		_api->SetClearColor(color);
	}

	void RenderGlobals::SetClearColor(float red, float green, float blue, float black) {
		_api->SetClearColor(red, green, blue, black);
	}

	void RenderGlobals::Clear() {
		_api->Clear();
	}

	void RenderGlobals::DrawIndexed(const Ref<VertexArray>& vertexArray, uint32_t count)
	{
		_api->DrawIndexed(vertexArray, count);
	}
}