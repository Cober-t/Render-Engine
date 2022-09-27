#pragma once

class Window {
public:
	Window(int width = 1280, int height = 720, const char* title = "Render Engine");
	
	int InitGlew();
	void Destroy();
	void SwapBuffers();

	SDL_Window*		GetWindow() { return data->_window; }
	SDL_GLContext	GetContext() { return data->_context; }
	uint32_t GetWidth() { return data->width; }
	uint32_t GetHeight() { return data->heigth; }
private:
	struct WindowData {
		const char* title = "Render Engine";
		uint32_t width = 1280, heigth = 720;
		SDL_Window* _window = nullptr;
		SDL_GLContext _context;
		WindowData(const char* w_title, unsigned int w_width, unsigned int w_height)
			: title(w_title), width(w_width), heigth(w_height) {}
	};

	Unique<WindowData> data;
};