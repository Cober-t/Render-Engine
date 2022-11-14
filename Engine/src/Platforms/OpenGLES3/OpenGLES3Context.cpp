#include "pch.h"

#include "core/Core.h"
#include "Platforms/OpenGLES3/OpenGLES3Context.h"

namespace Cober {

	OpenGLES3Context::OpenGLES3Context(SDL_Window* window) : _windowHandle(window) {

		if (_windowHandle == nullptr)
			GET_SDL_ERROR();

		// Setup SDL Window properties
		SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_ES);
		SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 3);
		SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 2);
		
		SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);
		SDL_GL_SetAttribute(SDL_GL_DEPTH_SIZE, 24);
		SDL_GL_SetAttribute(SDL_GL_STENCIL_SIZE, 8);

		_context = SDL_GL_CreateContext(_windowHandle);
		if (_context == nullptr)
			GET_SDL_ERROR();
		
		int bufferWidth, bufferHeight;
		SDL_GL_GetDrawableSize(_windowHandle, &bufferWidth, &bufferHeight);
		glViewport(0, 0, bufferWidth, bufferHeight);

		std::cout << glGetString(GL_VERSION) << std::endl;
		std::cout << glGetString(GL_VENDOR) << std::endl;
		std::cout << glGetString(GL_RENDERER) << std::endl;
	}

	SDL_GLContext OpenGLES3Context::GetContext()
	{
		return _context;
	}

	void OpenGLES3Context::SwapBuffers()
	{
		SDL_GL_SwapWindow(_windowHandle);
	}
}