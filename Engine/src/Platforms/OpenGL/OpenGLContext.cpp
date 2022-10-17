#include "pch.h"

#include "core/Core.h"

#include "Platforms/OpenGL/OpenGLContext.h"
#include "Engine.h"
#include <GL/glew.h>

namespace Cober {
	
	OpenGLContext::OpenGLContext(SDL_Window* window) : _windowHandle(window) {

		if (_windowHandle == nullptr) {
			GET_ERROR();
			return;
		}

		// Setup SDL Window properties
		SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 4);
		SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 3);
		//SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_CORE);
		SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);
		SDL_GL_SetAttribute(SDL_GL_DEPTH_SIZE, 16);

		_context = SDL_GL_CreateContext(_windowHandle);
		if (_context == nullptr)
			LOG(SDL_GetError());

		glewExperimental = GL_TRUE;
		if (glewInit() != GLEW_OK)
			LOG("Something go wrong initializing Glew!!");

		int bufferWidth, bufferHeight;
		SDL_GL_GetDrawableSize(_windowHandle, &bufferWidth, &bufferHeight);
		glViewport(0, 0, bufferWidth, bufferHeight);

		LOG(glGetString(GL_VERSION));
		LOG(glGetString(GL_VENDOR));
		LOG(glGetString(GL_RENDERER));
	}

	SDL_GLContext OpenGLContext::GetContext() {

		return _context;
	}
	void OpenGLContext::SwapBuffers() {

		SDL_GL_SwapWindow(_windowHandle);
	}
}