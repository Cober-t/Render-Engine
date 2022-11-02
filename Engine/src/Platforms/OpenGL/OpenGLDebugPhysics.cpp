#include "pch.h"

#include "OpenGLDebugPhysics.h"
#include "core/Logger.h"

#include <GL/glew.h>

namespace Cober {

    void OpenGLDebugPhysics::DrawPolygon(const b2Vec2* vertices, int vertexCount, const b2Color& color) {

        GLCallV(glColor4f(color.r, color.g, color.b, color.a));
        GLCallV(glBegin(GL_LINE_LOOP));
        for (int i = 0; i < vertexCount; i++) {
            b2Vec2 v = vertices[i];
            GLCallV(glVertex2f(v.x, v.y));
        }
        glEnd();
    }

    void OpenGLDebugPhysics::DrawSolidPolygon(const b2Vec2* vertices, int vertexCount, const b2Color& color) {

        //set up vertex array
        GLfloat glverts[16]; //allow for polygons up to 8 vertices
        GLCallV(glVertexPointer(2, GL_FLOAT, 0, glverts)); //tell OpenGL where to find vertices
        GLCallV(glEnableClientState(GL_VERTEX_ARRAY)); //use vertices in subsequent calls to glDrawArrays

        //fill in vertex positions as directed by Box2D
        for (int i = 0; i < vertexCount; i++) {
            glverts[i * 2] = vertices[i].x;
            glverts[i * 2 + 1] = vertices[i].y;
        }

        //draw solid area
        GLCallV(glColor4f(color.r, color.g, color.b, 1));
        GLCallV(glDrawArrays(GL_TRIANGLE_FAN, 0, vertexCount));

        //draw lines
        GLCallV(glLineWidth(3)); //fat lines
        GLCallV(glColor4f(1, 0, 0, 1)); //blue
        GLCallV(glDrawArrays(GL_LINE_LOOP, 0, vertexCount));
    }

    void OpenGLDebugPhysics::DrawCircle(const b2Vec2& center, float radius, const b2Color& color) {
        const float k_segments = 16.0f;
        const float k_increment = 2.0f * b2_pi / k_segments;
        float theta = 0.0f;

        GLCallV(glColor4f(color.r, color.g, color.b, 1.0f));
        GLCallV(glBegin(GL_LINE_LOOP));
        GLfloat glVertices[32];
        for (int32 i = 0; i < k_segments; ++i) {
            b2Vec2 v = center + radius * b2Vec2(cos(theta), sin(theta));
            GLCallV(glVertex2f(v.x, v.y));
            theta += k_increment;
        }
        glEnd();
    }

    void OpenGLDebugPhysics::DrawSolidCircle(const b2Vec2& center, float radius, const b2Vec2& axis, const b2Color& color) {
        const float k_segments = 16.0f;
        const float k_increment = 2.0f * b2_pi / k_segments;
        float theta = 0.0f;

        GLCallV(glColor4f(color.r, color.g, color.b, color.a));
        GLCallV(glBegin(GL_TRIANGLE_FAN));
        GLfloat glVertices[32];
        for (int32 i = 0; i < k_segments; ++i) {
            b2Vec2 v = center + radius * b2Vec2(cos(theta), sin(theta));
            glVertex2f(v.x, v.y);
            theta += k_increment;
        }
        glEnd();

        DrawSegment(center, center + radius * axis, color);
    }

    void OpenGLDebugPhysics::DrawSegment(const b2Vec2& p1, const b2Vec2& p2, const b2Color& color) {
        GLCallV(glColor4f(color.r, color.g, color.b, 1.0f));
        GLCallV(glBegin(GL_LINES));
            GLCallV(glVertex2f(p1.x, p1.y));
            GLCallV(glVertex2f(p2.x, p2.y));
        glEnd();
    }

    void OpenGLDebugPhysics::DrawPoint(const b2Vec2& p, float size, const b2Color& color) {
        GLCallV(glColor4f(color.r, color.g, color.b, 1.0f));
        GLCallV(glPointSize(size));
        GLCallV(glBegin(GL_POINTS));
            GLCallV(glVertex2f(p.x, p.y));
        glEnd();
    }

    void OpenGLDebugPhysics::DrawString(int x, int y, const char* string, ...) {
        // TODO:
    }

    void OpenGLDebugPhysics::DrawAABB(b2AABB* aabb, const b2Color& c) {

        GLCallV(glColor4f(c.r, c.g, c.b, 1.0f));
        GLCallV(glBegin(GL_LINE_LOOP));
            GLCallV(glVertex2f(aabb->lowerBound.x, aabb->lowerBound.y));
            GLCallV(glVertex2f(aabb->upperBound.x, aabb->lowerBound.y));
            GLCallV(glVertex2f(aabb->upperBound.x, aabb->upperBound.y));
            GLCallV(glVertex2f(aabb->lowerBound.x, aabb->upperBound.y));
        glEnd();
    }

    void OpenGLDebugPhysics::DrawTransform(const b2Transform& xf) {

        b2Vec2 p1 = xf.p, p2;
        const float k_axisScale = 0.4f;

        p2 = p1 + k_axisScale * xf.q.GetXAxis();
        DrawSegment(p1, p2, b2Color(1.0f, 0.0f, 0.0f, 1.0f));

        p2 = p1 + k_axisScale * xf.q.GetYAxis();
        DrawSegment(p1, p2, b2Color(0.0f, 1.0f, 0.0f, 1.0f));
    }
}