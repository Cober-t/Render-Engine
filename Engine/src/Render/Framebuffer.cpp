#include "pch.h"

#include <GL/glew.h>

#include "Framebuffer.h"

namespace Cober {

	static const uint32_t _MaxFramebufferSize = 8192;

	Framebuffer::Framebuffer(const FramebufferSpecification& spec) 
		: _Specification(spec)
	{
		Invalidate();
	}

	Ref<Framebuffer> Framebuffer::Create(uint32_t width, uint32_t height) {

		FramebufferSpecification fbSpec;
		fbSpec.Width = width;
		fbSpec.Height = height;
		return CreateRef<Framebuffer>(fbSpec);
	}

	Framebuffer::~Framebuffer()
	{
		glDeleteFramebuffers(1, &_RendererID);
		glDeleteTextures(1, &_ColorAttachment);
		glDeleteTextures(1, &_DepthAttachment);
	}

	void Framebuffer::Bind()
	{
		glBindFramebuffer(GL_FRAMEBUFFER, _RendererID);
		glViewport(0, 0, _Specification.Width, _Specification.Height);
	}

	void Framebuffer::Unbind()
	{
		glBindFramebuffer(GL_FRAMEBUFFER, 0);
	}

	void Framebuffer::Invalidate()
	{
		if (_RendererID)
		{
			glDeleteFramebuffers(1, &_RendererID);
			glDeleteTextures(1, &_ColorAttachment);
			glDeleteTextures(1, &_DepthAttachment);
		}

		glCreateFramebuffers(1, &_RendererID);
		glBindFramebuffer(GL_FRAMEBUFFER, _RendererID);

		glCreateTextures(GL_TEXTURE_2D, 1, &_ColorAttachment);
		glBindTexture(GL_TEXTURE_2D, _ColorAttachment);
		glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA8, _Specification.Width, _Specification.Height, 0, GL_RGBA, GL_UNSIGNED_BYTE, nullptr);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

		glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, _ColorAttachment, 0);

		glCreateTextures(GL_TEXTURE_2D, 1, &_DepthAttachment);
		glBindTexture(GL_TEXTURE_2D, _DepthAttachment);
		glTexStorage2D(GL_TEXTURE_2D, 1, GL_DEPTH24_STENCIL8, _Specification.Width, _Specification.Height);
		//glTexImage2D(GL_TEXTURE_2D, 0, GL_DEPTH24_STENCIL8, _Specification.Width, _Specification.Height, 0,
		// 	GL_DEPTH_STENCIL, GL_UNSIGNED_INT_24_8, NULL);
		glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_STENCIL_ATTACHMENT, GL_TEXTURE_2D, _DepthAttachment, 0);

		if(glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE)
			LOG("Framebuffer is incomplete!");

		glBindFramebuffer(GL_FRAMEBUFFER, 0);
	}

	void Framebuffer::Resize(uint32_t width, uint32_t height) {

		glm::vec2 _ViewportSize{ 0, 0 };
		if (FramebufferSpecification spec = GetSpecification();
			_ViewportSize.x > 0.0f && _ViewportSize.y > 0.0f && // zero sized framebuffer is invalid
			(spec.Width != _ViewportSize.x || spec.Height != _ViewportSize.y))
		{
			//Resize((uint32_t)_ViewportSize.x, (uint32_t)_ViewportSize.y);
			if (width == 0 || height == 0 || width > _MaxFramebufferSize || height > _MaxFramebufferSize)
			{
				LOG("Attempted to rezize framebuffer bigger than it could be");
				return;
			}
			_Specification.Width = width;
			_Specification.Height = height;

			Invalidate();
		}
	}
}

