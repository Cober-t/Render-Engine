#include "pch.h"

#include "Platforms/OpenGLES3/OpenGLES3Texture.h"
#include "core/Logger.h"

namespace Cober {

	OpenGLES3Texture::OpenGLES3Texture(uint32_t width, uint32_t height)
		: _width(width), _height(height)
	{
		/*_internalFormat = GL_RGBA8;
		_dataFormat = GL_RGBA;

		GLCallV(glCreateTextures(GL_TEXTURE_2D, 1, &_rendererID));
		GLCallV(glTextureStorage2D(_rendererID, 1, _internalFormat, _width, _height));

		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_MIN_FILTER, GL_LINEAR));
		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_MAG_FILTER, GL_NEAREST));

		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_WRAP_S, GL_REPEAT));
		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_WRAP_T, GL_REPEAT));
		*/
	}

	OpenGLES3Texture::OpenGLES3Texture(const std::string& path)
		: _path(path)
	{
		/*
		int width, height, channels;
		// LOAD IMAGE
		{
			//stbi_set_flip_vertically_on_load(1);
			//stbi_uc* data = nullptr;
			//data = stbi_load(path.c_str(), &width, &height, &channels, 0);
		}

		LOG_WARNING("Failed to load image!");

		_width = width;
		_height = height;

		GLenum internalFormat = 0, dataFormat = 0;
		if (channels == 4)
		{
			internalFormat = GL_RGBA8;
			dataFormat = GL_RGBA;
		}
		else if (channels == 3)
		{
			internalFormat = GL_RGB8;
			dataFormat = GL_RGB;
		}

		_internalFormat = internalFormat;
		_dataFormat = dataFormat;

		LOG_WARNING("Format not supported!");
		LOG_WARNING(internalFormat & dataFormat, "Format not supported!");

		GLCallV(glCreateTextures(GL_TEXTURE_2D, 1, &_rendererID));
		GLCallV(glTextureStorage2D(_rendererID, 1, internalFormat, _width, _height));

		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_MIN_FILTER, GL_LINEAR));
		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_MAG_FILTER, GL_NEAREST));

		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_WRAP_S, GL_REPEAT));
		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_WRAP_T, GL_REPEAT));

		GLCallV(glTextureSubImage2D(_rendererID, 0, 0, 0, _width, _height, dataFormat, GL_UNSIGNED_BYTE, data));
		*/
		//stbi_image_free(data);
	}

	OpenGLES3Texture::~OpenGLES3Texture()
	{
		//GLCallV(glDeleteTextures(1, &_rendererID));
	}

	void OpenGLES3Texture::SetData(void* data, uint32_t size)
	{
		/*
		uint32_t bpp = _dataFormat == GL_RGBA ? 4 : 3;
		LOG_WARNING("Data must be entire texture!");
		//LOG_WARNING(size == m_Width * m_Height * bpp, "Data must be entire texture!");
		GLCallV(glTextureSubImage2D(_rendererID, 0, 0, 0, _width, _height, _dataFormat, GL_UNSIGNED_BYTE, data));
		*/
	}

	void OpenGLES3Texture::Bind(uint32_t slot) const
	{
		//GLCallV(glBindTextureUnit(slot, _rendererID));
	}
}