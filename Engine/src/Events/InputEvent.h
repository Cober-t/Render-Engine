#pragma once

#include "core/Core.h"
#include "Event.h" 

#include <SDL/SDL.h>

namespace Cober {

	class KeyDownEvent : public Event {
	public:
		KeyDownEvent(SDL_Keycode sym) : symbol(sym) {}
		SDL_Keycode symbol;
	};

	class InputEvent {
	public:
		InputEvent();
		~InputEvent();

		static InputEvent* Get();

		const Uint8* GetKeyboardStateArray() { return SDL_GetKeyboardState(NULL); }

		void OnKeyDown(KeyDownEvent& event);

	private:
		static InputEvent* _instance;
	};
}
