#pragma once

#ifdef __EMSCRIPTEN__
#include <SDL/SDL_opengles2.h>

#include "core/Window.h"
#include "Render/Framebuffer.h"

namespace Cober { 

	class OpenGLES3Framebuffer : public Framebuffer {
	public:
		OpenGLES3Framebuffer(uint32_t width, uint32_t height);
		virtual ~OpenGLES3Framebuffer();

		virtual void Bind() override;
		virtual void Unbind() override;

		virtual void Invalidate() override;

		virtual void Resize(uint32_t width, uint32_t height) override;
		virtual int ReadPixel(uint32_t attachmentIndex, int x, int y) override;

		virtual void ClearAttachment(uint32_t attachmentIndex, int value) override;

		virtual const FramebufferSpecification& GetSpecification() override { return _specification; }
		virtual uint32_t GetColorAttachmentRenderID(uint32_t index = 0) const override { if (index < _colorAttachments.size()) { return _colorAttachments[index]; } }
	private:
		uint32_t _renderID = 0;
		FramebufferSpecification _specification;

		std::vector<FramebufferTextureSpecification> _colorAttachmentSpecifications;
		FramebufferTextureSpecification _depthAttachmentSpecification = FramebufferTextureFormat::None;

		std::vector<uint32_t> _colorAttachments;
		uint32_t _depthAttachment = 0;
	};
}

#endif