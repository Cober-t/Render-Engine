#pragma once

#include "Entities/ECS.h"
#include "Entities/Components.h"

#include "Events/EventHandler.h"

namespace Cober {

	class CollisionSystem2D : public System {

	public:
		CollisionSystem2D();
		~CollisionSystem2D();

		void Update();

		//void OnEvent(Unique<EventHandler>& eventHandler);

		bool CheckAABBCollision(glm::vec3 A_pos, glm::vec3 A_size, glm::vec2 A_CollOffset, glm::vec2 A_CollSize,
								glm::vec3 B_pos, glm::vec3 B_size, glm::vec2 B_CollOffset, glm::vec2 B_CollSize);
	};
}
