#pragma once

#include "core/Core.h"

#include "Systems/PhysicsSystem.h"
#include "Entities/ECS.h"

#include <box2D/b2_polygon_shape.h>
#include <box2D/b2_draw.h>

#include <glm/gtc/matrix_transform.hpp>
#define GLM_ENABLE_EXPERIMENTAL
#include <glm/gtx/quaternion.hpp>

namespace Cober {

	class DebugRenderer : public b2Draw {
	public:
		static void DrawPolygon(Entity& entity);
		static void DrawSolidPolygon(Entity& entity);
		static void DrawCircle(Entity& entity);
		static void DrawSolidCircle(Entity& entity);
		static void DrawPoint(Entity& entity);
		static void DrawSegment(Entity& entity);
		static void DrawTransform(Entity& entity);
		static void DrawString(Entity& entity);
		static void DrawAABB(Entity& entity);
	};
}

