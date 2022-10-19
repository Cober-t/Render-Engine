#pragma once

#include "Entities/ECS.h"

#include <box2D/b2_world.h>
#include <box2D/b2_body.h>
#include <box2D/b2_fixture.h>
#include <box2D/b2_polygon_shape.h>

class b2World;

namespace Cober {

	class PhysicsSystem : public System {
	public:
		PhysicsSystem();
		~PhysicsSystem();
		void Update(double deltaTime);

	private:
		b2World* _physicsWorld = nullptr;
	};
}