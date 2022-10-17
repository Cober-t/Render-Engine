#pragma once

#include "Render/Framebuffer.h"

namespace Cober { 

	class OpenGLFramebuffer : public Framebuffer {
	public:
		OpenGLFramebuffer(uint32_t width, uint32_t height);
		virtual ~OpenGLFramebuffer();

		virtual void Bind() override;
		virtual void Unbind() override;

		virtual void Invalidate() override;

		virtual void Resize(uint32_t width, uint32_t height) override;
		
		virtual uint32_t GetColorAttachmentRendererID() override { return _ColorAttachment; }
		virtual const FramebufferSpecification& GetSpecification() override { return _Specification; }
		virtual void SetSpecificationWidth(const uint32_t width) override { _Specification.Width = width; }
		virtual void SetSpecificationHeight(const uint32_t height) override { _Specification.Height = height; }
	private:
		uint32_t _RendererID = 0;
		uint32_t _ColorAttachment = 0, _DepthAttachment = 0;
		FramebufferSpecification _Specification;
	};
}