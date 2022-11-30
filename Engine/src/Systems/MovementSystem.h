#pragma once

#include "Entities/ECS.h"
#include "Entities/Components.h"

#include "Events/EventHandler.h"

namespace Cober {

	class MovementSystem : public System {
	public:
		MovementSystem();
		~MovementSystem();

		void Update(double deltaTime);

		//void OnEvent(Unique<EventHandler>& eventHandler);
	};
}