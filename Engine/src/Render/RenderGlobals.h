#pragma once

#include "RenderAPI.h"

namespace Cober {

	class RenderGlobals {
	public:
		
	public:
		static void Init() {
			_api->Init();
		}

		static void SetViewport(uint32_t x, uint32_t y, uint32_t width, uint32_t height) {
			_api->SetViewport(x, y, width, height);
		}

		static void SetClearColor(const glm::vec4& color) {
			_api->SetClearColor(color);
		}

		static void SetClearColor(float red, float green, float blue, float black) {
			_api->SetClearColor(red, green, blue, black);
		}

		static void Clear() {
			_api->Clear();
		}

	private:
		static Unique<RenderAPI> _api;
	};
}
