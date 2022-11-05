#pragma once

#include <SDL/SDL.h>

#include "Render/GraphicsContext.h"

namespace Cober {

	class OpenGLES3Context : public GraphicsContext {
	public:
		OpenGLES3Context(SDL_Window* _windowHandle);
		virtual void SwapBuffers() override;
		SDL_GLContext GetContext() override;
	public:
		SDL_Window* _windowHandle;
		SDL_GLContext _context;
	};
}