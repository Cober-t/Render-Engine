#pragma once

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

		uint32_t GetColorAttachmentRendererID() override { return _ColorAttachment; }
		const FramebufferSpecification& GetSpecification() override { return _Specification; }
		void SetSpecificationWidth(const uint32_t width) override { _Specification.Width = width; }
		void SetSpecificationHeight(const uint32_t height) override { _Specification.Height = height; }
	private:
		uint32_t _RendererID = 0;
		uint32_t _ColorAttachment = 0, _DepthAttachment = 0;
		FramebufferSpecification _Specification;
	};
}