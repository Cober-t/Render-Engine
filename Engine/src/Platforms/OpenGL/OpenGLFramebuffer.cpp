#include "pch.h"

#include "OpenGLFramebuffer.h"
#include <GL/glew.h>

namespace Cober {

	static const uint32_t s_MaxFramebufferSize = 8192;

	namespace Utils {

		static GLenum TextureTarget(bool multisampled)
		{
			return multisampled ? GL_TEXTURE_2D_MULTISAMPLE : GL_TEXTURE_2D;
		}

		static void CreateTextures(bool multisampled, uint32_t* outID, uint32_t count)
		{
			glCreateTextures(TextureTarget(multisampled), count, outID);
		}

		static void BindTexture(bool multisampled, uint32_t id)
		{
			glBindTexture(TextureTarget(multisampled), id);
		}

		static void AttachColorTexture(uint32_t id, int samples, GLenum internalFormat, GLenum format, uint32_t width, uint32_t height, int index)
		{
			bool multisampled = samples > 1;
			if (multisampled)
			{
				glTexImage2DMultisample(GL_TEXTURE_2D_MULTISAMPLE, samples, internalFormat, width, height, GL_FALSE);
			}
			else
			{
				glTexImage2D(GL_TEXTURE_2D, 0, internalFormat, width, height, 0, format, GL_UNSIGNED_BYTE, nullptr);

				glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
				glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
				glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_R, GL_CLAMP_TO_EDGE);
				glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
				glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
			}

			glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0 + index, TextureTarget(multisampled), id, 0);
		}

		static void AttachDepthTexture(uint32_t id, int samples, GLenum format, GLenum attachmentType, uint32_t width, uint32_t height)
		{
			bool multisampled = samples > 1;
			if (multisampled)
			{
				glTexImage2DMultisample(GL_TEXTURE_2D_MULTISAMPLE, samples, format, width, height, GL_FALSE);
			}
			else
			{
				glTexStorage2D(GL_TEXTURE_2D, 1, format, width, height);

				glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
				glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
				glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_R, GL_CLAMP_TO_EDGE);
				glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
				glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
			}

			glFramebufferTexture2D(GL_FRAMEBUFFER, attachmentType, TextureTarget(multisampled), id, 0);
		}

		static bool IsDepthFormat(FramebufferTextureFormat format)
		{
			switch (format)
			{
			case FramebufferTextureFormat::DEPTH24STENCIL8:  return true;
			}

			return false;
		}

		static GLenum HazelFBTextureFormatToGL(FramebufferTextureFormat format)
		{
			switch (format)
			{
			case FramebufferTextureFormat::RGBA8:       return GL_RGBA8;
			case FramebufferTextureFormat::RED_INTEGER: return GL_RED_INTEGER;
			}

			//HZ_CORE_ASSERT(false);
			return 0;
		}

	}

	OpenGLFramebuffer::OpenGLFramebuffer(uint32_t width, uint32_t heigth)
	{
		FramebufferSpecification spec;
		spec.Attachments = { 
			FramebufferTextureFormat::RGBA8, 
			FramebufferTextureFormat::RED_INTEGER, 
			FramebufferTextureFormat::Depth 
		};
		spec.Width = 1280;
		spec.Height = 720;
		_specification = spec;

		for (auto spec : _specification.Attachments.Attachments) {
			if (!Utils::IsDepthFormat(spec.TextureFormat))
				_colorAttachmentSpecifications.emplace_back(spec);
			else
				_depthAttachmentSpecification = spec;
		}

		Invalidate();
	}

	OpenGLFramebuffer::~OpenGLFramebuffer()
	{
		glDeleteFramebuffers(1, &_renderID);
		glDeleteTextures(_colorAttachments.size(), _colorAttachments.data());
		glDeleteTextures(1, &_depthAttachment);
	}

	void OpenGLFramebuffer::Invalidate()
	{
		if (_renderID)
		{
			glDeleteFramebuffers(1, &_renderID);
			glDeleteTextures(_colorAttachments.size(), _colorAttachments.data());
			glDeleteTextures(1, &_depthAttachment);

			_colorAttachments.clear();
			_depthAttachment = 0;
		}

		glCreateFramebuffers(1, &_renderID);
		glBindFramebuffer(GL_FRAMEBUFFER, _renderID);

		bool multisample = _specification.Samples > 1;

		// Attachments
		if (_colorAttachmentSpecifications.size())
		{
			_colorAttachments.resize(_colorAttachmentSpecifications.size());
			Utils::CreateTextures(multisample, _colorAttachments.data(), _colorAttachments.size());

			for (size_t i = 0; i < _colorAttachments.size(); i++)
			{
				Utils::BindTexture(multisample, _colorAttachments[i]);
				switch (_colorAttachmentSpecifications[i].TextureFormat)
				{
				case FramebufferTextureFormat::RGBA8:
					Utils::AttachColorTexture(_colorAttachments[i], _specification.Samples, GL_RGBA8, GL_RGBA, _specification.Width, _specification.Height, i);
					break;
				case FramebufferTextureFormat::RED_INTEGER:
					Utils::AttachColorTexture(_colorAttachments[i], _specification.Samples, GL_R32I, GL_RED_INTEGER, _specification.Width, _specification.Height, i);
					break;
				}
			}
		}

		if (_depthAttachmentSpecification.TextureFormat != FramebufferTextureFormat::None)
		{
			Utils::CreateTextures(multisample, &_depthAttachment, 1);
			Utils::BindTexture(multisample, _depthAttachment);
			switch (_depthAttachmentSpecification.TextureFormat)
			{
			case FramebufferTextureFormat::DEPTH24STENCIL8:
				Utils::AttachDepthTexture(_depthAttachment, _specification.Samples, GL_DEPTH24_STENCIL8, GL_DEPTH_STENCIL_ATTACHMENT, _specification.Width, _specification.Height);
				break;
			}
		}

		if (_colorAttachments.size() > 1)
		{
			//HZ_CORE_ASSERT(m_ColorAttachments.size() <= 4);
			GLenum buffers[4] = { GL_COLOR_ATTACHMENT0, GL_COLOR_ATTACHMENT1, GL_COLOR_ATTACHMENT2, GL_COLOR_ATTACHMENT3 };
			glDrawBuffers(_colorAttachments.size(), buffers);
		}
		else if (_colorAttachments.empty())
		{
			// Only depth-pass
			glDrawBuffer(GL_NONE);
		}

		//HZ_CORE_ASSERT(glCheckFramebufferStatus(GL_FRAMEBUFFER) == GL_FRAMEBUFFER_COMPLETE, "Framebuffer is incomplete!");

		glBindFramebuffer(GL_FRAMEBUFFER, 0);
	}

	void OpenGLFramebuffer::Bind()
	{
		glBindFramebuffer(GL_FRAMEBUFFER, _renderID);
		glViewport(0, 0, _specification.Width, _specification.Height);
	}

	void OpenGLFramebuffer::Unbind()
	{
		glBindFramebuffer(GL_FRAMEBUFFER, 0);
	}

	void OpenGLFramebuffer::Resize(uint32_t width, uint32_t height)
	{
		if (width == 0 || height == 0 || width > s_MaxFramebufferSize || height > s_MaxFramebufferSize)
		{
			//HZ_CORE_WARN("Attempted to rezize framebuffer to {0}, {1}", width, height);
			return;
		}
		_specification.Width = width;
		_specification.Height = height;

		Invalidate();
	}

	int OpenGLFramebuffer::ReadPixel(uint32_t attachmentIndex, int x, int y)
	{
		//HZ_CORE_ASSERT(attachmentIndex < m_ColorAttachments.size());

		glReadBuffer(GL_COLOR_ATTACHMENT0 + attachmentIndex);
		int pixelData;
		glReadPixels(x, y, 1, 1, GL_RED_INTEGER, GL_INT, &pixelData);
		return pixelData;

	}

	void OpenGLFramebuffer::ClearAttachment(uint32_t attachmentIndex, int value)
	{
		//HZ_CORE_ASSERT(attachmentIndex < m_ColorAttachments.size());

		auto& spec = _colorAttachmentSpecifications[attachmentIndex];
		glClearTexImage(_colorAttachments[attachmentIndex], 0,
			Utils::HazelFBTextureFormatToGL(spec.TextureFormat), GL_INT, &value);
	}

}