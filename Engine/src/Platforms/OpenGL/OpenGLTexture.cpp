#include "pch.h"

#include "Platforms/OpenGL/OpenGLTexture.h"
#include "core/Logger.h"

// Does not use this library, use SDL_Image instead to load images
//#include <stb_image.h>
#include <SDL/SDL_image.h>

namespace Cober {

	OpenGLTexture::OpenGLTexture(uint32_t width, uint32_t height)
		: _width(width), _height(height)
	{
		_internalFormat = GL_RGBA8;
		_dataFormat = GL_RGBA;

		GLCallV(glCreateTextures(GL_TEXTURE_2D, 1, &_rendererID));
		GLCallV(glTextureStorage2D(_rendererID, 1, _internalFormat, _width, _height));

		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_MIN_FILTER, GL_LINEAR));
		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_MAG_FILTER, GL_NEAREST));

		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_WRAP_S, GL_REPEAT));
		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_WRAP_T, GL_REPEAT));
	}

	OpenGLTexture::OpenGLTexture(const std::string& path)
		: _path(path)
	{
		int width, height, channels;
		// LOAD IMAGE
		{
			/*const char* path = SOLUTION_DIR;
			const char* file = "assets\\textures\\woodenContainer.png";
			SDL_Surface* surface = IMG_Load(path + (const char*)file);*/

			//stbi_set_flip_vertically_on_load(1);
			//stbi_uc* data = nullptr;
			//data = stbi_load(path.c_str(), &width, &height, &channels, 0);
		}

		Logger::Error("Failed to load image!");

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

		//Logger::Warning(internalFormat & dataFormat, "Format not supported!");

		GLCallV(glCreateTextures(GL_TEXTURE_2D, 1, &_rendererID));
		GLCallV(glTextureStorage2D(_rendererID, 1, internalFormat, _width, _height));

		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_MIN_FILTER, GL_LINEAR));
		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_MAG_FILTER, GL_NEAREST));

		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_WRAP_S, GL_REPEAT));
		GLCallV(glTextureParameteri(_rendererID, GL_TEXTURE_WRAP_T, GL_REPEAT));

		//glTextureSubImage2D(_rendererID, 0, 0, 0, _width, _height, dataFormat, GL_UNSIGNED_BYTE, data);

		//stbi_image_free(data);
	}

	OpenGLTexture::~OpenGLTexture()
	{
		GLCallV(glDeleteTextures(1, &_rendererID));
	}

	void OpenGLTexture::SetData(void* data, uint32_t size)
	{
		uint32_t bpp = _dataFormat == GL_RGBA ? 4 : 3;
		//Logger::Warning("Data must be entire texture!");
		GLCallV(glTextureSubImage2D(_rendererID, 0, 0, 0, _width, _height, _dataFormat, GL_UNSIGNED_BYTE, data));
	}

	void OpenGLTexture::Bind(uint32_t slot) const
	{
		GLCallV(glBindTextureUnit(slot, _rendererID));
	}
}