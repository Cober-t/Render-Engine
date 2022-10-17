#pragma once

#include <SDL/SDL.h>

namespace Cober{

	class Events {
	public:
		Events();
		
        void ProcessEvents(SDL_Event& event);

        // Window Events
        void WindowResizeEvent(int width, int height);

        // Device Events 
        //void ZoomEventMouse(bool mouseWheelDown, int x, int y);
        //void PanEventMouse(int x, int y);
	private:
        // Mouse input
        const float _mouseWheelZoomDelta;
        bool _mouseButtonDown;
        int _mouseButtonDownX, _mouseButtonDownY;
        int _mousePositionX, _mousePositionY;

        // Pinch input
        const float _pinchZoomThreshold, _pinchScale;
        bool _pinch;
	};
}


