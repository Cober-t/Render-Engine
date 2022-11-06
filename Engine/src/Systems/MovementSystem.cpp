#include "pch.h"
#include "MovementSystem.h"

namespace Cober {

	MovementSystem::MovementSystem() {
		RequireComponent<Transform>();
		RequireComponent<Rigidbody2D>();

		LOG("Movement SYSTEM Added!!");
	}

	MovementSystem::~MovementSystem() {

		LOG("Movement System removed from Registry");
	}

	void MovementSystem::Update(double deltaTime) {
		
		for (auto entity : GetSystemEntities()) {
			auto& transform = entity.GetComponent<Transform>();
			const auto& rigidbody = entity.GetComponent<Rigidbody2D>();

			transform.position.x += rigidbody.velocity.x * deltaTime;
			transform.position.y += rigidbody.velocity.y * deltaTime;

			//LOG("Entity ID = " +
			//	std::to_string(entity.GetID()) +
			//	" position is now (" +
			//	std::to_string(transform.position.x) +
			//	", " +
			//	std::to_string(transform.position.y) + ")");
		}
	}
}