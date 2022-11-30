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

		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);

		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
	}

	OpenGLES3Texture::~OpenGLES3Texture()
	{
		GLCallV(glDeleteTextures(1, &_rendererID));
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

		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);

		GLCallV(glTexImage2D(GL_TEXTURE_2D, 0, _internalFormat, _width, _height, 0, _dataFormat, GL_UNSIGNED_BYTE, (const void*)texSurface->pixels));

		SDL_FreeSurface(texSurface);
	}

	void OpenGLES3Texture::SetSubTextureIndex(const glm::vec2 coords[4]) {
		
		for(int i = 0; i < 4; i++)
			subTexIndex[i] = coords[i];
	};

	std::string OpenGLES3Texture::GetName() const {

		auto lastSlash = _path.find_last_of("/\\");

		if (lastSlash == std::string::npos)
			Logger::Error("Texture Path is invalid or does not exist!");

		lastSlash = lastSlash == std::string::npos ? 0 : lastSlash + 1;
		auto lastDot = _path.rfind('.');

		if (lastDot == std::string::npos)
			Logger::Error("Texture Name is invalid or does not exist!");

		auto count = lastDot == std::string::npos ? _path.size() - lastSlash : lastDot - lastSlash;
		std::string name = _path.substr(lastSlash, count);
		return name;
	}

	std::string OpenGLES3Texture::GetFormat() const {

		auto lastDot = _path.rfind('.');

		if (lastDot == std::string::npos)
			Logger::Error("Texture data format is invalid or does not exist!");
		return "null";

		std::string format = _path.substr(lastDot);
		return format;
	}

	void OpenGLES3Texture::SetData(void* data, uint32_t size)
	{
		uint32_t bpp = _dataFormat == GL_RGBA ? 4 : 3;
		if (size != _width * _height * bpp)
			LOG_WARNING("Data must be entire texture!");

		GLCallV(glTexImage2D(GL_TEXTURE_2D, 0, _internalFormat, _width, _height, 0, _dataFormat, GL_UNSIGNED_BYTE, data));
	}

	void OpenGLES3Texture::Bind(uint32_t slot) const
	{
		GLCallV(glBindTexture(GL_TEXTURE_2D, slot));
	}
}