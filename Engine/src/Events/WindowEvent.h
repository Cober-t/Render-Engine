#pragma once

#include "core/Core.h"

#include "Event.h"
#include <SDL/SDL.h>

namespace Cober {

	class WindowResizeEvent : public Event {

	};


	class WindowEvent {
	public:
		WindowEvent();
		~WindowEvent();

		static WindowEvent* Get();

		void OnWindowResize(WindowResizeEvent& event);

	private:
		static WindowEvent* _instance;

	};
}