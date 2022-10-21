#pragma once

#include "Render/Texture.h"

//#include <GLES/...>

namespace Cober {

	class OpenGLES3Texture : public Texture
	{
	public:
		OpenGLES3Texture(uint32_t width, uint32_t height);
		OpenGLES3Texture(const std::string& path);
		virtual ~OpenGLES3Texture();

		virtual uint32_t GetWidth() const override { return _width; }
		virtual uint32_t GetHeight() const override { return _height; }

		virtual void SetData(void* data, uint32_t size) override;

		virtual void Bind(uint32_t slot = 0) const override;

		virtual bool operator==(const Texture& other) const override
		{
			return _rendererID == ((OpenGLES3Texture&)other)._rendererID;
		}
	private:
		std::string _path;
		uint32_t _width, _height;
		uint32_t _rendererID;
		//GLenum _internalFormat, _dataFormat;
	};
}