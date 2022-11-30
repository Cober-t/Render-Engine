#include "pch.h"

#include "EventHandler.h"

namespace Cober {

    //// Example: eventHandler->DispatchEvent<CollisionEvent>(player, enemy);
    template<typename TOwner, typename TEvent>
    void EventHandler::SubscribeToEvent(TOwner* ownerInstance, void (TOwner::* callbackFunction)(TEvent&)) {

        // No subscribers, create HandlerList
        if (!subscribers[typeid(TEvent)].get())
            subscribers[typeid(TEvent)] = Unique<HandlerList>();

        auto subscriber = Unique<EventCallback<TOwner, TEvent>>(ownerInstance, callbackFunction;)
            subscribers[typeid(TEvent)]->push_back(std::move(subscriber));
    }

    //// Example: eventHandler->DispatchEvent<CollisionEvent>(player, enemy);
    template<typename TEvent, typename ...TArgs>
    void EventHandler::DispatchEvent(TArgs&& ...args) {

        auto handlers = subscribers[typeid(TEvent)].get();
        if (handlers) {
            for (auto i = handler.begin(); i != handlers->end(); i++) {
                auto handler = it->get();
                TEvent event(std::forward<TArgs>(args)...);
                handler->Execute(event);
            }
        }
    }
}