#include "pch.h"

#include "CollisionEvent.h"

namespace Cober {

	CollisionEvent* CollisionEvent::_instance = nullptr;

	CollisionEvent::CollisionEvent() {

		_instance = this;
	}

	CollisionEvent::~CollisionEvent() {

		_instance = nullptr;
	}

	CollisionEvent* CollisionEvent::Get() {

		if (_instance == nullptr)
			_instance = new CollisionEvent();
		return _instance;
	}

	void CollisionEvent::OnCollision(OnCollisionEvent& event) {
		
		// Test
		Entity A = event.a;
		Entity B = event.b;

		if (A.BelongsToGroup("Box"))
			Logger::Log(A.GetComponent<Tag>().tag);

		if (B.BelongsToGroup("Cat"))
			Logger::Log(B.GetComponent<Tag>().tag);
	}
}
