#pragma once

struct FramebufferSpecification
{
	uint32_t Width, Height;
	// FramebufferFormat Format = 
	uint32_t Samples = 1;

	bool SwapChainTarget = false;
};


class Framebuffer {
public:
	Framebuffer(const FramebufferSpecification& spec);
	~Framebuffer();

	void Bind();
	void Unbind();

	void Invalidate();

	void Resize(uint32_t width, uint32_t height);
	static Ref<Framebuffer> Create(uint32_t width, uint32_t heith);

	uint32_t GetColorAttachmentRendererID() { return _ColorAttachment; }
	const FramebufferSpecification& GetSpecification() { return _Specification; }
private:
	uint32_t _RendererID = 0;
	uint32_t _ColorAttachment = 0, _DepthAttachment = 0;
	FramebufferSpecification _Specification;
};