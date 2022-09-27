#include "pch.h"
#include "Window.h"

namespace Cober {

	Window::Window(const WindowData& data) {

		if (!CreateWindow() || !CreateContext())
			return;
	}

	Unique<Window> Window::Create(const WindowData& data) {

		return CreateUnique<Window>(data);
	}

	bool Window::CreateWindow() {

		_window = SDL_CreateWindow("Render Engine ;)",
			SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
			data.width, data.height,
			SDL_WINDOW_OPENGL);
		if (_window == nullptr)
			LOG(SDL_GetError());

		// Setup SDL Window properties
		SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 4);
		SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 3);
		//SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_CORE);
		SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);
		SDL_GL_SetAttribute(SDL_GL_DEPTH_SIZE, 16);
		
		return _window;
	}

	bool Window::CreateContext() {

		_context = SDL_GL_CreateContext(_window);
		if (_context == nullptr)
			LOG(SDL_GetError());

		return _context;
	}

	void Window::ClearWindow(Uint8 r, Uint8 g, Uint8 b, Uint8 k) {

		glClearColor(0.8f, 0.3f, 0.1f, 1.0f);
		glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	}

	void Window::UpdateViewport(const uint32_t width, const uint32_t height) {

		//int display_w = width, display_h = height;

		//SDL_GL_GetDrawableSize(_window, &display_w, &display_h);
		glViewport(0, 0, width, height);

		data.width = width;
		data.height = height;
	}

	int Window::InitGlew() {

		glewExperimental = GL_TRUE;
		if (glewInit() != GLEW_OK)
			return 1;

		int bufferWidth, bufferHeight;
		SDL_GL_GetDrawableSize(_window, &bufferWidth, &bufferHeight);
		glViewport(0, 0, bufferWidth, bufferHeight);

		LOG(glGetString(GL_VERSION));
		LOG(glGetString(GL_VENDOR));
		LOG(glGetString(GL_RENDERER));

		return 0;
	}

	void Window::CloseWindow() {

		SDL_GL_DeleteContext(_context);
		SDL_DestroyWindow(_window);
		SDL_Quit();
	}

	void Window::SwapBuffers() {
		SDL_GL_SwapWindow(_window);
	}
}
