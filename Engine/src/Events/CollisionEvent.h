#pragma once

#include "core/Core.h"

#include "Event.h"
#include "Entities/ECS.h"

namespace Cober {

    class OnCollisionEvent : public Event {
    public:
        Entity a;
        Entity b;
		OnCollisionEvent(Entity a, Entity b) : a(a), b(b) {}
    };

    class CollisionEvent {
	public:
		CollisionEvent();
		~CollisionEvent();

		static CollisionEvent* Get();

		void OnCollision(OnCollisionEvent& event);

	private:
		static CollisionEvent* _instance;
    };
}