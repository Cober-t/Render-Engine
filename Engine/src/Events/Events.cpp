#include "pch.h"

#include "Render/RenderGlobals.h"
#include "core/Application.h"

#include "Events.h"
#include "EventHandler.h"

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
                if (key == SDLK_q) {
                    Logger::Log("key Q pressed");
                    EventHandler::Get().SubscribeToEvent<CollisionEvent>(this, &Events::OnCollision);
                }
                break;
            }
            case SDL_QUIT:
            {
                Engine::Get().Close();
                break;
            }
            case SDL_WINDOWEVENT:
            {
#ifndef __EMSCRIPTEN__
                int width = event.window.data1, height = event.window.data2;
                if (event.window.event == SDL_WINDOWEVENT_SIZE_CHANGED)
                    WindowResizeEvent(width, height);
                else if(event.window.event == SDL_WINDOWEVENT_MINIMIZED) {
                    Engine::Get().SetMinimized(true);
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

    // Test
    void Events::OnCollision(CollisionEvent& event) {

        // Test
        event.a.Destroy();
        Logger::Log("Entity " + std::to_string(event.a.GetIndex()) + " collided wih entity " + std::to_string(event.b.GetIndex()));
    }
}