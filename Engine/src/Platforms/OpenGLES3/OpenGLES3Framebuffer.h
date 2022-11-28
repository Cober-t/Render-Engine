#pragma once

#ifdef __EMSCRIPTEN__
#include <SDL/SDL_opengles2.h>

#include "core/Window.h"
#include "Render/Framebuffer.h"

namespace Cober { 

	class OpenGLES3Framebuffer : public Framebuffer {
	public:
		OpenGLES3Framebuffer(const FramebufferSpecification& spec);
		~OpenGLES3Framebuffer() override;

		void Bind() override;
		void Unbind() override;

		void Invalidate() override;

		void Resize(uint32_t width, uint32_t height) override;

		uint32_t GetColorAttachmentRenderID(uint32_t index = 0) const override { return _ColorAttachments; }
		const FramebufferSpecification& GetSpecification() override { return _Specification; }
		void SetSpecificationWidth(const uint32_t width) override { _Specification.Width = width; }
		void SetSpecificationHeight(const uint32_t height) override { _Specification.Height = height; }
	private:
		uint32_t _RendererID = 0;
		uint32_t _ColorAttachments = 0, _DepthAttachment = 0;
		FramebufferSpecification _Specification;
	};
}

#endif