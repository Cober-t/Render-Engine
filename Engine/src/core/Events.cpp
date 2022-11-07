#include "pch.h"
#include "Events.h"
#include "Render/RenderGlobals.h"

#include "Application.h"

namespace Cober {

    Events::Events() : _mouseWheelZoomDelta(0.05f), _mouseButtonDown(false), _mouseButtonDownX(0), _mouseButtonDownY(0), _mousePositionX(0), _mousePositionY(0)
        , _pinchZoomThreshold(0.001f), _pinchScale(8.0f), _pinch(false)
    {
        
    }

    void Events::WindowResizeEvent(int width, int height)
    {
#ifndef __EMSCRIPTEN__
        RenderGlobals::SetViewport(0, 0, width, height);
#endif
    }

    void Events::ProcessEvents(SDL_Event& event)
    {
        switch (event.type) {
            case SDL_KEYDOWN: {
                auto key = event.key.keysym.sym;
                if (key == SDLK_ESCAPE) {
#ifndef __EMSCRIPTEN__
                    Engine::Get().Close();
#else
                    std::cout << "Pressed!" << std::endl;
#endif
                }
                break;
            }
            case SDL_QUIT:
            {
                std::terminate();
                break;
            }
            case SDL_WINDOWEVENT:
            {
#ifndef __EMSCRIPTEN__
                if (event.window.event == SDL_WINDOWEVENT_SIZE_CHANGED)
                {
                    int width = event.window.data1, height = event.window.data2;
                    WindowResizeEvent(width, height);
                }
#endif
                break;
            }
            case SDL_MOUSEWHEEL:
            {
                SDL_MouseWheelEvent* m = (SDL_MouseWheelEvent*)&event;
                bool mouseWheelDown = (m->y < 0);
                //ZoomEventMouse(mouseWheelDown, _mousePositionX, _mousePositionY);
                break;
            }
            case SDL_MOUSEMOTION:
            {
                SDL_MouseMotionEvent* m = (SDL_MouseMotionEvent*)&event;
                _mousePositionX = m->x;
                _mousePositionY = m->y;
                //if (_mouseButtonDown)
                    //PanEventMouse(_mousePositionX, _mousePositionY);
                break;
            }
            case SDL_MOUSEBUTTONDOWN:
            {
                SDL_MouseButtonEvent* m = (SDL_MouseButtonEvent*)&event;
                if (m->button == SDL_BUTTON_LEFT)
                {
                    _mouseButtonDown = true;
                    _mouseButtonDownX = m->x;
                    _mouseButtonDownY = m->y;
                    //mCamera.setBasePan();
                }
                break;
            }
            case SDL_MOUSEBUTTONUP:
            {
                SDL_MouseButtonEvent* m = (SDL_MouseButtonEvent*)&event;
                if (m->button == SDL_BUTTON_LEFT)
                    _mouseButtonDown = false;
                break;
            }
        }
    }
}