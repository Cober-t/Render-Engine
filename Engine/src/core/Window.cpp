#include "pch.h"

#include "Window.h"

namespace Cober {

	Window::Window(const WindowData data) 
		: _data(data)
	{
		if (!CreateWindow())
			return;

		_context = GraphicsContext::Create(_window);
		if (!_context)
			return;
	}
	Window::~Window() {
		Logger::Log("Window Destructor called!");
	}

	Unique<Window> Window::Create(const std::string& name, uint32_t width, uint32_t height, bool VSync) {

		WindowData data = WindowData();

		if (name != "")
			data.title = name;
		data.width = width;
		data.height = height;
		data.VSync = VSync;

		return CreateUnique<Window>(data);
	}

	bool Window::CreateWindow() {
		
		_window = SDL_CreateWindow(_data.title.c_str(),
			SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
			_data.width, _data.height,
			SDL_WINDOW_OPENGL | SDL_WINDOW_ALLOW_HIGHDPI | SDL_WINDOW_SHOWN);
		if (_window == nullptr)
			GET_SDL_ERROR();

		SDL_SetWindowBordered(_window, SDL_FALSE);
		
		return _window;
	}

	void Window::ClearWindow(float red, float green, float blue, float black) {

		RenderGlobals::SetClearColor(red, green, blue, black);
		RenderGlobals::Clear();
	}

	void Window::UpdateViewport(const uint32_t width, const uint32_t height) {

		_data.width = width;
		_data.height = height;
		RenderGlobals::SetViewport(0, 0, width, height);
	}

	void Window::CloseWindow() {

		SDL_GL_DeleteContext(_context->GetContext());
		SDL_DestroyWindow(_window);
		SDL_Quit();
	}

	void Window::ChangeFullScreen() {

		SDL_SetWindowFullscreen(_window, _fullscreen);
		_fullscreen = _fullscreen == SDL_FALSE ? SDL_TRUE : SDL_FALSE;
	}

	void Window::SwapBuffers() {

		_context->SwapBuffers();
	}
}
