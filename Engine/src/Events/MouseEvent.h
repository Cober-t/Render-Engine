#pragma once

#include "Event.h"
#include <SDL/SDL.h>

namespace Cober {

	class MouseDownEvent : public Event {
	public:

	};

	class MouseEvent {
	public:
		MouseEvent();
		~MouseEvent();

		static MouseEvent* Get();

		void OnMouseDown(MouseDownEvent& event);

	private:
		static MouseEvent* _instance;
	};

}
