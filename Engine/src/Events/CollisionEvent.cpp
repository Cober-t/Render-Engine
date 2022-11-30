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
		event.a.Destroy();
		Logger::Log("Entity " + std::to_string(event.a.GetIndex()) + " collided wih entity " + std::to_string(event.b.GetIndex()));
	}
}
