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

		virtual SDL_Surface* GetSurface() const = 0;

		virtual void SetData(void* data, uint32_t size) = 0;

		virtual void Bind(uint32_t slot = 0) const = 0;

		virtual bool operator==(const Texture& other) const = 0;

		static Ref<Texture> Create(uint32_t width, uint32_t height);
		static Ref<Texture> Create(const std::string& path);
	};
}