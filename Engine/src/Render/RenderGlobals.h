#pragma once
#include "core/Core.h"
#include "RenderAPI.h"

namespace Cober {

	class RenderGlobals {
	public:
		static void Create();
		static void Init();
		static void SetViewport(uint32_t x, uint32_t y, uint32_t width, uint32_t height);
		static void SetClearColor(glm::vec4 color);
		static void SetClearColor(float red, float green, float blue, float black);
		static void Clear();
		static void DrawIndexed(const Ref<VertexArray>& vertexArray, uint32_t count = 0);
	};
}
