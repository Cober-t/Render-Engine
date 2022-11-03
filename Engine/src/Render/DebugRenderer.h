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
		static void DrawPolygon(const b2Vec2* vertices, int vertexCount, const b2Color& color);
		static void DrawSolidPolygon(Entity& entity);
		static void DrawCircle(const b2Vec2& center, float radius, const b2Color& color);
		static void DrawSolidCircle(const b2Vec2& center, float radius, const b2Vec2& axis, const b2Color& color);
		static void DrawPoint(const b2Vec2& p, float size, const b2Color& color);
		static void DrawSegment(const b2Vec2& p1, const b2Vec2& p2, const b2Color& color);
		static void DrawTransform(const b2Transform& xf);
		static void DrawString(int x, int y, const char* string, ...);
		static void DrawAABB(b2AABB* aabb, const b2Color& color);
	};
}

