#pragma once

#include "core/Core.h"
#include "Event.h"

#include <map> 
#include <list> 
#include <typeindex>
#include <SDL/SDL.h>

namespace Cober {

    ///////////////////////////////////////////////////////
    ////+++++++++ BASE EVENT CALLBACK CLASS +++++++++++////
    ///////////////////////////////////////////////////////
    class IEventCallback {
    private:
        virtual void Call(Event& e) = 0;

    public:
        virtual ~IEventCallback() = default;

        void Execute(Event& e) {
            Call(e);
        }
    };

    ///////////////////////////////////////////////////////
    ////++++++++++++ EVENT CALLBACK CLASS +++++++++++++////
    ///////////////////////////////////////////////////////
    template <typename TOwner, typename TEvent>
    class EventCallback : public IEventCallback {
    private:
        typedef void (TOwner::* CallbackFunction)(TEvent&);

        TOwner* ownerInstance;
        CallbackFunction callbackFunction;

        virtual void Call(Event& e) override {
            std::invoke(callbackFunction, ownerInstance, static_cast<TEvent&>(e));
        }

    public:
        EventCallback(TOwner* ownerInstance, CallbackFunction callbackFunction) {
            this->ownerInstance = ownerInstance;
            this->callbackFunction = callbackFunction;
        }

        virtual ~EventCallback() override = default;
    };

    ///////////////////////////////////////////////////////
    ////+++++++++++++ EVENT HANDLER CLASS +++++++++++++////
    ///////////////////////////////////////////////////////

    typedef std::list<std::unique_ptr<IEventCallback>> HandlerList;

    class EventHandler {
    public:
        EventHandler() {
            _instance = this;
            Logger::Log("Event Handler constructor called!");
        }

        ~EventHandler() {
            Logger::Log("Event Handler destructor called!");
        }

        // Clears the subscribers list
        void Reset() { subscribers.clear(); }

        static EventHandler* Get() { return _instance == nullptr ? new EventHandler() : _instance; }

        void ProcessEvents(SDL_Event& event);

        //// Example: eventBus->SubscribeToEvent<CollisionEvent>(this, &Game::onCollision);
        template <typename TEvent, typename TOwner>
        void SubscribeToEvent(TOwner* ownerInstance, void (TOwner::* callbackFunction)(TEvent&));

        //// Example: eventBus->EmitEvent<CollisionEvent>(player, enemy);
        template <typename TEvent, typename ...TArgs>
        void DispatchEvent(TArgs&& ...args);

    private:
        static EventHandler* _instance;
        std::map<std::type_index, std::unique_ptr<HandlerList>> subscribers;
    };


    template <typename TEvent, typename TOwner>
    void EventHandler::SubscribeToEvent(TOwner* ownerInstance, void (TOwner::* callbackFunction)(TEvent&)) {

        if (!subscribers[typeid(TEvent)].get()) {
            subscribers[typeid(TEvent)] = std::make_unique<HandlerList>();
        }
        auto subscriber = std::make_unique<EventCallback<TOwner, TEvent>>(ownerInstance, callbackFunction);
        subscribers[typeid(TEvent)]->push_back(std::move(subscriber));
    }

    template <typename TEvent, typename ...TArgs>
    void EventHandler::DispatchEvent(TArgs&& ...args) {

        auto handlers = subscribers[typeid(TEvent)].get();
        if (handlers) {
            for (auto it = handlers->begin(); it != handlers->end(); it++) {
                auto handler = it->get();
                TEvent event(std::forward<TArgs>(args)...);
                handler->Execute(event);
            }
        }
    }
}