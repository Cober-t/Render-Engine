#pragma once
#include "Render/RenderAPI.h"

namespace Cober {

	class OpenGLRenderAPI : public RenderAPI {
	public:
		virtual void Init() override;
		virtual void SetViewport(uint32_t x, uint32_t y, uint32_t width, uint32_t height) override;
		virtual void SetClearColor(const glm::vec4& color) override;
		virtual void SetClearColor(float red, float green, float blue, float black) override;
		virtual void Clear() override;
	};
}