#pragma once

#include "PhysicsSystem.h"

#include <box2D/b2_polygon_shape.h>
#include <box2D/b2_draw.h>

namespace Cober {

	class DebugSystem : public b2Draw {
	public:
		virtual ~DebugSystem() = default;
		virtual void DrawPolygon(const b2Vec2* vertices, int vertexCount, const b2Color& color) = 0;
		virtual void DrawSolidPolygon(const b2Vec2* vertices, int vertexCount, const b2Color& color) = 0;

		virtual void DrawCircle(const b2Vec2& center, float radius, const b2Color& color) = 0;
		virtual void DrawSolidCircle(const b2Vec2& center, float radius, const b2Vec2& axis, const b2Color& color) = 0;

		virtual void DrawPoint(const b2Vec2& p, float size, const b2Color& color) = 0;
		virtual void DrawSegment(const b2Vec2& p1, const b2Vec2& p2, const b2Color& color) = 0;

		virtual void DrawTransform(const b2Transform& xf) = 0;

		virtual void DrawString(int x, int y, const char* string, ...) = 0;

		virtual void DrawAABB(b2AABB* aabb, const b2Color& color) = 0;

		static DebugSystem* Create();
	};
}

