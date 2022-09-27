#pragma once

namespace Cober {

	class Window {
	private:
		struct WindowData {
			const char* title;
			bool VSync;
			uint32_t width, height;
			WindowData() : title("Render Engine ;)"), width(1280), height(720), VSync(true) {}
		};

		WindowData data;
		SDL_Window* _window = nullptr;
		SDL_GLContext _context;

	public:
		Window(const WindowData& data);
		//~Window();

		static Unique<Window> Create(const WindowData& data = WindowData());

		int InitGlew();
		bool CreateWindow();
		bool CreateContext();
		void ClearWindow(Uint8 r = 21, Uint8 g = 21, Uint8 b = 36, Uint8 k = 255);
		void SwapBuffers();
		void UpdateViewport(const uint32_t width, const uint32_t height);
		void CloseWindow();

		SDL_Window* GetWindow() { return _window; }
		SDL_GLContext	GetContext() { return _context; }
		uint32_t GetWidth() { return data.width; }
		uint32_t GetHeight() { return data.height; }
	};
}
