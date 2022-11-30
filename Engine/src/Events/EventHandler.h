#pragma once

#include "core/Core.h"
#include "Event.h"

#include <map> 
#include <typeindex>

namespace Cober {

    ///////////////////////////////////////////////////////
    ////+++++++++ BASE EVENT CALLBACK CLASS +++++++++++////
    ///////////////////////////////////////////////////////
    class IEventCallback {
    public:
        virtual ~IEventCallback();

        inline void Execute(Event& e) { Call(e); }
    private:
        virtual void Call(Event& e) = 0;
    };

    ///////////////////////////////////////////////////////
    ////++++++++++++ EVENT CALLBACK CLASS +++++++++++++////
    ///////////////////////////////////////////////////////
    template<typename TOwner, typename TEvent>
    class EventCallback : IEventCallback {
    private:
        typedef void(TOwner::* CallbackFunction)(TEvent&);

    public:
        EventCallback(TOwner* ownerInst, CallbackFunction callbackFunc)
            : ownerInstance(ownerInst), callbackFunction(callbackFunc) { }
    private:
        TOwner* ownerInstnce;
        CallbackFunction callbackFunction;

        inline virtual void Call(Event& e) override {
            std::invoke(callbackFunction, ownerInstance, static_cast<TEvent&>(e));
        }
    };


    ///////////////////////////////////////////////////////
    ////+++++++++++++ EVENT HANDLER CLASS +++++++++++++////
    ///////////////////////////////////////////////////////
    typedef std::list<Unique<IEventCallback>> HandlerList;
    class EventHandler {
    public:
        EventHandler() { Logger::Log("EventHadler constructor called!"); };
        ~EventHandler() { Logger::Log("EventHandler destructor called!"); };


        //// Example: eventHandler->SubscribeToEvent<CollisionEvent>(&Events::onCollision);
        template<typename TOwner, typename TEvent>
        void SubscribeToEvent(TOwner* ownerInstance, void (TOwner::*callbackFunction)(TEvent&));

        //// Example: eventHandler->DispatchEvent<CollisionEvent>(player, enemy);
        template<typename TEvent, typename ...TArgs>
        void DispatchEvent(TArgs&& ...args);

    private:
        std::map<std::type_index, Unique<HandlerList>> subscribers;
    };
}