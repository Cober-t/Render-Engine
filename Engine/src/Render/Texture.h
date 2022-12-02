#pragma once

#include <string>

#include <SDL/SDL_image.h>
#include "core/Core.h"

namespace Cober {

	class Texture
	{
	public:
		virtual ~Texture() = default;

		virtual uint32_t GetWidth()  const = 0;
		virtual uint32_t GetHeight() const = 0;

		virtual void SetWidth(uint32_t width)   = 0;
		virtual void SetHeight(uint32_t height) = 0;

		virtual uint32_t GetID() const = 0;
		virtual std::string GetName() const = 0;
		virtual std::string GetFormat() const = 0;
		virtual std::string GetPath() const = 0;

		virtual void SetSubTextureIndex(const glm::vec2 coords[4]) = 0;
		virtual glm::vec2* GetSubTextureCoords() = 0;

		virtual void SetData(void* data, uint32_t size) = 0;

		virtual void Bind(uint32_t slot = 0) = 0;

		virtual bool operator==(const Texture& other) const = 0;

		static Ref<Texture> Create(uint32_t width, uint32_t height);
		static Ref<Texture> Create(const std::string& path);
	};

	class SubTexture2D
	{
	public:
		SubTexture2D(const Ref<Texture>& texture, const glm::vec2& min, const glm::vec2& max);
		const Ref<Texture> GetTexture() const { return _texture; }
		const glm::vec2* GetTexCoords() const { return _texCoords; }

		static Ref<SubTexture2D> CreateFromCoords(const Ref<Texture>& texture, const glm::vec2& coord, const glm::vec2& cellsize, const glm::vec2& spriteSize = { 1, 1 });
	private:
		Ref<Texture> _texture;
		glm::vec2 _texCoords[4];
	};
}