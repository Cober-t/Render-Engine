#pragma once

#include "Entities/ECS.h"

#include "core/Core.h"
#include "Entities/Scene.h"

#include <box2d/b2_world.h>
#include <box2d/b2_body.h>
#include <box2d/b2_fixture.h>
#include <box2d/b2_polygon_shape.h>
#include <box2d/b2_draw.h>

namespace Cober {

	class DebugSystem;

	class PhysicsSystem2D : public System {
	public:
		PhysicsSystem2D();
		~PhysicsSystem2D();

		void Start();
		void Update(double ts);
	
	private:
		b2World* _physicsWorld = nullptr;
	};
}