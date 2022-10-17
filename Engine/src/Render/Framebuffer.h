#pragma once

#include "core/Core.h"

namespace Cober { 

	struct FramebufferSpecification
	{
		uint32_t Width, Height;
		// FramebufferFormat Format = 
		uint32_t Samples = 1;

		bool SwapChainTarget = false;
	};

	class Framebuffer {
	public:
		virtual ~Framebuffer() = default;

		static Ref<Framebuffer> Create(uint32_t width, uint32_t height);

		virtual void Bind() = 0;
		virtual void Unbind() = 0;

		virtual void Invalidate() = 0;

		virtual void Resize(uint32_t width, uint32_t height) = 0;

		virtual uint32_t GetColorAttachmentRendererID() = 0;
		virtual const FramebufferSpecification& GetSpecification() = 0;
		virtual void SetSpecificationWidth(const uint32_t width) = 0;
		virtual void SetSpecificationHeight(const uint32_t height) = 0;
	//private:
	//	uint32_t _RendererID = 0;
	//	uint32_t _ColorAttachment = 0, _DepthAttachment = 0;
	//	FramebufferSpecification _Specification;
	};
}