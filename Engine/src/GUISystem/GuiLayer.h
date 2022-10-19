#pragma once

#include "core/Layer.h"

#include "core/Application.h"

namespace Cober {

	class GuiLayer : public Layer {
	public:
		
		GuiLayer(const char* glVersion = "#version 430");
		~GuiLayer();

		virtual void OnAttach() override;
		virtual void OnDetach() override;
		virtual void OnEvent(SDL_Event& event) override;

		void Begin();
		void End();
	private:
		SDL_Window* _window;
		SDL_GLContext _context;
		const char* glsl_version;
	};
}