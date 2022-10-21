#pragma once

#include "core/Core.h"
#include "Render/VertexArray.h"

#include <glm/glm.hpp>

namespace Cober {

	class RenderAPI {
	public:
		enum class API {
			None = 0, OpenGL = 1, OpenGLES, OpenGLES3
		};
	public:
		virtual ~RenderAPI() = default;
		virtual void Init() = 0;
		virtual void SetViewport(uint32_t x, uint32_t y, uint32_t width, uint32_t heigth) = 0;
		virtual void SetClearColor(const glm::vec4& color) = 0;
		virtual void SetClearColor(float red, float green, float blue, float black) = 0;
		virtual void Clear() = 0;
		virtual void DrawIndexed(const Ref<VertexArray>& vertexArray, uint32_t indexCount = 0) = 0;

		static API GetAPI() { return _api; }
		static Unique<RenderAPI> Create();
	private:
		static API _api;
	};
}
