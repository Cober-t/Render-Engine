#pragma once

#include "Entities/ECS.h"
#include "Entities/Components.h"

#include "Events/EventHandler.h"

#include <glm/glm.hpp>

namespace Cober {

	class MovementSystem : public System {
	public:
		MovementSystem();
		~MovementSystem();

		void Update(double deltaTime);

		//void OnEvent(Unique<EventHandler>& eventHandler);

	private:
		glm::vec2 upVelocity;
		glm::vec2 rightVelocity;
		glm::vec2 downVelocity;
		glm::vec2 leftVelocity;
	};
}