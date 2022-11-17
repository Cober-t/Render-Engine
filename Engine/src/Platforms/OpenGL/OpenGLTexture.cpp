#include "pch.h"

#include "Platforms/OpenGL/OpenGLTexture.h"

namespace Cober {

	OpenGLTexture::OpenGLTexture(uint32_t width, uint32_t height)
		: _width(width), _height(height)
	{
		_internalFormat = GL_RGBA8;
		_dataFormat = GL_RGBA;

		GLCallV(glCreateTextures(GL_TEXTURE_2D, 1, &_rendererID));
		GLCallV(glTextureStorage2D(_rendererID, 1, _internalFormat, _width, _height));

		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_MIN_FILTER, GL_LINEAR));
		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_MAG_FILTER, GL_LINEAR));

		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_WRAP_S, GL_REPEAT));
		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_WRAP_T, GL_REPEAT));
	}

	void FlipSurface(SDL_Surface* surface)
	{
		SDL_LockSurface(surface);

		int pitch = surface->pitch; // row size
		char* temp = new char[pitch]; // intermediate buffer
		char* pixels = (char*)surface->pixels;

		for (int i = 0; i < surface->h / 2; ++i) {
			// get pointers to the two rows to swap
			char* row1 = pixels + i * pitch;
			char* row2 = pixels + (surface->h - i - 1) * pitch;

			// swap rows
			memcpy(temp, row1, pitch);
			memcpy(row1, row2, pitch);
			memcpy(row2, temp, pitch);
		}

		delete[] temp;

		SDL_UnlockSurface(surface);
	}

	OpenGLTexture::OpenGLTexture(const std::string& path)
		: _path(path)
	{
		// LOAD IMAGE
		SDL_Surface* texSurface = IMG_Load(path.c_str());
		std::cout << path.c_str() << std::endl;
		FlipSurface(texSurface);

		if (!texSurface)
			LOG_ERROR("Failed to load image!");
		
		_width  = texSurface->w;
		_height = texSurface->h;

		int channels = texSurface->format->BytesPerPixel;
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

		GLCallV(glCreateTextures(GL_TEXTURE_2D, 1, &_rendererID));
		GLCallV(glTextureStorage2D(_rendererID, 1, internalFormat, _width, _height));

		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_MIN_FILTER, GL_LINEAR));
		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_MAG_FILTER, GL_LINEAR));

		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_WRAP_S, GL_REPEAT));
		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_WRAP_T, GL_REPEAT));

		GLCallV(glTextureSubImage2D(_rendererID, 0, 0, 0, _width, _height, dataFormat, GL_UNSIGNED_BYTE, texSurface->pixels));

		SDL_FreeSurface(texSurface);
	}

	OpenGLTexture::~OpenGLTexture()
	{
		GLCallV(glDeleteTextures(1, &_rendererID));
	}

	void OpenGLTexture::SetData(const void* data, uint32_t size)
	{
		uint32_t bpp = _dataFormat == GL_RGBA ? 4 : 3;
		if (size != _width * _height * bpp)
			LOG_WARNING("Data must be entire texture!");

		GLCallV(glTextureSubImage2D(_rendererID, 0, 0, 0, _width, _height, _dataFormat, GL_UNSIGNED_BYTE, data));
	}

	void OpenGLTexture::Bind(uint32_t slot) const
	{
		GLCallV(glBindTextureUnit(slot, _rendererID));
	}
}