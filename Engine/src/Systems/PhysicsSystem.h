#pragma once

#include "Entities/ECS.h"

#include "core/Core.h"
#include "core/Scene.h"

#include <box2D/b2_world.h>
#include <box2D/b2_body.h>
#include <box2D/b2_fixture.h>
#include <box2D/b2_polygon_shape.h>

namespace Cober {

	class PhysicsSystem : public System {
	public:
		PhysicsSystem();
		~PhysicsSystem();

		void Start(const Ref<Scene>& scene);
		void Update(double ts);

	private:
		b2World* _physicsWorld = nullptr;
		Ref<Registry> _registry;
	private:
		friend class SceneHierarchyPanel;
	};
}