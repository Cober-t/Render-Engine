#pragma once

#include <SDL/SDL.h>
//#include <SDL/SDL_opengles2.h>
#include <GLES3/gl3.h>

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