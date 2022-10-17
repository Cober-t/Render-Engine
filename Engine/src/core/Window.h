#pragma once

#include <SDL/SDL.h>
#include "Render/RenderGlobals.h"
#include "Render/GraphicsContext.h"

namespace Cober {

	class Window {
	private:
		struct WindowData {
			std::string title;
			bool VSync;
			uint32_t width, height;
			WindowData() {
				title = "Game Engine ;)";
				width = 1280; height = 720;
				VSync = true; 
			}
		};

		SDL_Window* _window = nullptr;
		Unique<GraphicsContext> _context;
		WindowData _data;
	public:
		Window(const WindowData& data);
		//~Window();

		static Unique<Window> Create(const std::string& name = "Render Engine ;)", uint32_t width = 1280, uint32_t height = 720, bool VSync = true);

		bool CreateWindow();
		void ClearWindow(float red = 21, float green = 21, float blue = 36, float black = 255);
		void SwapBuffers();
		void UpdateViewport(const uint32_t width, const uint32_t height);
		void CloseWindow();

		SDL_Window* GetNativeWindow() { return _window; }
		SDL_GLContext	GetContext() { return _context->GetContext(); }
		uint32_t GetWidth() { return _data.width; }
		uint32_t GetHeight() { return _data.height; }
	};
}
