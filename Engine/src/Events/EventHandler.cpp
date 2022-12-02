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
            case SDL_QUIT:
                Engine::Get().Close();
                break;
            case SDL_WINDOWEVENT: {
                switch (event.window.event) {
                    case SDL_WINDOWEVENT_SHOWN:
                        //EventHandler::Get()->DispatchEvent<WindowShownEvent>(event->window.windowID);
                        break;
                    case SDL_WINDOWEVENT_HIDDEN:
                        //EventHandler::Get()->DispatchEvent<WindowHiddenEvent>(event->window.windowID);
                        break;
                    case SDL_WINDOWEVENT_EXPOSED:
                        //EventHandler::Get()->DispatchEvent<WindowExposedEvent>(event->window.windowID);
                        break;
                    case SDL_WINDOWEVENT_MOVED:
                        //EventHandler::Get()->DispatchEvent<WindowMovedEvent>(event->window.windowID, 
                        //                                                     event->window.data1, event->window.data2);
                        break;
                    case SDL_WINDOWEVENT_RESIZED:
                        //EventHandler::Get()->DispatchEvent<WindowResizedEvent>(event->window.windowID, 
                        //                                                     event->window.data1, event->window.data2);
                        break;
                    case SDL_WINDOWEVENT_SIZE_CHANGED:
                        //EventHandler::Get()->DispatchEvent<WindowSizeChangedEvent>(event->window.windowID, 
                        //                                                     event->window.data1, event->window.data2);
                        break;
                    case SDL_WINDOWEVENT_MINIMIZED:
                        //EventHandler::Get()->DispatchEvent<WindowMinimizedEvent>(event->window.windowID);
                        break;
                    case SDL_WINDOWEVENT_MAXIMIZED:
                        //EventHandler::Get()->DispatchEvent<WindowMaximizedEvent>(event->window.windowID);
                        break;
                    case SDL_WINDOWEVENT_RESTORED:
                        //EventHandler::Get()->DispatchEvent<WindowRestoredEvent>(event->window.windowID);
                        break;
                    case SDL_WINDOWEVENT_ENTER:
                        //EventHandler::Get()->DispatchEvent<WindowEnterEvent>(event->window.windowID);
                        break;
                    case SDL_WINDOWEVENT_LEAVE:
                        //EventHandler::Get()->DispatchEvent<WindowLeaveEvent>(event->window.windowID);
                        break;
                    case SDL_WINDOWEVENT_FOCUS_GAINED:
                        //EventHandler::Get()->DispatchEvent<WindowFocusGainedEvent>(event->window.windowID);
                        break;
                    case SDL_WINDOWEVENT_FOCUS_LOST:
                        //EventHandler::Get()->DispatchEvent<WindowFocusLostEvent>(event->window.windowID);
                        break;
                    case SDL_WINDOWEVENT_CLOSE:
                        //EventHandler::Get()->DispatchEvent<WindowCloseEvent>(event->window.windowID);
                        break;
                }
                break;
            }
            case SDL_KEYDOWN: {
                switch (event.key.keysym.sym) {
                    EventHandler::Get()->DispatchEvent<KeyDownEvent>(event.key.keysym.sym);
                    case SDLK_ESCAPE:{
#ifndef __EMSCRIPTEN__
                        Engine::Get().Close();
#endif
                        break;
                    }
                    case SDLK_q: {
                        // TEST
                        EventHandler::Get()->SubscribeToEvent<OnCollisionEvent>(CollisionEvent::Get(), &CollisionEvent::OnCollision);
                        break;
                    }
                    // Keys(event.key.keysym.sym);
                }
                break;
            }
            case SDL_KEYUP: {
                switch (event.key.keysym.sym) {
                    // Keys(event.key.keysym.sym);
                }
                break;
            }
            case SDL_MOUSEMOTION:
                //SDL_MouseMotionEvent* m = (SDL_MouseMotionEvent*)&event;
                //EventHandler::Get()->DispatchEvent<MouseMotionEvent>(m->x, m->y);
                break;
            case SDL_MOUSEBUTTONDOWN:
                //SDL_MouseButtonEvent* m = (SDL_MouseButtonEvent*)&event;
                // m->button == SDL_BUTTON_LEFT .....
                //EventHandler::Get()->DispatchEvent<MouseButtonDownEvent>(m->button);
                break;
            case SDL_MOUSEBUTTONUP:
                //SDL_MouseButtonEvent* m = (SDL_MouseButtonEvent*)&event;
                // m->button == SDL_BUTTON_LEFT .....
                //EventHandler::Get()->DispatchEvent<MouseButtonUpEvent>(m->button);
                break;
            case SDL_MOUSEWHEEL:
                //SDL_MouseWheelEvent* m = (SDL_MouseWheelEvent*)&event;
                //EventHandler::Get()->DispatchEvent<MouseWheelEvent>(m->x, m->y);
                break;


            case SDL_JOYAXISMOTION:
                //SDL_JoyAxisEvent* m = (SDL_JoyAxisEvent*)&event;
                //EventHandler::Get()->DispatchEvent<JoyAxisMotionEvent>(m->timestamp, m->which, m->axis, m->value);
                break;
            case SDL_JOYBALLMOTION:
                //SDL_JoyBallEvent* m = (SDL_JoyBallEvent*)&event;
                //EventHandler::Get()->DispatchEvent<JoyBallMotionEvent>(m->timestamp, m->which, m->ball, m->xrel, m->yrel);
                break;
            case SDL_JOYHATMOTION:
                //SDL_JoyHatEvent* m = (SDL_JoyHatEvent*)&event;
                //EventHandler::Get()->DispatchEvent<JoyHatMotionEvent>(m->timestamp, m->which, m->hat, m->value);
                break;
            case SDL_JOYBUTTONDOWN:
                //SDL_JoyButtonDown* m = (SDL_JoyButtonDown*)&event;
                //EventHandler::Get()->DispatchEvent<JoyButtonDownEvent>(m->type, m->timestamp, m->which, m->button, m->state);
                break;
            case SDL_JOYBUTTONUP:
                //SDL_JoyButtonDown* m = (SDL_JoyButtonDown*)&event;
                //EventHandler::Get()->DispatchEvent<JoyButtonUpEvent>(m->type, m->timestamp, m->which, m->button, m->state);
                break;
            case SDL_JOYDEVICEADDED:
                //SDL_JoyDeviceEvent* m = (SDL_JoyDeviceEvent*)&event;
                //EventHandler::Get()->DispatchEvent<JoyDevicedAddedEvent>(m->type, m->timestamp, m->whichh);
                break;
            case SDL_JOYDEVICEREMOVED:
                //SDL_JoyDeviceEvent* m = (SDL_JoyDeviceEvent*)&event;
                //EventHandler::Get()->DispatchEvent<JoyDevicedRemovedEvent>(m->type, m->timestamp, m->which);
                break;


            case SDL_CONTROLLERAXISMOTION:
                //SDL_ControllerAxisEvent* m = (SDL_ControllerAxisEvent*)&event;
                //EventHandler::Get()->DispatchEvent<ControllerAxisMotionEvent>(m->timestamp, m->which, m->axis, m->value);
                break;
            case SDL_CONTROLLERBUTTONDOWN:
                //SDL_ControllerButtonEvent* m = (SDL_ControllerButtonEvent*)&event;
                //EventHandler::Get()->DispatchEvent<ControllerButtonDownEvent>(m->type, m->timestamp, m->which, m->button, m->size);
                break;
            case SDL_CONTROLLERBUTTONUP:
                //SDL_ControllerButtonEvent* m = (SDL_ControllerButtonEvent*)&event;
                //EventHandler::Get()->DispatchEvent<ControllerButtonUpEvent>(m->type, m->timestamp, m->which, m->button, m->size);
                break;
            case SDL_CONTROLLERDEVICEADDED:
                //SDL_MouseMotionEvent* m = (SDL_MouseMotionEvent*)&event;
                //EventHandler::Get()->DispatchEvent<ControllerDeviceAddedEvent>(event->window.windowID);
                break;
            case SDL_CONTROLLERDEVICEREMOVED:
                //SDL_ControllerDeviceEvent* m = (SDL_ControllerDeviceEvent*)&event;
                //EventHandler::Get()->DispatchEvent<ControllerDeviceRemovedEvent>(m->type, m->timestamp, m->which);
                break;
            case SDL_CONTROLLERDEVICEREMAPPED:
                //SDL_ControllerDeviceEvent* m = (SDL_ControllerDeviceEvent*)&event;
                //EventHandler::Get()->DispatchEvent<ControllerDevideMappedEvent>(m->type, m->timestamp, m->which);
                break;


            case SDL_FINGERDOWN:
                //SDL_TouchFingerEvent* m = (SDL_TouchFingerEvent*)&event;
                //EventHandler::Get()->DispatchEvent<FingerDownEvent>(m->type, m->timestamp, m->touchId, m->fingerId, m->x, m->y, m->dx, m->dy, m->pressure, m->windowID);
                break;
            case SDL_FINGERUP:
                //SDL_TouchFingerEvent* m = (SDL_TouchFingerEvent*)&event;
                //EventHandler::Get()->DispatchEvent<FingerUpEvent>(m->type, m->timestamp, m->touchId, m->fingerId, m->x, m->y, m->dx, m->dy, m->pressure, m->windowID);
                break;
            case SDL_FINGERMOTION:
                //SDL_TouchFingerEvent *m = (SDL_TouchFingerEvent*)&event;
                //EventHandler::Get()->DispatchEvent<MultigestureEvent>(m->timestamp, m->touchId, m->fingerId, m->x, m->y, m->dx, m->dy, m->pressure, m->windowID);
                break;
            case SDL_MULTIGESTURE:
                //SDL_MultiGestureEvent* m = (SDL_MultiGestureEvent*)&event;
                //EventHandler::Get()->DispatchEvent<FingerMotionEvent>(m->timestamp, m->touchId, m->dTheta, m->dDist, m->x, m->y, m->numFingers);
                break;


            /* Example from EMSCRIPTEN + SDL2 + OPENGL 
            * 
            case SDL_FINGERMOTION:
                if (mFingerDown)
                {
                    SDL_TouchFingerEvent* m = (SDL_TouchFingerEvent*)&event;

                    // Finger down and finger moving must match
                    if (m->fingerId == mFingerDownId)
                        panEventFinger(m->x, m->y);
                }
                break;

            case SDL_FINGERDOWN:
                if (!mPinch)
                {
                    // Finger already down means multiple fingers, which is handled by multigesture event
                    if (mFingerDown)
                        mFingerDown = false;
                    else
                    {
                        SDL_TouchFingerEvent* m = (SDL_TouchFingerEvent*)&event;

                        mFingerDown = true;
                        mFingerDownX = m->x;
                        mFingerDownY = m->y;
                        mFingerDownId = m->fingerId;
                        mCamera.setBasePan();
                    }
                }
                break;

            case SDL_MULTIGESTURE:
            {
                SDL_MultiGestureEvent* m = (SDL_MultiGestureEvent*)&event;
                if (m->numFingers == 2 && fabs(m->dDist) >= cPinchZoomThreshold)
                {
                    mPinch = true;
                    mFingerDown = false;
                    mMouseButtonDown = false;
                    zoomEventPinch(m->dDist, m->x, m->y);
                }
                break;
            }

            case SDL_FINGERUP:
                mFingerDown = false;
                mPinch = false;
                break;
            */
        }
    }
}