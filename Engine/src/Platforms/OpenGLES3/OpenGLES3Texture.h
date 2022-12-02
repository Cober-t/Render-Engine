#pragma once

#include "Render/Texture.h"

//#include <SDL/SDL_opengles2.h>
#include <GLES3/gl3.h>

namespace Cober {

	class OpenGLES3Texture : public Texture
	{
	public:
		OpenGLES3Texture(uint32_t width, uint32_t height);
		OpenGLES3Texture(const std::string& path);
		virtual ~OpenGLES3Texture();

		virtual uint32_t GetWidth()  const override { return _width; }
		virtual uint32_t GetHeight() const override { return _height; }

		virtual void SetWidth(uint32_t width)   override { _width = width; }
		virtual void SetHeight(uint32_t height) override { _height = height; }

		virtual uint32_t GetID() const override { return _rendererID; }
		virtual std::string GetName() const override;
		virtual std::string GetFormat() const override;
		virtual std::string GetPath() const override { return _path; };

		virtual void SetSubTextureIndex(const glm::vec2 coords[4]) override;
		virtual glm::vec2* GetSubTextureCoords() override { return subTexIndex; };

		virtual void SetData(void* data, uint32_t size) override;

		virtual void Bind(uint32_t slot = 0) override;

		virtual bool operator==(const Texture& other) const override
		{
			return _rendererID == ((OpenGLES3Texture&)other)._rendererID;
		}
	private:
		std::string _path;
		uint32_t _width, _height;
		uint32_t _rendererID;
		GLenum _internalFormat, _dataFormat;

		glm::vec2 subTexIndex[4] = { { 0.0f, 0.0f }, { 1.0f, 0.0f }, { 1.0f, 1.0f }, { 0.0f, 1.0f } };
	};
}