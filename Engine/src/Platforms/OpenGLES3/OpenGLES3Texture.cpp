#include "pch.h"

#include "Platforms/OpenGLES3/OpenGLES3Texture.h"
#include "core/Logger.h"

namespace Cober {

	OpenGLES3Texture::OpenGLES3Texture(uint32_t width, uint32_t height)
		: _width(width), _height(height)
	{
		_internalFormat = GL_RGBA8;
		_dataFormat = GL_RGBA;

		GLCallV(glGenTextures(1, &_rendererID));
		GLCallV(glBindTexture(GL_TEXTURE_2D, (GLuint)&_rendererID));

		//glTexStorage2D(GL_TEXTURE_2D, 1, _internalFormat, _width, _height);

		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);

		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
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

	OpenGLES3Texture::OpenGLES3Texture(const std::string& path)
		: _path(path)
	{
		// LOAD IMAGE
		SDL_Surface* texSurface = IMG_Load(path.c_str());

		FlipSurface(texSurface);

		if (!texSurface)
			LOG_ERROR("Failed to load image!");

		_width = texSurface->w;
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

		GLCallV(glGenTextures(1, &_rendererID));
		GLCallV(glBindTexture(GL_TEXTURE_2D, _rendererID));
		//GLCallV(glTexStorage2D(GL_TEXTURE_2D, 1, internalFormat, _width, _height));

		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);

		//GLCallV(glTexSubImage2D(GL_TEXTURE_2D, 0, 0, 0, _width, _height, _dataFormat, GL_UNSIGNED_BYTE, (const void*)texSurface->pixels)));
		GLCallV(glTexImage2D(GL_TEXTURE_2D, 0, _internalFormat, _width, _height, 0, _dataFormat, GL_UNSIGNED_BYTE, (const void*)texSurface->pixels));
		//glGenerateMipmap(GL_TEXTURE_2D);

		SDL_FreeSurface(texSurface);
	}

	OpenGLES3Texture::~OpenGLES3Texture()
	{
		GLCallV(glDeleteTextures(1, &_rendererID));
	}

	void OpenGLES3Texture::SetData(void* data, uint32_t size)
	{
		uint32_t bpp = _dataFormat == GL_RGBA ? 4 : 3;
		if (size != _width * _height * bpp)
			LOG_WARNING("Data must be entire texture!");

		//GLCallV(glTexSubImage2D(GL_TEXTURE_2D, 0, 0, 0, _width, _height, _dataFormat, GL_UNSIGNED_BYTE, data));
		GLCallV(glTexImage2D(GL_TEXTURE_2D, 0, _internalFormat, _width, _height, 0, _dataFormat, GL_UNSIGNED_BYTE, data));
		//glGenerateMipmap(GL_TEXTURE_2D);	// Must quit glTexStorage2D because create immutable texture
	}

	void OpenGLES3Texture::Bind(uint32_t slot) const
	{
//#ifdef __EMSCRIPTEN__		
//		switch (slot) {
//			case 0:	  _rendererID = GL_TEXTURE0;   GLCallV(glActiveTexture(GL_TEXTURE0));  break;
//			case 1:	  _rendererID = GL_TEXTURE1;   GLCallV(glActiveTexture(GL_TEXTURE1));  break;
//			case 2:	  _rendererID = GL_TEXTURE2;   GLCallV(glActiveTexture(GL_TEXTURE2));  break;
//			case 3:	  _rendererID = GL_TEXTURE3;   GLCallV(glActiveTexture(GL_TEXTURE3));  break;
//			case 4:	  _rendererID = GL_TEXTURE4;   GLCallV(glActiveTexture(GL_TEXTURE4));  break;
//			case 5:	  _rendererID = GL_TEXTURE5;   GLCallV(glActiveTexture(GL_TEXTURE5));  break;
//			case 6:	  _rendererID = GL_TEXTURE5;   GLCallV(glActiveTexture(GL_TEXTURE6));  break;
//			case 7:	  _rendererID = GL_TEXTURE7;   GLCallV(glActiveTexture(GL_TEXTURE7));  break;
//			case 8:	  _rendererID = GL_TEXTURE8;   GLCallV(glActiveTexture(GL_TEXTURE8));  break;
//			case 9:	  _rendererID = GL_TEXTURE9;   GLCallV(glActiveTexture(GL_TEXTURE9));  break;
//			case 10:  _rendererID = GL_TEXTURE10;  GLCallV(glActiveTexture(GL_TEXTURE10));  break;
//			case 11:  _rendererID = GL_TEXTURE11;  GLCallV(glActiveTexture(GL_TEXTURE11));  break;
//			case 12:  _rendererID = GL_TEXTURE12;  GLCallV(glActiveTexture(GL_TEXTURE12));  break;
//			case 13:  _rendererID = GL_TEXTURE13;  GLCallV(glActiveTexture(GL_TEXTURE13));  break;
//			case 14:  _rendererID = GL_TEXTURE14;  GLCallV(glActiveTexture(GL_TEXTURE14));  break;
//			case 15:  _rendererID = GL_TEXTURE15;  GLCallV(glActiveTexture(GL_TEXTURE15));  break;
//			default:  _rendererID = GL_TEXTURE0;   GLCallV(glActiveTexture(GL_TEXTURE0));  break;
//		}
//#endif
		GLCallV(glBindTexture(GL_TEXTURE_2D, slot));
	}
}