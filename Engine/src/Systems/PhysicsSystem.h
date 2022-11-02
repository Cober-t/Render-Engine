#pragma once

#include "Entities/ECS.h"
#include "DebugSystem.h"

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

		void Start(const Ref<Scene>& scene);
		void Update(double ts);
		void UpdateData();

		DebugSystem* GetDebugSystem() { return _debugPhysics; }
		b2World* GetPhysicsWorld() { return _physicsWorld; }

	private:
		DebugSystem* _debugPhysics;
		b2World* _physicsWorld;
		b2Body* body;
		Ref<Registry> _registry;
		b2PolygonShape boxShape;
	private:
		static PhysicsSystem* instance;
	private:
		friend class SceneHierarchyPanel;
	};
}