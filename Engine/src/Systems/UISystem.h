#pragma once

#include "Entities/ECS.h"

#include <SDL/SDL.h>

#include "Events/EventHandler.h"

namespace Cober {

	class UISystem : public System {
	public:
		UISystem();
		~UISystem();

		void Start(SDL_Window* window);

		void Update();

		//void OnEvent(Unique<EventHandler>& eventHandler);

		static void StartProcessInputs();
		static void ProcessInputs(SDL_Event& event);
		static void EndProcessInputs();
		static void Render();
		void DefineFont();

	private:
		
	};
}