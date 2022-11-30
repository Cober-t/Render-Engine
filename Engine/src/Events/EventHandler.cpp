#include "pch.h"

#include "core/Application.h"

#include "EventHandler.h"

#include "InputEvent.h"
#include "WindowEvent.h"
#include "MouseEvent.h"
#include "CollisionEvent.h"
#include "JoystickEvent.h"

namespace Cober {

    EventHandler* EventHandler::_instance = nullptr;


    void EventHandler::ProcessEvents(SDL_Event& event) {

        switch (event.type) {
            case SDL_KEYDOWN: {
                auto key = event.key.keysym.sym;
                EventHandler::Get()->DispatchEvent<KeyDownEvent>(key);
                if (key == SDLK_ESCAPE) {
    #ifndef __EMSCRIPTEN__
                    Engine::Get().Close();
    #else
                    std::cout << "Pressed!" << std::endl;
    #endif
                }
                if (key == SDLK_q) {
                    Logger::Log("key Q pressed");
                    EventHandler::Get()->SubscribeToEvent<OnCollisionEvent>(CollisionEvent::Get(), &CollisionEvent::OnCollision);
                }
                break;
            }
            case SDL_QUIT:
            {
                Engine::Get().Close();
                break;
            }
            /*
            case SDL_WINDOWEVENT:
            {
    #ifndef __EMSCRIPTEN__
                int width = event.window.data1, height = event.window.data2;
                if (event.window.event == SDL_WINDOWEVENT_SIZE_CHANGED) {
                    Logger::Log("Window size changed!");
                    //WindowResizeEvent(width, height);
                }
                else if (event.window.event == SDL_WINDOWEVENT_MINIMIZED) {
                    Engine::Get().SetMinimized(true);
                    //WindowResizeEvent(width, height);
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
            }*/
        }
    }
}