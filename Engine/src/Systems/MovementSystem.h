#pragma once

#include "Entities/ECS.h"
#include "Entities/Components.h"

namespace Cober {

	class MovementSystem : public System {
	public:
		MovementSystem();
		~MovementSystem();

		void Update(double deltaTime);
	};
}