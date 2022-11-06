#pragma once

#include "Entities/ECS.h"

#include "core/Core.h"
#include "core/Scene.h"

#include <box2D/b2_world.h>
#include <box2D/b2_body.h>
#include <box2D/b2_fixture.h>
#include <box2D/b2_polygon_shape.h>
#include <box2D/b2_draw.h>
class b2World;

namespace Cober {

	class DebugSystem;

	class PhysicsSystem : public System {
	public:
		PhysicsSystem();
		~PhysicsSystem();

		void Start();
		void Update(double ts);
	
	private:
		b2World* _physicsWorld;
	};
}