#pragma once

#include <SDL/SDL.h>

#include "core/Core.h"

namespace Cober {

	class GraphicsContext {
	public:
		virtual ~GraphicsContext() = default;

		virtual void SwapBuffers() = 0;
		virtual SDL_GLContext GetContext() = 0;

		static Unique<GraphicsContext> Create(void* window);
	};
}