#pragma once

#include "Systems/DebugSystem.h"
#include <box2D/b2_draw.h>

namespace Cober {

	class OpenGLDebugPhysics : public DebugSystem 
	{
		virtual void DrawPolygon(const b2Vec2* vertices, int vertexCount, const b2Color& color) override;
		virtual void DrawSolidPolygon(const b2Vec2* vertices, int vertexCount, const b2Color& color) override;

		virtual void DrawCircle(const b2Vec2& center, float radius, const b2Color& color) override;
		virtual void DrawSolidCircle(const b2Vec2& center, float radius, const b2Vec2& axis, const b2Color& color) override;

		virtual void DrawPoint(const b2Vec2& p, float size, const b2Color& color) override;
		virtual void DrawSegment(const b2Vec2& p1, const b2Vec2& p2, const b2Color& color) override;

		virtual void DrawTransform(const b2Transform& xf) override;

		virtual void DrawString(int x, int y, const char* string, ...) override;

		virtual void DrawAABB(b2AABB* aabb, const b2Color& color) override;
	};
}