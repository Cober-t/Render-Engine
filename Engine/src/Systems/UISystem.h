#pragma once

#include "Entities/ECS.h"

#include <SDL/SDL.h>

namespace Cober {

	class UISystem : public System {
	public:
		UISystem();
		~UISystem();

		void Start(SDL_Window* window);

		void Update();

		static void StartProcessInputs();
		static void ProcessInputs(SDL_Event& event);
		static void EndProcessInputs();
		static void Render();
		void DefineFont();

	private:
		
	};
}