#pragma once
#include <SDL/SDL.h>
#include "Render/GraphicsContext.h"

namespace Cober {

	class OpenGLContext : public GraphicsContext {
	public:
		OpenGLContext(SDL_Window* _windowHandle);
		virtual void SwapBuffers() override;
		virtual SDL_GLContext GetContext() override;
	private:
		SDL_Window* _windowHandle;
		SDL_GLContext _context;
	};
}