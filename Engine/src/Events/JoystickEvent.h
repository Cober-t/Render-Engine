#pragma once

#include "core/Core.h"
#include "Event.h" 

#include <SDL/SDL.h>

namespace Cober {

	class ButtonDown : public Event {
	public:
		ButtonDown(SDL_Keycode sym) : symbol(sym) {}
		SDL_Keycode symbol;
	};

	class JoystickEvent {
	public:
		JoystickEvent();
		~JoystickEvent();

		static JoystickEvent* Get();

		void OnButtonDown(ButtonDown& event);

	private:
		static JoystickEvent* _instance;
	};
}
