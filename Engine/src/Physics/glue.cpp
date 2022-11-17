#include "pch.h"
#ifdef __EMSCRIPTEN__
#include <emscripten.h>

class JSContactListener : public b2ContactListener {
public:
  void BeginContact(b2Contact* contact)  {
    EM_ASM_INT({
      var self = Module['getCache'](Module['JSContactListener'])[$0];
      if (!self.hasOwnProperty('BeginContact')) throw 'a JSImplementation must implement all functions, you forgot JSContactListener::BeginContact.';
      self['BeginContact']($1);
    }, (ptrdiff_t)this, (ptrdiff_t)contact);
  }
  void EndContact(b2Contact* contact)  {
    EM_ASM_INT({
      var self = Module['getCache'](Module['JSContactListener'])[$0];
      if (!self.hasOwnProperty('EndContact')) throw 'a JSImplementation must implement all functions, you forgot JSContactListener::EndContact.';
      self['EndContact']($1);
    }, (ptrdiff_t)this, (ptrdiff_t)contact);
  }
  void PreSolve(b2Contact* contact, const b2Manifold* oldManifold)  {
    EM_ASM_INT({
      var self = Module['getCache'](Module['JSContactListener'])[$0];
      if (!self.hasOwnProperty('PreSolve')) throw 'a JSImplementation must implement all functions, you forgot JSContactListener::PreSolve.';
      self['PreSolve']($1,$2);
    }, (ptrdiff_t)this, (ptrdiff_t)contact, oldManifold);
  }
  void PostSolve(b2Contact* contact, const b2ContactImpulse* impulse)  {
    EM_ASM_INT({
      var self = Module['getCache'](Module['JSContactListener'])[$0];
      if (!self.hasOwnProperty('PostSolve')) throw 'a JSImplementation must implement all functions, you forgot JSContactListener::PostSolve.';
      self['PostSolve']($1,$2);
    }, (ptrdiff_t)this, (ptrdiff_t)contact, impulse);
  }
  void __destroy__()  {
    EM_ASM_INT({
      var self = Module['getCache'](Module['JSContactListener'])[$0];
      if (!self.hasOwnProperty('__destroy__')) throw 'a JSImplementation must implement all functions, you forgot JSContactListener::__destroy__.';
      self['__destroy__']();
    }, (ptrdiff_t)this);
  }
};

class JSRayCastCallback : public b2RayCastCallback {
public:
  float ReportFixture(b2Fixture* fixture, const b2Vec2& point, const b2Vec2& normal, float fraction)  {
    return EM_ASM_DOUBLE({
      var self = Module['getCache'](Module['JSRayCastCallback'])[$0];
      if (!self.hasOwnProperty('ReportFixture')) throw 'a JSImplementation must implement all functions, you forgot JSRayCastCallback::ReportFixture.';
      return self['ReportFixture']($1,$2,$3,$4);
    }, (ptrdiff_t)this, (ptrdiff_t)fixture, &point, &normal, fraction);
  }
  void __destroy__()  {
    EM_ASM_INT({
      var self = Module['getCache'](Module['JSRayCastCallback'])[$0];
      if (!self.hasOwnProperty('__destroy__')) throw 'a JSImplementation must implement all functions, you forgot JSRayCastCallback::__destroy__.';
      self['__destroy__']();
    }, (ptrdiff_t)this);
  }
};

class JSQueryCallback : public b2QueryCallback {
public:
  bool ReportFixture(b2Fixture* fixture)  {
    return EM_ASM_INT({
      var self = Module['getCache'](Module['JSQueryCallback'])[$0];
      if (!self.hasOwnProperty('ReportFixture')) throw 'a JSImplementation must implement all functions, you forgot JSQueryCallback::ReportFixture.';
      return self['ReportFixture']($1);
    }, (ptrdiff_t)this, (ptrdiff_t)fixture);
  }
  void __destroy__()  {
    EM_ASM_INT({
      var self = Module['getCache'](Module['JSQueryCallback'])[$0];
      if (!self.hasOwnProperty('__destroy__')) throw 'a JSImplementation must implement all functions, you forgot JSQueryCallback::__destroy__.';
      self['__destroy__']();
    }, (ptrdiff_t)this);
  }
};

class JSContactFilter : public b2ContactFilter {
public:
  bool ShouldCollide(b2Fixture* fixtureA, b2Fixture* fixtureB)  {
    return EM_ASM_INT({
      var self = Module['getCache'](Module['JSContactFilter'])[$0];
      if (!self.hasOwnProperty('ShouldCollide')) throw 'a JSImplementation must implement all functions, you forgot JSContactFilter::ShouldCollide.';
      return self['ShouldCollide']($1,$2);
    }, (ptrdiff_t)this, (ptrdiff_t)fixtureA, (ptrdiff_t)fixtureB);
  }
  void __destroy__()  {
    EM_ASM_INT({
      var self = Module['getCache'](Module['JSContactFilter'])[$0];
      if (!self.hasOwnProperty('__destroy__')) throw 'a JSImplementation must implement all functions, you forgot JSContactFilter::__destroy__.';
      self['__destroy__']();
    }, (ptrdiff_t)this);
  }
};

class JSDestructionListener : public b2DestructionListenerWrapper {
public:
  void SayGoodbyeJoint(b2Joint* joint)  {
    EM_ASM_INT({
      var self = Module['getCache'](Module['JSDestructionListener'])[$0];
      if (!self.hasOwnProperty('SayGoodbyeJoint')) throw 'a JSImplementation must implement all functions, you forgot JSDestructionListener::SayGoodbyeJoint.';
      self['SayGoodbyeJoint']($1);
    }, (ptrdiff_t)this, (ptrdiff_t)joint);
  }
  void SayGoodbyeFixture(b2Fixture* joint)  {
    EM_ASM_INT({
      var self = Module['getCache'](Module['JSDestructionListener'])[$0];
      if (!self.hasOwnProperty('SayGoodbyeFixture')) throw 'a JSImplementation must implement all functions, you forgot JSDestructionListener::SayGoodbyeFixture.';
      self['SayGoodbyeFixture']($1);
    }, (ptrdiff_t)this, (ptrdiff_t)joint);
  }
  void __destroy__()  {
    EM_ASM_INT({
      var self = Module['getCache'](Module['JSDestructionListener'])[$0];
      if (!self.hasOwnProperty('__destroy__')) throw 'a JSImplementation must implement all functions, you forgot JSDestructionListener::__destroy__.';
      self['__destroy__']();
    }, (ptrdiff_t)this);
  }
};

class JSDraw : public b2Draw {
public:
  void DrawPolygon(const b2Vec2* vertices, int vertexCount, const b2Color& color)  {
    EM_ASM_INT({
      var self = Module['getCache'](Module['JSDraw'])[$0];
      if (!self.hasOwnProperty('DrawPolygon')) throw 'a JSImplementation must implement all functions, you forgot JSDraw::DrawPolygon.';
      self['DrawPolygon']($1,$2,$3);
    }, (ptrdiff_t)this, vertices, vertexCount, &color);
  }
  void DrawSolidPolygon(const b2Vec2* vertices, int vertexCount, const b2Color& color)  {
    EM_ASM_INT({
      var self = Module['getCache'](Module['JSDraw'])[$0];
      if (!self.hasOwnProperty('DrawSolidPolygon')) throw 'a JSImplementation must implement all functions, you forgot JSDraw::DrawSolidPolygon.';
      self['DrawSolidPolygon']($1,$2,$3);
    }, (ptrdiff_t)this, vertices, vertexCount, &color);
  }
  void DrawCircle(const b2Vec2& center, float radius, const b2Color& color)  {
    EM_ASM_INT({
      var self = Module['getCache'](Module['JSDraw'])[$0];
      if (!self.hasOwnProperty('DrawCircle')) throw 'a JSImplementation must implement all functions, you forgot JSDraw::DrawCircle.';
      self['DrawCircle']($1,$2,$3);
    }, (ptrdiff_t)this, &center, radius, &color);
  }
  void DrawSolidCircle(const b2Vec2& center, float radius, const b2Vec2& axis, const b2Color& color)  {
    EM_ASM_INT({
      var self = Module['getCache'](Module['JSDraw'])[$0];
      if (!self.hasOwnProperty('DrawSolidCircle')) throw 'a JSImplementation must implement all functions, you forgot JSDraw::DrawSolidCircle.';
      self['DrawSolidCircle']($1,$2,$3,$4);
    }, (ptrdiff_t)this, &center, radius, &axis, &color);
  }
  void DrawSegment(const b2Vec2& p1, const b2Vec2& p2, const b2Color& color)  {
    EM_ASM_INT({
      var self = Module['getCache'](Module['JSDraw'])[$0];
      if (!self.hasOwnProperty('DrawSegment')) throw 'a JSImplementation must implement all functions, you forgot JSDraw::DrawSegment.';
      self['DrawSegment']($1,$2,$3);
    }, (ptrdiff_t)this, &p1, &p2, &color);
  }
  void DrawTransform(const b2Transform& xf)  {
    EM_ASM_INT({
      var self = Module['getCache'](Module['JSDraw'])[$0];
      if (!self.hasOwnProperty('DrawTransform')) throw 'a JSImplementation must implement all functions, you forgot JSDraw::DrawTransform.';
      self['DrawTransform']($1);
    }, (ptrdiff_t)this, &xf);
  }
  void DrawPoint(const b2Vec2& p, float size, const b2Color& color)  {
    EM_ASM_INT({
      var self = Module['getCache'](Module['JSDraw'])[$0];
      if (!self.hasOwnProperty('DrawPoint')) throw 'a JSImplementation must implement all functions, you forgot JSDraw::DrawPoint.';
      self['DrawPoint']($1,$2,$3);
    }, (ptrdiff_t)this, &p, size, &color);
  }
  void __destroy__()  {
    EM_ASM_INT({
      var self = Module['getCache'](Module['JSDraw'])[$0];
      if (!self.hasOwnProperty('__destroy__')) throw 'a JSImplementation must implement all functions, you forgot JSDraw::__destroy__.';
      self['__destroy__']();
    }, (ptrdiff_t)this);
  }
};

extern "C" {

// Not using size_t for array indices as the values used by the javascript code are signed.

EM_JS(void, array_bounds_check_error, (size_t idx, size_t size), {
  throw 'Array index ' + idx + ' out of bounds: [0,' + size + ')';
});

void array_bounds_check(const int array_size, const int array_idx) {
  if (array_idx < 0 || array_idx >= array_size) {
    array_bounds_check_error(array_idx, array_size);
  }
}

// b2ContactListener

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactListener___destroy___0(b2ContactListener* self) {
  delete self;
}

// b2Shape

b2ShapeType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Shape_GetType_0(b2Shape* self) {
  return self->GetType();
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Shape_GetChildCount_0(b2Shape* self) {
  return self->GetChildCount();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Shape_TestPoint_2(b2Shape* self, b2Transform* xf, b2Vec2* p) {
  return self->TestPoint(*xf, *p);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Shape_RayCast_4(b2Shape* self, b2RayCastOutput* output, b2RayCastInput* input, b2Transform* transform, int childIndex) {
  return self->RayCast(output, *input, *transform, childIndex);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Shape_ComputeAABB_3(b2Shape* self, b2AABB* aabb, b2Transform* xf, int childIndex) {
  self->ComputeAABB(aabb, *xf, childIndex);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Shape_ComputeMass_2(b2Shape* self, b2MassData* massData, float density) {
  self->ComputeMass(massData, density);
}

b2ShapeType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Shape_get_m_type_0(b2Shape* self) {
  return self->m_type;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Shape_set_m_type_1(b2Shape* self, b2ShapeType arg0) {
  self->m_type = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Shape_get_m_radius_0(b2Shape* self) {
  return self->m_radius;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Shape_set_m_radius_1(b2Shape* self, float arg0) {
  self->m_radius = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Shape___destroy___0(b2Shape* self) {
  delete self;
}

// b2RayCastCallback

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RayCastCallback___destroy___0(b2RayCastCallback* self) {
  delete self;
}

// b2QueryCallback

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2QueryCallback___destroy___0(b2QueryCallback* self) {
  delete self;
}

// b2JointDef

b2JointDef* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointDef_b2JointDef_0() {
  return new b2JointDef();
}

b2JointType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointDef_get_type_0(b2JointDef* self) {
  return self->type;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointDef_set_type_1(b2JointDef* self, b2JointType arg0) {
  self->type = arg0;
}

b2JointUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointDef_get_userData_0(b2JointDef* self) {
  return &self->userData;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointDef_set_userData_1(b2JointDef* self, b2JointUserData* arg0) {
  self->userData = *arg0;
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointDef_get_bodyA_0(b2JointDef* self) {
  return self->bodyA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointDef_set_bodyA_1(b2JointDef* self, b2Body* arg0) {
  self->bodyA = arg0;
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointDef_get_bodyB_0(b2JointDef* self) {
  return self->bodyB;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointDef_set_bodyB_1(b2JointDef* self, b2Body* arg0) {
  self->bodyB = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointDef_get_collideConnected_0(b2JointDef* self) {
  return self->collideConnected;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointDef_set_collideConnected_1(b2JointDef* self, bool arg0) {
  self->collideConnected = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointDef___destroy___0(b2JointDef* self) {
  delete self;
}

// b2Joint

b2JointType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Joint_GetType_0(b2Joint* self) {
  return self->GetType();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Joint_GetBodyA_0(b2Joint* self) {
  return self->GetBodyA();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Joint_GetBodyB_0(b2Joint* self) {
  return self->GetBodyB();
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Joint_GetAnchorA_0(b2Joint* self) {
  static b2Vec2 temp;
  return (temp = self->GetAnchorA(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Joint_GetAnchorB_0(b2Joint* self) {
  static b2Vec2 temp;
  return (temp = self->GetAnchorB(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Joint_GetReactionForce_1(b2Joint* self, float inv_dt) {
  static b2Vec2 temp;
  return (temp = self->GetReactionForce(inv_dt), &temp);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Joint_GetReactionTorque_1(b2Joint* self, float inv_dt) {
  return self->GetReactionTorque(inv_dt);
}

b2Joint* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Joint_GetNext_0(b2Joint* self) {
  return self->GetNext();
}

b2JointUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Joint_GetUserData_0(b2Joint* self) {
  return &self->GetUserData();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Joint_GetCollideConnected_0(b2Joint* self) {
  return self->GetCollideConnected();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Joint_Dump_0(b2Joint* self) {
  self->Dump();
}

// b2ContactFilter

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactFilter___destroy___0(b2ContactFilter* self) {
  delete self;
}

// b2DestructionListenerWrapper

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DestructionListenerWrapper___destroy___0(b2DestructionListenerWrapper* self) {
  delete self;
}

// b2Draw

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Draw_SetFlags_1(b2Draw* self, unsigned int flags) {
  self->SetFlags(flags);
}

unsigned int EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Draw_GetFlags_0(b2Draw* self) {
  return self->GetFlags();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Draw_AppendFlags_1(b2Draw* self, unsigned int flags) {
  self->AppendFlags(flags);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Draw_ClearFlags_1(b2Draw* self, unsigned int flags) {
  self->ClearFlags(flags);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Draw___destroy___0(b2Draw* self) {
  delete self;
}

// VoidPtr

void EMSCRIPTEN_KEEPALIVE emscripten_bind_VoidPtr___destroy___0(void** self) {
  delete self;
}

// b2Contact

b2Manifold* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Contact_GetManifold_0(b2Contact* self) {
  return self->GetManifold();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Contact_GetWorldManifold_1(b2Contact* self, b2WorldManifold* manifold) {
  self->GetWorldManifold(manifold);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Contact_IsTouching_0(b2Contact* self) {
  return self->IsTouching();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Contact_SetEnabled_1(b2Contact* self, bool flag) {
  self->SetEnabled(flag);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Contact_IsEnabled_0(b2Contact* self) {
  return self->IsEnabled();
}

b2Contact* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Contact_GetNext_0(b2Contact* self) {
  return self->GetNext();
}

b2Fixture* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Contact_GetFixtureA_0(b2Contact* self) {
  return self->GetFixtureA();
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Contact_GetChildIndexA_0(b2Contact* self) {
  return self->GetChildIndexA();
}

b2Fixture* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Contact_GetFixtureB_0(b2Contact* self) {
  return self->GetFixtureB();
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Contact_GetChildIndexB_0(b2Contact* self) {
  return self->GetChildIndexB();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Contact_SetFriction_1(b2Contact* self, float friction) {
  self->SetFriction(friction);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Contact_GetFriction_0(b2Contact* self) {
  return self->GetFriction();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Contact_ResetFriction_0(b2Contact* self) {
  self->ResetFriction();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Contact_SetRestitution_1(b2Contact* self, float restitution) {
  self->SetRestitution(restitution);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Contact_GetRestitution_0(b2Contact* self) {
  return self->GetRestitution();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Contact_ResetRestitution_0(b2Contact* self) {
  self->ResetRestitution();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Contact_SetRestitutionThreshold_1(b2Contact* self, float threshold) {
  self->SetRestitutionThreshold(threshold);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Contact_GetRestitutionThreshold_0(b2Contact* self) {
  return self->GetRestitutionThreshold();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Contact_ResetRestitutionThreshold_0(b2Contact* self) {
  self->ResetRestitutionThreshold();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Contact_SetTangentSpeed_1(b2Contact* self, float speed) {
  self->SetTangentSpeed(speed);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Contact_GetTangentSpeed_0(b2Contact* self) {
  return self->GetTangentSpeed();
}

// JSContactListener

JSContactListener* EMSCRIPTEN_KEEPALIVE emscripten_bind_JSContactListener_JSContactListener_0() {
  return new JSContactListener();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_JSContactListener_BeginContact_1(JSContactListener* self, b2Contact* contact) {
  self->BeginContact(contact);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_JSContactListener_EndContact_1(JSContactListener* self, b2Contact* contact) {
  self->EndContact(contact);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_JSContactListener_PreSolve_2(JSContactListener* self, b2Contact* contact, const b2Manifold* oldManifold) {
  self->PreSolve(contact, oldManifold);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_JSContactListener_PostSolve_2(JSContactListener* self, b2Contact* contact, const b2ContactImpulse* impulse) {
  self->PostSolve(contact, impulse);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_JSContactListener___destroy___0(JSContactListener* self) {
  delete self;
}

// b2World

b2World* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_b2World_1(const b2Vec2* gravity) {
  return new b2World(*gravity);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_SetDestructionListener_1(b2World* self, b2DestructionListener* listener) {
  self->SetDestructionListener(listener);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_SetContactFilter_1(b2World* self, JSContactFilter* filter) {
  self->SetContactFilter(filter);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_SetContactListener_1(b2World* self, JSContactListener* listener) {
  self->SetContactListener(listener);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_SetDebugDraw_1(b2World* self, b2Draw* debugDraw) {
  self->SetDebugDraw(debugDraw);
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_CreateBody_1(b2World* self, const b2BodyDef* def) {
  return self->CreateBody(def);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_DestroyBody_1(b2World* self, b2Body* body) {
  self->DestroyBody(body);
}

b2Joint* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_CreateJoint_1(b2World* self, const b2JointDef* def) {
  return self->CreateJoint(def);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_DestroyJoint_1(b2World* self, b2Joint* joint) {
  self->DestroyJoint(joint);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_Step_3(b2World* self, float timeStep, int velocityIterations, int positionIterations) {
  self->Step(timeStep, velocityIterations, positionIterations);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_ClearForces_0(b2World* self) {
  self->ClearForces();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_DebugDraw_0(b2World* self) {
  self->DebugDraw();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_QueryAABB_2(b2World* self, b2QueryCallback* callback, b2AABB* aabb) {
  self->QueryAABB(callback, *aabb);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_RayCast_3(b2World* self, b2RayCastCallback* callback, b2Vec2* point1, b2Vec2* point2) {
  self->RayCast(callback, *point1, *point2);
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_GetBodyList_0(b2World* self) {
  return self->GetBodyList();
}

b2Joint* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_GetJointList_0(b2World* self) {
  return self->GetJointList();
}

b2Contact* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_GetContactList_0(b2World* self) {
  return self->GetContactList();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_SetAllowSleeping_1(b2World* self, bool flag) {
  self->SetAllowSleeping(flag);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_GetAllowSleeping_0(b2World* self) {
  return self->GetAllowSleeping();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_SetWarmStarting_1(b2World* self, bool flag) {
  self->SetWarmStarting(flag);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_GetWarmStarting_0(b2World* self) {
  return self->GetWarmStarting();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_SetContinuousPhysics_1(b2World* self, bool flag) {
  self->SetContinuousPhysics(flag);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_GetContinuousPhysics_0(b2World* self) {
  return self->GetContinuousPhysics();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_SetSubStepping_1(b2World* self, bool flag) {
  self->SetSubStepping(flag);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_GetSubStepping_0(b2World* self) {
  return self->GetSubStepping();
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_GetProxyCount_0(b2World* self) {
  return self->GetProxyCount();
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_GetBodyCount_0(b2World* self) {
  return self->GetBodyCount();
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_GetJointCount_0(b2World* self) {
  return self->GetJointCount();
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_GetContactCount_0(b2World* self) {
  return self->GetContactCount();
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_GetTreeHeight_0(b2World* self) {
  return self->GetTreeHeight();
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_GetTreeBalance_0(b2World* self) {
  return self->GetTreeBalance();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_GetTreeQuality_0(b2World* self) {
  return self->GetTreeQuality();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_SetGravity_1(b2World* self, b2Vec2* gravity) {
  self->SetGravity(*gravity);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_GetGravity_0(b2World* self) {
  static b2Vec2 temp;
  return (temp = self->GetGravity(), &temp);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_IsLocked_0(b2World* self) {
  return self->IsLocked();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_SetAutoClearForces_1(b2World* self, bool flag) {
  self->SetAutoClearForces(flag);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_GetAutoClearForces_0(b2World* self) {
  return self->GetAutoClearForces();
}

const b2Profile* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_GetProfile_0(b2World* self) {
  return &self->GetProfile();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World_Dump_0(b2World* self) {
  self->Dump();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2World___destroy___0(b2World* self) {
  delete self;
}

// b2FixtureUserData

unsigned int EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FixtureUserData_get_pointer_0(b2FixtureUserData* self) {
  return self->pointer;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FixtureUserData_set_pointer_1(b2FixtureUserData* self, unsigned int arg0) {
  self->pointer = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FixtureUserData___destroy___0(b2FixtureUserData* self) {
  delete self;
}

// b2FixtureDef

b2FixtureDef* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FixtureDef_b2FixtureDef_0() {
  return new b2FixtureDef();
}

const b2Shape* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FixtureDef_get_shape_0(b2FixtureDef* self) {
  return self->shape;
}

const void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FixtureDef_set_shape_1(b2FixtureDef* self, b2Shape* arg0) {
  self->shape = arg0;
}

b2FixtureUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FixtureDef_get_userData_0(b2FixtureDef* self) {
  return &self->userData;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FixtureDef_set_userData_1(b2FixtureDef* self, b2FixtureUserData* arg0) {
  self->userData = *arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FixtureDef_get_friction_0(b2FixtureDef* self) {
  return self->friction;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FixtureDef_set_friction_1(b2FixtureDef* self, float arg0) {
  self->friction = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FixtureDef_get_restitution_0(b2FixtureDef* self) {
  return self->restitution;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FixtureDef_set_restitution_1(b2FixtureDef* self, float arg0) {
  self->restitution = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FixtureDef_get_restitutionThreshold_0(b2FixtureDef* self) {
  return self->restitutionThreshold;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FixtureDef_set_restitutionThreshold_1(b2FixtureDef* self, float arg0) {
  self->restitutionThreshold = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FixtureDef_get_density_0(b2FixtureDef* self) {
  return self->density;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FixtureDef_set_density_1(b2FixtureDef* self, float arg0) {
  self->density = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FixtureDef_get_isSensor_0(b2FixtureDef* self) {
  return self->isSensor;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FixtureDef_set_isSensor_1(b2FixtureDef* self, bool arg0) {
  self->isSensor = arg0;
}

b2Filter* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FixtureDef_get_filter_0(b2FixtureDef* self) {
  return &self->filter;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FixtureDef_set_filter_1(b2FixtureDef* self, b2Filter* arg0) {
  self->filter = *arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FixtureDef___destroy___0(b2FixtureDef* self) {
  delete self;
}

// b2Fixture

b2ShapeType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture_GetType_0(b2Fixture* self) {
  return self->GetType();
}

b2Shape* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture_GetShape_0(b2Fixture* self) {
  return self->GetShape();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture_SetSensor_1(b2Fixture* self, bool sensor) {
  self->SetSensor(sensor);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture_IsSensor_0(b2Fixture* self) {
  return self->IsSensor();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture_SetFilterData_1(b2Fixture* self, const b2Filter* filter) {
  self->SetFilterData(*filter);
}

const b2Filter* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture_GetFilterData_0(b2Fixture* self) {
  return &self->GetFilterData();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture_Refilter_0(b2Fixture* self) {
  self->Refilter();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture_GetBody_0(b2Fixture* self) {
  return self->GetBody();
}

b2Fixture* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture_GetNext_0(b2Fixture* self) {
  return self->GetNext();
}

b2FixtureUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture_GetUserData_0(b2Fixture* self) {
  return &self->GetUserData();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture_TestPoint_1(b2Fixture* self, const b2Vec2* p) {
  return self->TestPoint(*p);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture_RayCast_3(b2Fixture* self, b2RayCastOutput* output, const b2RayCastInput* input, int childIndex) {
  return self->RayCast(output, *input, childIndex);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture_GetMassData_1(b2Fixture* self, b2MassData* massData) {
  self->GetMassData(massData);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture_SetDensity_1(b2Fixture* self, float density) {
  self->SetDensity(density);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture_GetDensity_0(b2Fixture* self) {
  return self->GetDensity();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture_GetFriction_0(b2Fixture* self) {
  return self->GetFriction();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture_SetFriction_1(b2Fixture* self, float friction) {
  self->SetFriction(friction);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture_GetRestitution_0(b2Fixture* self) {
  return self->GetRestitution();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture_SetRestitution_1(b2Fixture* self, float restitution) {
  self->SetRestitution(restitution);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture_GetRestitutionThreshold_0(b2Fixture* self) {
  return self->GetRestitutionThreshold();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture_SetRestitutionThreshold_1(b2Fixture* self, float threshold) {
  self->SetRestitutionThreshold(threshold);
}

const b2AABB* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture_GetAABB_1(b2Fixture* self, int childIndex) {
  return &self->GetAABB(childIndex);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture_Dump_1(b2Fixture* self, int bodyIndex) {
  self->Dump(bodyIndex);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Fixture___destroy___0(b2Fixture* self) {
  delete self;
}

// b2Transform

b2Transform* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Transform_b2Transform_0() {
  return new b2Transform();
}

b2Transform* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Transform_b2Transform_2(b2Vec2* position, b2Rot* rotation) {
  return new b2Transform(*position, *rotation);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Transform_SetIdentity_0(b2Transform* self) {
  self->SetIdentity();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Transform_Set_2(b2Transform* self, b2Vec2* position, float angle) {
  self->Set(*position, angle);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Transform_get_p_0(b2Transform* self) {
  return &self->p;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Transform_set_p_1(b2Transform* self, b2Vec2* arg0) {
  self->p = *arg0;
}

b2Rot* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Transform_get_q_0(b2Transform* self) {
  return &self->q;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Transform_set_q_1(b2Transform* self, b2Rot* arg0) {
  self->q = *arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Transform___destroy___0(b2Transform* self) {
  delete self;
}

// JSRayCastCallback

JSRayCastCallback* EMSCRIPTEN_KEEPALIVE emscripten_bind_JSRayCastCallback_JSRayCastCallback_0() {
  return new JSRayCastCallback();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_JSRayCastCallback_ReportFixture_4(JSRayCastCallback* self, b2Fixture* fixture, const b2Vec2* point, const b2Vec2* normal, float fraction) {
  return self->ReportFixture(fixture, *point, *normal, fraction);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_JSRayCastCallback___destroy___0(JSRayCastCallback* self) {
  delete self;
}

// JSQueryCallback

JSQueryCallback* EMSCRIPTEN_KEEPALIVE emscripten_bind_JSQueryCallback_JSQueryCallback_0() {
  return new JSQueryCallback();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_JSQueryCallback_ReportFixture_1(JSQueryCallback* self, b2Fixture* fixture) {
  return self->ReportFixture(fixture);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_JSQueryCallback___destroy___0(JSQueryCallback* self) {
  delete self;
}

// b2MassData

b2MassData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MassData_b2MassData_0() {
  return new b2MassData();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MassData_get_mass_0(b2MassData* self) {
  return self->mass;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MassData_set_mass_1(b2MassData* self, float arg0) {
  self->mass = arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MassData_get_center_0(b2MassData* self) {
  return &self->center;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MassData_set_center_1(b2MassData* self, b2Vec2* arg0) {
  self->center = *arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MassData_get_I_0(b2MassData* self) {
  return self->I;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MassData_set_I_1(b2MassData* self, float arg0) {
  self->I = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MassData___destroy___0(b2MassData* self) {
  delete self;
}

// b2Vec2

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec2_b2Vec2_0() {
  return new b2Vec2();
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec2_b2Vec2_2(float x, float y) {
  return new b2Vec2(x, y);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec2_SetZero_0(b2Vec2* self) {
  self->SetZero();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec2_Set_2(b2Vec2* self, float x, float y) {
  self->Set(x, y);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec2_op_add_1(b2Vec2* self, const b2Vec2* v) {
  (*self += *v);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec2_op_sub_1(b2Vec2* self, const b2Vec2* v) {
  (*self -= *v);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec2_op_mul_1(b2Vec2* self, float s) {
  (*self *= s);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec2_Length_0(b2Vec2* self) {
  return self->Length();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec2_LengthSquared_0(b2Vec2* self) {
  return self->LengthSquared();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec2_Normalize_0(b2Vec2* self) {
  return self->Normalize();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec2_IsValid_0(b2Vec2* self) {
  return self->IsValid();
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec2_Skew_0(b2Vec2* self) {
  static b2Vec2 temp;
  return (temp = self->Skew(), &temp);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec2_get_x_0(b2Vec2* self) {
  return self->x;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec2_set_x_1(b2Vec2* self, float arg0) {
  self->x = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec2_get_y_0(b2Vec2* self) {
  return self->y;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec2_set_y_1(b2Vec2* self, float arg0) {
  self->y = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec2___destroy___0(b2Vec2* self) {
  delete self;
}

// b2Vec3

b2Vec3* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec3_b2Vec3_0() {
  return new b2Vec3();
}

b2Vec3* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec3_b2Vec3_3(float x, float y, float z) {
  return new b2Vec3(x, y, z);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec3_SetZero_0(b2Vec3* self) {
  self->SetZero();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec3_Set_3(b2Vec3* self, float x, float y, float z) {
  self->Set(x, y, z);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec3_op_add_1(b2Vec3* self, const b2Vec3* v) {
  (*self += *v);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec3_op_sub_1(b2Vec3* self, const b2Vec3* v) {
  (*self -= *v);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec3_op_mul_1(b2Vec3* self, float s) {
  (*self *= s);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec3_get_x_0(b2Vec3* self) {
  return self->x;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec3_set_x_1(b2Vec3* self, float arg0) {
  self->x = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec3_get_y_0(b2Vec3* self) {
  return self->y;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec3_set_y_1(b2Vec3* self, float arg0) {
  self->y = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec3_get_z_0(b2Vec3* self) {
  return self->z;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec3_set_z_1(b2Vec3* self, float arg0) {
  self->z = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Vec3___destroy___0(b2Vec3* self) {
  delete self;
}

// b2BodyUserData

unsigned int EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyUserData_get_pointer_0(b2BodyUserData* self) {
  return self->pointer;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyUserData_set_pointer_1(b2BodyUserData* self, unsigned int arg0) {
  self->pointer = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyUserData___destroy___0(b2BodyUserData* self) {
  delete self;
}

// b2Body

b2Fixture* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_CreateFixture_1(b2Body* self, b2FixtureDef* shape) {
  return self->CreateFixture(shape);
}

b2Fixture* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_CreateFixture_2(b2Body* self, b2Shape* shape, float density) {
  return self->CreateFixture(shape, density);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_DestroyFixture_1(b2Body* self, b2Fixture* fixture) {
  self->DestroyFixture(fixture);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_SetTransform_2(b2Body* self, const b2Vec2* position, float angle) {
  self->SetTransform(*position, angle);
}

const b2Transform* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetTransform_0(b2Body* self) {
  return &self->GetTransform();
}

const b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetPosition_0(b2Body* self) {
  return &self->GetPosition();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetAngle_0(b2Body* self) {
  return self->GetAngle();
}

const b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetWorldCenter_0(b2Body* self) {
  return &self->GetWorldCenter();
}

const b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetLocalCenter_0(b2Body* self) {
  return &self->GetLocalCenter();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_SetLinearVelocity_1(b2Body* self, const b2Vec2* v) {
  self->SetLinearVelocity(*v);
}

const b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetLinearVelocity_0(b2Body* self) {
  return &self->GetLinearVelocity();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_SetAngularVelocity_1(b2Body* self, float omega) {
  self->SetAngularVelocity(omega);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetAngularVelocity_0(b2Body* self) {
  return self->GetAngularVelocity();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_ApplyForce_3(b2Body* self, const b2Vec2* force, const b2Vec2* point, bool wake) {
  self->ApplyForce(*force, *point, wake);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_ApplyForceToCenter_2(b2Body* self, const b2Vec2* force, bool wake) {
  self->ApplyForceToCenter(*force, wake);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_ApplyTorque_2(b2Body* self, float torque, bool awake) {
  self->ApplyTorque(torque, awake);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_ApplyLinearImpulse_3(b2Body* self, const b2Vec2* impulse, const b2Vec2* point, bool wake) {
  self->ApplyLinearImpulse(*impulse, *point, wake);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_ApplyLinearImpulseToCenter_2(b2Body* self, const b2Vec2* impulse, bool wake) {
  self->ApplyLinearImpulseToCenter(*impulse, wake);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_ApplyAngularImpulse_2(b2Body* self, float impulse, bool wake) {
  self->ApplyAngularImpulse(impulse, wake);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetMass_0(b2Body* self) {
  return self->GetMass();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetInertia_0(b2Body* self) {
  return self->GetInertia();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetMassData_1(b2Body* self, b2MassData* data) {
  self->GetMassData(data);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_SetMassData_1(b2Body* self, const b2MassData* data) {
  self->SetMassData(data);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_ResetMassData_0(b2Body* self) {
  self->ResetMassData();
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetWorldPoint_1(b2Body* self, const b2Vec2* localPoint) {
  static b2Vec2 temp;
  return (temp = self->GetWorldPoint(*localPoint), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetWorldVector_1(b2Body* self, const b2Vec2* localVector) {
  static b2Vec2 temp;
  return (temp = self->GetWorldVector(*localVector), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetLocalPoint_1(b2Body* self, const b2Vec2* worldPoint) {
  static b2Vec2 temp;
  return (temp = self->GetLocalPoint(*worldPoint), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetLocalVector_1(b2Body* self, const b2Vec2* worldVector) {
  static b2Vec2 temp;
  return (temp = self->GetLocalVector(*worldVector), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetLinearVelocityFromWorldPoint_1(b2Body* self, const b2Vec2* worldPoint) {
  static b2Vec2 temp;
  return (temp = self->GetLinearVelocityFromWorldPoint(*worldPoint), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetLinearVelocityFromLocalPoint_1(b2Body* self, const b2Vec2* localPoint) {
  static b2Vec2 temp;
  return (temp = self->GetLinearVelocityFromLocalPoint(*localPoint), &temp);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetLinearDamping_0(b2Body* self) {
  return self->GetLinearDamping();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_SetLinearDamping_1(b2Body* self, float linearDamping) {
  self->SetLinearDamping(linearDamping);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetAngularDamping_0(b2Body* self) {
  return self->GetAngularDamping();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_SetAngularDamping_1(b2Body* self, float angularDamping) {
  self->SetAngularDamping(angularDamping);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetGravityScale_0(b2Body* self) {
  return self->GetGravityScale();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_SetGravityScale_1(b2Body* self, float scale) {
  self->SetGravityScale(scale);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_SetType_1(b2Body* self, b2BodyType type) {
  self->SetType(type);
}

b2BodyType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetType_0(b2Body* self) {
  return self->GetType();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_SetBullet_1(b2Body* self, bool flag) {
  self->SetBullet(flag);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_IsBullet_0(b2Body* self) {
  return self->IsBullet();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_SetSleepingAllowed_1(b2Body* self, bool flag) {
  self->SetSleepingAllowed(flag);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_IsSleepingAllowed_0(b2Body* self) {
  return self->IsSleepingAllowed();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_SetAwake_1(b2Body* self, bool flag) {
  self->SetAwake(flag);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_IsAwake_0(b2Body* self) {
  return self->IsAwake();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_SetEnabled_1(b2Body* self, bool flag) {
  self->SetEnabled(flag);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_IsEnabled_0(b2Body* self) {
  return self->IsEnabled();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_SetFixedRotation_1(b2Body* self, bool flag) {
  self->SetFixedRotation(flag);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_IsFixedRotation_0(b2Body* self) {
  return self->IsFixedRotation();
}

b2Fixture* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetFixtureList_0(b2Body* self) {
  return self->GetFixtureList();
}

b2JointEdge* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetJointList_0(b2Body* self) {
  return self->GetJointList();
}

b2ContactEdge* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetContactList_0(b2Body* self) {
  return self->GetContactList();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetNext_0(b2Body* self) {
  return self->GetNext();
}

b2BodyUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetUserData_0(b2Body* self) {
  return &self->GetUserData();
}

b2World* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_GetWorld_0(b2Body* self) {
  return self->GetWorld();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Body_Dump_0(b2Body* self) {
  self->Dump();
}

// b2BodyDef

b2BodyDef* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_b2BodyDef_0() {
  return new b2BodyDef();
}

b2BodyType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_get_type_0(b2BodyDef* self) {
  return self->type;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_set_type_1(b2BodyDef* self, b2BodyType arg0) {
  self->type = arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_get_position_0(b2BodyDef* self) {
  return &self->position;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_set_position_1(b2BodyDef* self, b2Vec2* arg0) {
  self->position = *arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_get_angle_0(b2BodyDef* self) {
  return self->angle;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_set_angle_1(b2BodyDef* self, float arg0) {
  self->angle = arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_get_linearVelocity_0(b2BodyDef* self) {
  return &self->linearVelocity;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_set_linearVelocity_1(b2BodyDef* self, b2Vec2* arg0) {
  self->linearVelocity = *arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_get_angularVelocity_0(b2BodyDef* self) {
  return self->angularVelocity;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_set_angularVelocity_1(b2BodyDef* self, float arg0) {
  self->angularVelocity = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_get_linearDamping_0(b2BodyDef* self) {
  return self->linearDamping;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_set_linearDamping_1(b2BodyDef* self, float arg0) {
  self->linearDamping = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_get_angularDamping_0(b2BodyDef* self) {
  return self->angularDamping;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_set_angularDamping_1(b2BodyDef* self, float arg0) {
  self->angularDamping = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_get_allowSleep_0(b2BodyDef* self) {
  return self->allowSleep;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_set_allowSleep_1(b2BodyDef* self, bool arg0) {
  self->allowSleep = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_get_awake_0(b2BodyDef* self) {
  return self->awake;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_set_awake_1(b2BodyDef* self, bool arg0) {
  self->awake = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_get_fixedRotation_0(b2BodyDef* self) {
  return self->fixedRotation;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_set_fixedRotation_1(b2BodyDef* self, bool arg0) {
  self->fixedRotation = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_get_bullet_0(b2BodyDef* self) {
  return self->bullet;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_set_bullet_1(b2BodyDef* self, bool arg0) {
  self->bullet = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_get_enabled_0(b2BodyDef* self) {
  return self->enabled;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_set_enabled_1(b2BodyDef* self, bool arg0) {
  self->enabled = arg0;
}

b2BodyUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_get_userData_0(b2BodyDef* self) {
  return &self->userData;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_set_userData_1(b2BodyDef* self, b2BodyUserData* arg0) {
  self->userData = *arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_get_gravityScale_0(b2BodyDef* self) {
  return self->gravityScale;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef_set_gravityScale_1(b2BodyDef* self, float arg0) {
  self->gravityScale = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2BodyDef___destroy___0(b2BodyDef* self) {
  delete self;
}

// b2Filter

b2Filter* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Filter_b2Filter_0() {
  return new b2Filter();
}

unsigned short EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Filter_get_categoryBits_0(b2Filter* self) {
  return self->categoryBits;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Filter_set_categoryBits_1(b2Filter* self, unsigned short arg0) {
  self->categoryBits = arg0;
}

unsigned short EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Filter_get_maskBits_0(b2Filter* self) {
  return self->maskBits;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Filter_set_maskBits_1(b2Filter* self, unsigned short arg0) {
  self->maskBits = arg0;
}

short EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Filter_get_groupIndex_0(b2Filter* self) {
  return self->groupIndex;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Filter_set_groupIndex_1(b2Filter* self, short arg0) {
  self->groupIndex = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Filter___destroy___0(b2Filter* self) {
  delete self;
}

// b2AABB

b2AABB* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2AABB_b2AABB_0() {
  return new b2AABB();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2AABB_IsValid_0(b2AABB* self) {
  return self->IsValid();
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2AABB_GetCenter_0(b2AABB* self) {
  static b2Vec2 temp;
  return (temp = self->GetCenter(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2AABB_GetExtents_0(b2AABB* self) {
  static b2Vec2 temp;
  return (temp = self->GetExtents(), &temp);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2AABB_GetPerimeter_0(b2AABB* self) {
  return self->GetPerimeter();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2AABB_Combine_1(b2AABB* self, b2AABB* aabb1) {
  self->Combine(*aabb1);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2AABB_Combine_2(b2AABB* self, b2AABB* aabb1, b2AABB* aabb2) {
  self->Combine(*aabb1, *aabb2);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2AABB_Contains_1(b2AABB* self, b2AABB* aabb) {
  return self->Contains(*aabb);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2AABB_RayCast_2(b2AABB* self, b2RayCastOutput* output, b2RayCastInput* input) {
  return self->RayCast(output, *input);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2AABB_get_lowerBound_0(b2AABB* self) {
  return &self->lowerBound;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2AABB_set_lowerBound_1(b2AABB* self, b2Vec2* arg0) {
  self->lowerBound = *arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2AABB_get_upperBound_0(b2AABB* self) {
  return &self->upperBound;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2AABB_set_upperBound_1(b2AABB* self, b2Vec2* arg0) {
  self->upperBound = *arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2AABB___destroy___0(b2AABB* self) {
  delete self;
}

// b2CircleShape

b2CircleShape* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2CircleShape_b2CircleShape_0() {
  return new b2CircleShape();
}

b2ShapeType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2CircleShape_GetType_0(b2CircleShape* self) {
  return self->GetType();
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_b2CircleShape_GetChildCount_0(b2CircleShape* self) {
  return self->GetChildCount();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2CircleShape_TestPoint_2(b2CircleShape* self, b2Transform* xf, b2Vec2* p) {
  return self->TestPoint(*xf, *p);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2CircleShape_RayCast_4(b2CircleShape* self, b2RayCastOutput* output, b2RayCastInput* input, b2Transform* transform, int childIndex) {
  return self->RayCast(output, *input, *transform, childIndex);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2CircleShape_ComputeAABB_3(b2CircleShape* self, b2AABB* aabb, b2Transform* xf, int childIndex) {
  self->ComputeAABB(aabb, *xf, childIndex);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2CircleShape_ComputeMass_2(b2CircleShape* self, b2MassData* massData, float density) {
  self->ComputeMass(massData, density);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2CircleShape_get_m_p_0(b2CircleShape* self) {
  return &self->m_p;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2CircleShape_set_m_p_1(b2CircleShape* self, b2Vec2* arg0) {
  self->m_p = *arg0;
}

b2ShapeType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2CircleShape_get_m_type_0(b2CircleShape* self) {
  return self->m_type;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2CircleShape_set_m_type_1(b2CircleShape* self, b2ShapeType arg0) {
  self->m_type = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2CircleShape_get_m_radius_0(b2CircleShape* self) {
  return self->m_radius;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2CircleShape_set_m_radius_1(b2CircleShape* self, float arg0) {
  self->m_radius = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2CircleShape___destroy___0(b2CircleShape* self) {
  delete self;
}

// b2EdgeShape

b2EdgeShape* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape_b2EdgeShape_0() {
  return new b2EdgeShape();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape_SetOneSided_4(b2EdgeShape* self, const b2Vec2* v0, const b2Vec2* v1, const b2Vec2* v2, const b2Vec2* v3) {
  self->SetOneSided(*v0, *v1, *v2, *v3);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape_SetTwoSided_2(b2EdgeShape* self, const b2Vec2* v1, const b2Vec2* v2) {
  self->SetTwoSided(*v1, *v2);
}

b2ShapeType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape_GetType_0(b2EdgeShape* self) {
  return self->GetType();
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape_GetChildCount_0(b2EdgeShape* self) {
  return self->GetChildCount();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape_TestPoint_2(b2EdgeShape* self, b2Transform* xf, b2Vec2* p) {
  return self->TestPoint(*xf, *p);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape_RayCast_4(b2EdgeShape* self, b2RayCastOutput* output, b2RayCastInput* input, b2Transform* transform, int childIndex) {
  return self->RayCast(output, *input, *transform, childIndex);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape_ComputeAABB_3(b2EdgeShape* self, b2AABB* aabb, b2Transform* xf, int childIndex) {
  self->ComputeAABB(aabb, *xf, childIndex);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape_ComputeMass_2(b2EdgeShape* self, b2MassData* massData, float density) {
  self->ComputeMass(massData, density);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape_get_m_vertex1_0(b2EdgeShape* self) {
  return &self->m_vertex1;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape_set_m_vertex1_1(b2EdgeShape* self, b2Vec2* arg0) {
  self->m_vertex1 = *arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape_get_m_vertex2_0(b2EdgeShape* self) {
  return &self->m_vertex2;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape_set_m_vertex2_1(b2EdgeShape* self, b2Vec2* arg0) {
  self->m_vertex2 = *arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape_get_m_vertex0_0(b2EdgeShape* self) {
  return &self->m_vertex0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape_set_m_vertex0_1(b2EdgeShape* self, b2Vec2* arg0) {
  self->m_vertex0 = *arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape_get_m_vertex3_0(b2EdgeShape* self) {
  return &self->m_vertex3;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape_set_m_vertex3_1(b2EdgeShape* self, b2Vec2* arg0) {
  self->m_vertex3 = *arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape_get_m_oneSided_0(b2EdgeShape* self) {
  return self->m_oneSided;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape_set_m_oneSided_1(b2EdgeShape* self, bool arg0) {
  self->m_oneSided = arg0;
}

b2ShapeType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape_get_m_type_0(b2EdgeShape* self) {
  return self->m_type;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape_set_m_type_1(b2EdgeShape* self, b2ShapeType arg0) {
  self->m_type = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape_get_m_radius_0(b2EdgeShape* self) {
  return self->m_radius;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape_set_m_radius_1(b2EdgeShape* self, float arg0) {
  self->m_radius = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2EdgeShape___destroy___0(b2EdgeShape* self) {
  delete self;
}

// b2JointUserData

unsigned int EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointUserData_get_pointer_0(b2JointUserData* self) {
  return self->pointer;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointUserData_set_pointer_1(b2JointUserData* self, unsigned int arg0) {
  self->pointer = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointUserData___destroy___0(b2JointUserData* self) {
  delete self;
}

// b2WeldJoint

const b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJoint_GetLocalAnchorA_0(b2WeldJoint* self) {
  return &self->GetLocalAnchorA();
}

const b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJoint_GetLocalAnchorB_0(b2WeldJoint* self) {
  return &self->GetLocalAnchorB();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJoint_GetReferenceAngle_0(b2WeldJoint* self) {
  return self->GetReferenceAngle();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJoint_SetStiffness_1(b2WeldJoint* self, float stiffness) {
  self->SetStiffness(stiffness);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJoint_GetStiffness_0(b2WeldJoint* self) {
  return self->GetStiffness();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJoint_SetDamping_1(b2WeldJoint* self, float damping) {
  self->SetDamping(damping);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJoint_GetDamping_0(b2WeldJoint* self) {
  return self->GetDamping();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJoint_Dump_0(b2WeldJoint* self) {
  self->Dump();
}

b2JointType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJoint_GetType_0(b2WeldJoint* self) {
  return self->GetType();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJoint_GetBodyA_0(b2WeldJoint* self) {
  return self->GetBodyA();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJoint_GetBodyB_0(b2WeldJoint* self) {
  return self->GetBodyB();
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJoint_GetAnchorA_0(b2WeldJoint* self) {
  static b2Vec2 temp;
  return (temp = self->GetAnchorA(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJoint_GetAnchorB_0(b2WeldJoint* self) {
  static b2Vec2 temp;
  return (temp = self->GetAnchorB(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJoint_GetReactionForce_1(b2WeldJoint* self, float inv_dt) {
  static b2Vec2 temp;
  return (temp = self->GetReactionForce(inv_dt), &temp);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJoint_GetReactionTorque_1(b2WeldJoint* self, float inv_dt) {
  return self->GetReactionTorque(inv_dt);
}

b2Joint* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJoint_GetNext_0(b2WeldJoint* self) {
  return self->GetNext();
}

b2JointUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJoint_GetUserData_0(b2WeldJoint* self) {
  return &self->GetUserData();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJoint_GetCollideConnected_0(b2WeldJoint* self) {
  return self->GetCollideConnected();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJoint___destroy___0(b2WeldJoint* self) {
  delete self;
}

// b2WeldJointDef

b2WeldJointDef* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJointDef_b2WeldJointDef_0() {
  return new b2WeldJointDef();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJointDef_Initialize_3(b2WeldJointDef* self, b2Body* bodyA, b2Body* bodyB, b2Vec2* anchor) {
  self->Initialize(bodyA, bodyB, *anchor);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJointDef_get_localAnchorA_0(b2WeldJointDef* self) {
  return &self->localAnchorA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJointDef_set_localAnchorA_1(b2WeldJointDef* self, b2Vec2* arg0) {
  self->localAnchorA = *arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJointDef_get_localAnchorB_0(b2WeldJointDef* self) {
  return &self->localAnchorB;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJointDef_set_localAnchorB_1(b2WeldJointDef* self, b2Vec2* arg0) {
  self->localAnchorB = *arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJointDef_get_referenceAngle_0(b2WeldJointDef* self) {
  return self->referenceAngle;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJointDef_set_referenceAngle_1(b2WeldJointDef* self, float arg0) {
  self->referenceAngle = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJointDef_get_stiffness_0(b2WeldJointDef* self) {
  return self->stiffness;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJointDef_set_stiffness_1(b2WeldJointDef* self, float arg0) {
  self->stiffness = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJointDef_get_damping_0(b2WeldJointDef* self) {
  return self->damping;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJointDef_set_damping_1(b2WeldJointDef* self, float arg0) {
  self->damping = arg0;
}

b2JointType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJointDef_get_type_0(b2WeldJointDef* self) {
  return self->type;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJointDef_set_type_1(b2WeldJointDef* self, b2JointType arg0) {
  self->type = arg0;
}

b2JointUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJointDef_get_userData_0(b2WeldJointDef* self) {
  return &self->userData;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJointDef_set_userData_1(b2WeldJointDef* self, b2JointUserData* arg0) {
  self->userData = *arg0;
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJointDef_get_bodyA_0(b2WeldJointDef* self) {
  return self->bodyA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJointDef_set_bodyA_1(b2WeldJointDef* self, b2Body* arg0) {
  self->bodyA = arg0;
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJointDef_get_bodyB_0(b2WeldJointDef* self) {
  return self->bodyB;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJointDef_set_bodyB_1(b2WeldJointDef* self, b2Body* arg0) {
  self->bodyB = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJointDef_get_collideConnected_0(b2WeldJointDef* self) {
  return self->collideConnected;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJointDef_set_collideConnected_1(b2WeldJointDef* self, bool arg0) {
  self->collideConnected = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WeldJointDef___destroy___0(b2WeldJointDef* self) {
  delete self;
}

// b2ChainShape

b2ChainShape* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape_b2ChainShape_0() {
  return new b2ChainShape();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape_Clear_0(b2ChainShape* self) {
  self->Clear();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape_CreateLoop_2(b2ChainShape* self, const b2Vec2* vertices, int count) {
  self->CreateLoop(vertices, count);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape_CreateChain_4(b2ChainShape* self, const b2Vec2* vertices, int count, const b2Vec2* prevVertex, const b2Vec2* nextVertex) {
  self->CreateChain(vertices, count, *prevVertex, *nextVertex);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape_GetChildEdge_2(b2ChainShape* self, b2EdgeShape* edge, int index) {
  self->GetChildEdge(edge, index);
}

b2ShapeType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape_GetType_0(b2ChainShape* self) {
  return self->GetType();
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape_GetChildCount_0(b2ChainShape* self) {
  return self->GetChildCount();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape_TestPoint_2(b2ChainShape* self, b2Transform* xf, b2Vec2* p) {
  return self->TestPoint(*xf, *p);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape_RayCast_4(b2ChainShape* self, b2RayCastOutput* output, b2RayCastInput* input, b2Transform* transform, int childIndex) {
  return self->RayCast(output, *input, *transform, childIndex);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape_ComputeAABB_3(b2ChainShape* self, b2AABB* aabb, b2Transform* xf, int childIndex) {
  self->ComputeAABB(aabb, *xf, childIndex);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape_ComputeMass_2(b2ChainShape* self, b2MassData* massData, float density) {
  self->ComputeMass(massData, density);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape_get_m_vertices_0(b2ChainShape* self) {
  return self->m_vertices;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape_set_m_vertices_1(b2ChainShape* self, b2Vec2* arg0) {
  self->m_vertices = arg0;
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape_get_m_count_0(b2ChainShape* self) {
  return self->m_count;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape_set_m_count_1(b2ChainShape* self, int arg0) {
  self->m_count = arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape_get_m_prevVertex_0(b2ChainShape* self) {
  return &self->m_prevVertex;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape_set_m_prevVertex_1(b2ChainShape* self, b2Vec2* arg0) {
  self->m_prevVertex = *arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape_get_m_nextVertex_0(b2ChainShape* self) {
  return &self->m_nextVertex;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape_set_m_nextVertex_1(b2ChainShape* self, b2Vec2* arg0) {
  self->m_nextVertex = *arg0;
}

b2ShapeType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape_get_m_type_0(b2ChainShape* self) {
  return self->m_type;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape_set_m_type_1(b2ChainShape* self, b2ShapeType arg0) {
  self->m_type = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape_get_m_radius_0(b2ChainShape* self) {
  return self->m_radius;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape_set_m_radius_1(b2ChainShape* self, float arg0) {
  self->m_radius = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ChainShape___destroy___0(b2ChainShape* self) {
  delete self;
}

// b2Color

b2Color* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Color_b2Color_0() {
  return new b2Color();
}

b2Color* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Color_b2Color_3(float r, float g, float b) {
  return new b2Color(r, g, b);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Color_Set_3(b2Color* self, float ri, float gi, float bi) {
  self->Set(ri, gi, bi);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Color_get_r_0(b2Color* self) {
  return self->r;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Color_set_r_1(b2Color* self, float arg0) {
  self->r = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Color_get_g_0(b2Color* self) {
  return self->g;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Color_set_g_1(b2Color* self, float arg0) {
  self->g = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Color_get_b_0(b2Color* self) {
  return self->b;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Color_set_b_1(b2Color* self, float arg0) {
  self->b = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Color___destroy___0(b2Color* self) {
  delete self;
}

// b2ContactEdge

b2ContactEdge* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactEdge_b2ContactEdge_0() {
  return new b2ContactEdge();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactEdge_get_other_0(b2ContactEdge* self) {
  return self->other;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactEdge_set_other_1(b2ContactEdge* self, b2Body* arg0) {
  self->other = arg0;
}

b2Contact* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactEdge_get_contact_0(b2ContactEdge* self) {
  return self->contact;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactEdge_set_contact_1(b2ContactEdge* self, b2Contact* arg0) {
  self->contact = arg0;
}

b2ContactEdge* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactEdge_get_prev_0(b2ContactEdge* self) {
  return self->prev;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactEdge_set_prev_1(b2ContactEdge* self, b2ContactEdge* arg0) {
  self->prev = arg0;
}

b2ContactEdge* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactEdge_get_next_0(b2ContactEdge* self) {
  return self->next;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactEdge_set_next_1(b2ContactEdge* self, b2ContactEdge* arg0) {
  self->next = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactEdge___destroy___0(b2ContactEdge* self) {
  delete self;
}

// b2ContactFeature

unsigned char EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactFeature_get_indexA_0(b2ContactFeature* self) {
  return self->indexA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactFeature_set_indexA_1(b2ContactFeature* self, unsigned char arg0) {
  self->indexA = arg0;
}

unsigned char EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactFeature_get_indexB_0(b2ContactFeature* self) {
  return self->indexB;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactFeature_set_indexB_1(b2ContactFeature* self, unsigned char arg0) {
  self->indexB = arg0;
}

unsigned char EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactFeature_get_typeA_0(b2ContactFeature* self) {
  return self->typeA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactFeature_set_typeA_1(b2ContactFeature* self, unsigned char arg0) {
  self->typeA = arg0;
}

unsigned char EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactFeature_get_typeB_0(b2ContactFeature* self) {
  return self->typeB;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactFeature_set_typeB_1(b2ContactFeature* self, unsigned char arg0) {
  self->typeB = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactFeature___destroy___0(b2ContactFeature* self) {
  delete self;
}

// JSContactFilter

JSContactFilter* EMSCRIPTEN_KEEPALIVE emscripten_bind_JSContactFilter_JSContactFilter_0() {
  return new JSContactFilter();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_JSContactFilter_ShouldCollide_2(JSContactFilter* self, b2Fixture* fixtureA, b2Fixture* fixtureB) {
  return self->ShouldCollide(fixtureA, fixtureB);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_JSContactFilter___destroy___0(JSContactFilter* self) {
  delete self;
}

// b2ContactID

b2ContactFeature* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactID_get_cf_0(b2ContactID* self) {
  return &self->cf;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactID_set_cf_1(b2ContactID* self, b2ContactFeature* arg0) {
  self->cf = *arg0;
}

unsigned int EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactID_get_key_0(b2ContactID* self) {
  return self->key;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactID_set_key_1(b2ContactID* self, unsigned int arg0) {
  self->key = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactID___destroy___0(b2ContactID* self) {
  delete self;
}

// b2ContactImpulse

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactImpulse_get_normalImpulses_1(b2ContactImpulse* self, int arg0) {
  return (array_bounds_check(sizeof(self->normalImpulses) / sizeof(self->normalImpulses[0]), arg0), self->normalImpulses[arg0]);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactImpulse_set_normalImpulses_2(b2ContactImpulse* self, int arg0, float arg1) {
  (array_bounds_check(sizeof(self->normalImpulses) / sizeof(self->normalImpulses[0]), arg0), self->normalImpulses[arg0] = arg1);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactImpulse_get_tangentImpulses_1(b2ContactImpulse* self, int arg0) {
  return (array_bounds_check(sizeof(self->tangentImpulses) / sizeof(self->tangentImpulses[0]), arg0), self->tangentImpulses[arg0]);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactImpulse_set_tangentImpulses_2(b2ContactImpulse* self, int arg0, float arg1) {
  (array_bounds_check(sizeof(self->tangentImpulses) / sizeof(self->tangentImpulses[0]), arg0), self->tangentImpulses[arg0] = arg1);
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactImpulse_get_count_0(b2ContactImpulse* self) {
  return self->count;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactImpulse_set_count_1(b2ContactImpulse* self, int arg0) {
  self->count = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ContactImpulse___destroy___0(b2ContactImpulse* self) {
  delete self;
}

// b2DestructionListener

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DestructionListener___destroy___0(b2DestructionListener* self) {
  delete self;
}

// JSDestructionListener

JSDestructionListener* EMSCRIPTEN_KEEPALIVE emscripten_bind_JSDestructionListener_JSDestructionListener_0() {
  return new JSDestructionListener();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_JSDestructionListener_SayGoodbyeJoint_1(JSDestructionListener* self, b2Joint* joint) {
  self->SayGoodbyeJoint(joint);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_JSDestructionListener_SayGoodbyeFixture_1(JSDestructionListener* self, b2Fixture* joint) {
  self->SayGoodbyeFixture(joint);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_JSDestructionListener___destroy___0(JSDestructionListener* self) {
  delete self;
}

// b2DistanceJoint

const b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint_GetLocalAnchorA_0(b2DistanceJoint* self) {
  return &self->GetLocalAnchorA();
}

const b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint_GetLocalAnchorB_0(b2DistanceJoint* self) {
  return &self->GetLocalAnchorB();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint_GetLength_0(b2DistanceJoint* self) {
  return self->GetLength();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint_SetLength_1(b2DistanceJoint* self, float length) {
  self->SetLength(length);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint_GetMinLength_0(b2DistanceJoint* self) {
  return self->GetMinLength();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint_SetMinLength_1(b2DistanceJoint* self, float minLength) {
  self->SetMinLength(minLength);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint_GetMaxLength_0(b2DistanceJoint* self) {
  return self->GetMaxLength();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint_SetMaxLength_1(b2DistanceJoint* self, float maxLength) {
  self->SetMaxLength(maxLength);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint_GetCurrentLength_0(b2DistanceJoint* self) {
  return self->GetCurrentLength();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint_SetStiffness_1(b2DistanceJoint* self, float stiffness) {
  self->SetStiffness(stiffness);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint_GetStiffness_0(b2DistanceJoint* self) {
  return self->GetStiffness();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint_SetDamping_1(b2DistanceJoint* self, float damping) {
  self->SetDamping(damping);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint_GetDamping_0(b2DistanceJoint* self) {
  return self->GetDamping();
}

b2JointType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint_GetType_0(b2DistanceJoint* self) {
  return self->GetType();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint_GetBodyA_0(b2DistanceJoint* self) {
  return self->GetBodyA();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint_GetBodyB_0(b2DistanceJoint* self) {
  return self->GetBodyB();
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint_GetAnchorA_0(b2DistanceJoint* self) {
  static b2Vec2 temp;
  return (temp = self->GetAnchorA(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint_GetAnchorB_0(b2DistanceJoint* self) {
  static b2Vec2 temp;
  return (temp = self->GetAnchorB(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint_GetReactionForce_1(b2DistanceJoint* self, float inv_dt) {
  static b2Vec2 temp;
  return (temp = self->GetReactionForce(inv_dt), &temp);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint_GetReactionTorque_1(b2DistanceJoint* self, float inv_dt) {
  return self->GetReactionTorque(inv_dt);
}

b2Joint* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint_GetNext_0(b2DistanceJoint* self) {
  return self->GetNext();
}

b2JointUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint_GetUserData_0(b2DistanceJoint* self) {
  return &self->GetUserData();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint_GetCollideConnected_0(b2DistanceJoint* self) {
  return self->GetCollideConnected();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJoint___destroy___0(b2DistanceJoint* self) {
  delete self;
}

// b2DistanceJointDef

b2DistanceJointDef* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_b2DistanceJointDef_0() {
  return new b2DistanceJointDef();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_Initialize_4(b2DistanceJointDef* self, b2Body* bodyA, b2Body* bodyB, const b2Vec2* anchorA, const b2Vec2* anchorB) {
  self->Initialize(bodyA, bodyB, *anchorA, *anchorB);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_get_localAnchorA_0(b2DistanceJointDef* self) {
  return &self->localAnchorA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_set_localAnchorA_1(b2DistanceJointDef* self, b2Vec2* arg0) {
  self->localAnchorA = *arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_get_localAnchorB_0(b2DistanceJointDef* self) {
  return &self->localAnchorB;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_set_localAnchorB_1(b2DistanceJointDef* self, b2Vec2* arg0) {
  self->localAnchorB = *arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_get_length_0(b2DistanceJointDef* self) {
  return self->length;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_set_length_1(b2DistanceJointDef* self, float arg0) {
  self->length = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_get_minLength_0(b2DistanceJointDef* self) {
  return self->minLength;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_set_minLength_1(b2DistanceJointDef* self, float arg0) {
  self->minLength = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_get_maxLength_0(b2DistanceJointDef* self) {
  return self->maxLength;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_set_maxLength_1(b2DistanceJointDef* self, float arg0) {
  self->maxLength = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_get_stiffness_0(b2DistanceJointDef* self) {
  return self->stiffness;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_set_stiffness_1(b2DistanceJointDef* self, float arg0) {
  self->stiffness = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_get_damping_0(b2DistanceJointDef* self) {
  return self->damping;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_set_damping_1(b2DistanceJointDef* self, float arg0) {
  self->damping = arg0;
}

b2JointType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_get_type_0(b2DistanceJointDef* self) {
  return self->type;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_set_type_1(b2DistanceJointDef* self, b2JointType arg0) {
  self->type = arg0;
}

b2JointUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_get_userData_0(b2DistanceJointDef* self) {
  return &self->userData;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_set_userData_1(b2DistanceJointDef* self, b2JointUserData* arg0) {
  self->userData = *arg0;
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_get_bodyA_0(b2DistanceJointDef* self) {
  return self->bodyA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_set_bodyA_1(b2DistanceJointDef* self, b2Body* arg0) {
  self->bodyA = arg0;
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_get_bodyB_0(b2DistanceJointDef* self) {
  return self->bodyB;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_set_bodyB_1(b2DistanceJointDef* self, b2Body* arg0) {
  self->bodyB = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_get_collideConnected_0(b2DistanceJointDef* self) {
  return self->collideConnected;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef_set_collideConnected_1(b2DistanceJointDef* self, bool arg0) {
  self->collideConnected = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2DistanceJointDef___destroy___0(b2DistanceJointDef* self) {
  delete self;
}

// JSDraw

JSDraw* EMSCRIPTEN_KEEPALIVE emscripten_bind_JSDraw_JSDraw_0() {
  return new JSDraw();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_JSDraw_DrawPolygon_3(JSDraw* self, const b2Vec2* vertices, int vertexCount, const b2Color* color) {
  self->DrawPolygon(vertices, vertexCount, *color);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_JSDraw_DrawSolidPolygon_3(JSDraw* self, const b2Vec2* vertices, int vertexCount, const b2Color* color) {
  self->DrawSolidPolygon(vertices, vertexCount, *color);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_JSDraw_DrawCircle_3(JSDraw* self, const b2Vec2* center, float radius, const b2Color* color) {
  self->DrawCircle(*center, radius, *color);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_JSDraw_DrawSolidCircle_4(JSDraw* self, const b2Vec2* center, float radius, const b2Vec2* axis, const b2Color* color) {
  self->DrawSolidCircle(*center, radius, *axis, *color);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_JSDraw_DrawSegment_3(JSDraw* self, const b2Vec2* p1, const b2Vec2* p2, const b2Color* color) {
  self->DrawSegment(*p1, *p2, *color);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_JSDraw_DrawTransform_1(JSDraw* self, const b2Transform* xf) {
  self->DrawTransform(*xf);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_JSDraw_DrawPoint_3(JSDraw* self, const b2Vec2* p, float size, const b2Color* color) {
  self->DrawPoint(*p, size, *color);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_JSDraw___destroy___0(JSDraw* self) {
  delete self;
}

// b2FrictionJoint

const b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJoint_GetLocalAnchorA_0(b2FrictionJoint* self) {
  return &self->GetLocalAnchorA();
}

const b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJoint_GetLocalAnchorB_0(b2FrictionJoint* self) {
  return &self->GetLocalAnchorB();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJoint_SetMaxForce_1(b2FrictionJoint* self, float force) {
  self->SetMaxForce(force);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJoint_GetMaxForce_0(b2FrictionJoint* self) {
  return self->GetMaxForce();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJoint_SetMaxTorque_1(b2FrictionJoint* self, float torque) {
  self->SetMaxTorque(torque);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJoint_GetMaxTorque_0(b2FrictionJoint* self) {
  return self->GetMaxTorque();
}

b2JointType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJoint_GetType_0(b2FrictionJoint* self) {
  return self->GetType();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJoint_GetBodyA_0(b2FrictionJoint* self) {
  return self->GetBodyA();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJoint_GetBodyB_0(b2FrictionJoint* self) {
  return self->GetBodyB();
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJoint_GetAnchorA_0(b2FrictionJoint* self) {
  static b2Vec2 temp;
  return (temp = self->GetAnchorA(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJoint_GetAnchorB_0(b2FrictionJoint* self) {
  static b2Vec2 temp;
  return (temp = self->GetAnchorB(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJoint_GetReactionForce_1(b2FrictionJoint* self, float inv_dt) {
  static b2Vec2 temp;
  return (temp = self->GetReactionForce(inv_dt), &temp);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJoint_GetReactionTorque_1(b2FrictionJoint* self, float inv_dt) {
  return self->GetReactionTorque(inv_dt);
}

b2Joint* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJoint_GetNext_0(b2FrictionJoint* self) {
  return self->GetNext();
}

b2JointUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJoint_GetUserData_0(b2FrictionJoint* self) {
  return &self->GetUserData();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJoint_GetCollideConnected_0(b2FrictionJoint* self) {
  return self->GetCollideConnected();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJoint___destroy___0(b2FrictionJoint* self) {
  delete self;
}

// b2FrictionJointDef

b2FrictionJointDef* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJointDef_b2FrictionJointDef_0() {
  return new b2FrictionJointDef();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJointDef_Initialize_3(b2FrictionJointDef* self, b2Body* bodyA, b2Body* bodyB, b2Vec2* anchor) {
  self->Initialize(bodyA, bodyB, *anchor);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJointDef_get_localAnchorA_0(b2FrictionJointDef* self) {
  return &self->localAnchorA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJointDef_set_localAnchorA_1(b2FrictionJointDef* self, b2Vec2* arg0) {
  self->localAnchorA = *arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJointDef_get_localAnchorB_0(b2FrictionJointDef* self) {
  return &self->localAnchorB;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJointDef_set_localAnchorB_1(b2FrictionJointDef* self, b2Vec2* arg0) {
  self->localAnchorB = *arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJointDef_get_maxForce_0(b2FrictionJointDef* self) {
  return self->maxForce;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJointDef_set_maxForce_1(b2FrictionJointDef* self, float arg0) {
  self->maxForce = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJointDef_get_maxTorque_0(b2FrictionJointDef* self) {
  return self->maxTorque;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJointDef_set_maxTorque_1(b2FrictionJointDef* self, float arg0) {
  self->maxTorque = arg0;
}

b2JointType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJointDef_get_type_0(b2FrictionJointDef* self) {
  return self->type;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJointDef_set_type_1(b2FrictionJointDef* self, b2JointType arg0) {
  self->type = arg0;
}

b2JointUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJointDef_get_userData_0(b2FrictionJointDef* self) {
  return &self->userData;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJointDef_set_userData_1(b2FrictionJointDef* self, b2JointUserData* arg0) {
  self->userData = *arg0;
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJointDef_get_bodyA_0(b2FrictionJointDef* self) {
  return self->bodyA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJointDef_set_bodyA_1(b2FrictionJointDef* self, b2Body* arg0) {
  self->bodyA = arg0;
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJointDef_get_bodyB_0(b2FrictionJointDef* self) {
  return self->bodyB;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJointDef_set_bodyB_1(b2FrictionJointDef* self, b2Body* arg0) {
  self->bodyB = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJointDef_get_collideConnected_0(b2FrictionJointDef* self) {
  return self->collideConnected;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJointDef_set_collideConnected_1(b2FrictionJointDef* self, bool arg0) {
  self->collideConnected = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2FrictionJointDef___destroy___0(b2FrictionJointDef* self) {
  delete self;
}

// b2GearJoint

b2Joint* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJoint_GetJoint1_0(b2GearJoint* self) {
  return self->GetJoint1();
}

b2Joint* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJoint_GetJoint2_0(b2GearJoint* self) {
  return self->GetJoint2();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJoint_SetRatio_1(b2GearJoint* self, float ratio) {
  self->SetRatio(ratio);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJoint_GetRatio_0(b2GearJoint* self) {
  return self->GetRatio();
}

b2JointType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJoint_GetType_0(b2GearJoint* self) {
  return self->GetType();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJoint_GetBodyA_0(b2GearJoint* self) {
  return self->GetBodyA();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJoint_GetBodyB_0(b2GearJoint* self) {
  return self->GetBodyB();
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJoint_GetAnchorA_0(b2GearJoint* self) {
  static b2Vec2 temp;
  return (temp = self->GetAnchorA(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJoint_GetAnchorB_0(b2GearJoint* self) {
  static b2Vec2 temp;
  return (temp = self->GetAnchorB(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJoint_GetReactionForce_1(b2GearJoint* self, float inv_dt) {
  static b2Vec2 temp;
  return (temp = self->GetReactionForce(inv_dt), &temp);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJoint_GetReactionTorque_1(b2GearJoint* self, float inv_dt) {
  return self->GetReactionTorque(inv_dt);
}

b2Joint* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJoint_GetNext_0(b2GearJoint* self) {
  return self->GetNext();
}

b2JointUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJoint_GetUserData_0(b2GearJoint* self) {
  return &self->GetUserData();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJoint_GetCollideConnected_0(b2GearJoint* self) {
  return self->GetCollideConnected();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJoint___destroy___0(b2GearJoint* self) {
  delete self;
}

// b2GearJointDef

b2GearJointDef* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJointDef_b2GearJointDef_0() {
  return new b2GearJointDef();
}

b2Joint* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJointDef_get_joint1_0(b2GearJointDef* self) {
  return self->joint1;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJointDef_set_joint1_1(b2GearJointDef* self, b2Joint* arg0) {
  self->joint1 = arg0;
}

b2Joint* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJointDef_get_joint2_0(b2GearJointDef* self) {
  return self->joint2;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJointDef_set_joint2_1(b2GearJointDef* self, b2Joint* arg0) {
  self->joint2 = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJointDef_get_ratio_0(b2GearJointDef* self) {
  return self->ratio;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJointDef_set_ratio_1(b2GearJointDef* self, float arg0) {
  self->ratio = arg0;
}

b2JointType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJointDef_get_type_0(b2GearJointDef* self) {
  return self->type;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJointDef_set_type_1(b2GearJointDef* self, b2JointType arg0) {
  self->type = arg0;
}

b2JointUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJointDef_get_userData_0(b2GearJointDef* self) {
  return &self->userData;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJointDef_set_userData_1(b2GearJointDef* self, b2JointUserData* arg0) {
  self->userData = *arg0;
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJointDef_get_bodyA_0(b2GearJointDef* self) {
  return self->bodyA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJointDef_set_bodyA_1(b2GearJointDef* self, b2Body* arg0) {
  self->bodyA = arg0;
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJointDef_get_bodyB_0(b2GearJointDef* self) {
  return self->bodyB;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJointDef_set_bodyB_1(b2GearJointDef* self, b2Body* arg0) {
  self->bodyB = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJointDef_get_collideConnected_0(b2GearJointDef* self) {
  return self->collideConnected;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJointDef_set_collideConnected_1(b2GearJointDef* self, bool arg0) {
  self->collideConnected = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2GearJointDef___destroy___0(b2GearJointDef* self) {
  delete self;
}

// b2JointEdge

b2JointEdge* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointEdge_b2JointEdge_0() {
  return new b2JointEdge();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointEdge_get_other_0(b2JointEdge* self) {
  return self->other;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointEdge_set_other_1(b2JointEdge* self, b2Body* arg0) {
  self->other = arg0;
}

b2Joint* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointEdge_get_joint_0(b2JointEdge* self) {
  return self->joint;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointEdge_set_joint_1(b2JointEdge* self, b2Joint* arg0) {
  self->joint = arg0;
}

b2JointEdge* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointEdge_get_prev_0(b2JointEdge* self) {
  return self->prev;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointEdge_set_prev_1(b2JointEdge* self, b2JointEdge* arg0) {
  self->prev = arg0;
}

b2JointEdge* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointEdge_get_next_0(b2JointEdge* self) {
  return self->next;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointEdge_set_next_1(b2JointEdge* self, b2JointEdge* arg0) {
  self->next = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2JointEdge___destroy___0(b2JointEdge* self) {
  delete self;
}

// b2Manifold

b2Manifold* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Manifold_b2Manifold_0() {
  return new b2Manifold();
}

b2ManifoldPoint* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Manifold_get_points_1(b2Manifold* self, int arg0) {
  return (array_bounds_check(sizeof(self->points) / sizeof(self->points[0]), arg0), &self->points[arg0]);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Manifold_set_points_2(b2Manifold* self, int arg0, b2ManifoldPoint* arg1) {
  (array_bounds_check(sizeof(self->points) / sizeof(self->points[0]), arg0), self->points[arg0] = *arg1);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Manifold_get_localNormal_0(b2Manifold* self) {
  return &self->localNormal;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Manifold_set_localNormal_1(b2Manifold* self, b2Vec2* arg0) {
  self->localNormal = *arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Manifold_get_localPoint_0(b2Manifold* self) {
  return &self->localPoint;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Manifold_set_localPoint_1(b2Manifold* self, b2Vec2* arg0) {
  self->localPoint = *arg0;
}

b2ManifoldType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Manifold_get_type_0(b2Manifold* self) {
  return self->type;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Manifold_set_type_1(b2Manifold* self, b2ManifoldType arg0) {
  self->type = arg0;
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Manifold_get_pointCount_0(b2Manifold* self) {
  return self->pointCount;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Manifold_set_pointCount_1(b2Manifold* self, int arg0) {
  self->pointCount = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Manifold___destroy___0(b2Manifold* self) {
  delete self;
}

// b2WorldManifold

b2WorldManifold* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WorldManifold_b2WorldManifold_0() {
  return new b2WorldManifold();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WorldManifold_Initialize_5(b2WorldManifold* self, const b2Manifold* manifold, const b2Transform* xfA, float radiusA, const b2Transform* xfB, float radiusB) {
  self->Initialize(manifold, *xfA, radiusA, *xfB, radiusB);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WorldManifold_get_normal_0(b2WorldManifold* self) {
  return &self->normal;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WorldManifold_set_normal_1(b2WorldManifold* self, b2Vec2* arg0) {
  self->normal = *arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WorldManifold_get_points_1(b2WorldManifold* self, int arg0) {
  return (array_bounds_check(sizeof(self->points) / sizeof(self->points[0]), arg0), &self->points[arg0]);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WorldManifold_set_points_2(b2WorldManifold* self, int arg0, b2Vec2* arg1) {
  (array_bounds_check(sizeof(self->points) / sizeof(self->points[0]), arg0), self->points[arg0] = *arg1);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WorldManifold_get_separations_1(b2WorldManifold* self, int arg0) {
  return (array_bounds_check(sizeof(self->separations) / sizeof(self->separations[0]), arg0), self->separations[arg0]);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WorldManifold_set_separations_2(b2WorldManifold* self, int arg0, float arg1) {
  (array_bounds_check(sizeof(self->separations) / sizeof(self->separations[0]), arg0), self->separations[arg0] = arg1);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WorldManifold___destroy___0(b2WorldManifold* self) {
  delete self;
}

// b2ManifoldPoint

b2ManifoldPoint* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ManifoldPoint_b2ManifoldPoint_0() {
  return new b2ManifoldPoint();
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ManifoldPoint_get_localPoint_0(b2ManifoldPoint* self) {
  return &self->localPoint;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ManifoldPoint_set_localPoint_1(b2ManifoldPoint* self, b2Vec2* arg0) {
  self->localPoint = *arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ManifoldPoint_get_normalImpulse_0(b2ManifoldPoint* self) {
  return self->normalImpulse;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ManifoldPoint_set_normalImpulse_1(b2ManifoldPoint* self, float arg0) {
  self->normalImpulse = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ManifoldPoint_get_tangentImpulse_0(b2ManifoldPoint* self) {
  return self->tangentImpulse;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ManifoldPoint_set_tangentImpulse_1(b2ManifoldPoint* self, float arg0) {
  self->tangentImpulse = arg0;
}

b2ContactID* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ManifoldPoint_get_id_0(b2ManifoldPoint* self) {
  return &self->id;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ManifoldPoint_set_id_1(b2ManifoldPoint* self, b2ContactID* arg0) {
  self->id = *arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ManifoldPoint___destroy___0(b2ManifoldPoint* self) {
  delete self;
}

// b2Mat22

b2Mat22* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat22_b2Mat22_0() {
  return new b2Mat22();
}

b2Mat22* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat22_b2Mat22_2(b2Vec2* a11, b2Vec2* a12) {
  return new b2Mat22(*a11, *a12);
}

b2Mat22* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat22_b2Mat22_4(float a11, float a12, float a21, float a22) {
  return new b2Mat22(a11, a12, a21, a22);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat22_Set_2(b2Mat22* self, b2Vec2* c1, b2Vec2* c2) {
  self->Set(*c1, *c2);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat22_SetIdentity_0(b2Mat22* self) {
  self->SetIdentity();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat22_SetZero_0(b2Mat22* self) {
  self->SetZero();
}

b2Mat22* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat22_GetInverse_0(b2Mat22* self) {
  static b2Mat22 temp;
  return (temp = self->GetInverse(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat22_Solve_1(b2Mat22* self, b2Vec2* b) {
  static b2Vec2 temp;
  return (temp = self->Solve(*b), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat22_get_ex_0(b2Mat22* self) {
  return &self->ex;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat22_set_ex_1(b2Mat22* self, b2Vec2* arg0) {
  self->ex = *arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat22_get_ey_0(b2Mat22* self) {
  return &self->ey;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat22_set_ey_1(b2Mat22* self, b2Vec2* arg0) {
  self->ey = *arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat22___destroy___0(b2Mat22* self) {
  delete self;
}

// b2Mat33

b2Mat33* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat33_b2Mat33_0() {
  return new b2Mat33();
}

b2Mat33* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat33_b2Mat33_3(b2Vec3* c1, b2Vec3* c2, b2Vec3* c3) {
  return new b2Mat33(*c1, *c2, *c3);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat33_SetZero_0(b2Mat33* self) {
  self->SetZero();
}

b2Vec3* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat33_Solve33_1(b2Mat33* self, b2Vec3* b) {
  static b2Vec3 temp;
  return (temp = self->Solve33(*b), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat33_Solve22_1(b2Mat33* self, b2Vec2* b) {
  static b2Vec2 temp;
  return (temp = self->Solve22(*b), &temp);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat33_GetInverse22_1(b2Mat33* self, b2Mat33* M) {
  self->GetInverse22(M);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat33_GetSymInverse33_1(b2Mat33* self, b2Mat33* M) {
  self->GetSymInverse33(M);
}

b2Vec3* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat33_get_ex_0(b2Mat33* self) {
  return &self->ex;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat33_set_ex_1(b2Mat33* self, b2Vec3* arg0) {
  self->ex = *arg0;
}

b2Vec3* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat33_get_ey_0(b2Mat33* self) {
  return &self->ey;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat33_set_ey_1(b2Mat33* self, b2Vec3* arg0) {
  self->ey = *arg0;
}

b2Vec3* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat33_get_ez_0(b2Mat33* self) {
  return &self->ez;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat33_set_ez_1(b2Mat33* self, b2Vec3* arg0) {
  self->ez = *arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Mat33___destroy___0(b2Mat33* self) {
  delete self;
}

// b2MouseJoint

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJoint_SetTarget_1(b2MouseJoint* self, b2Vec2* target) {
  self->SetTarget(*target);
}

const b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJoint_GetTarget_0(b2MouseJoint* self) {
  return &self->GetTarget();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJoint_SetMaxForce_1(b2MouseJoint* self, float force) {
  self->SetMaxForce(force);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJoint_GetMaxForce_0(b2MouseJoint* self) {
  return self->GetMaxForce();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJoint_SetStiffness_1(b2MouseJoint* self, float stiffness) {
  self->SetStiffness(stiffness);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJoint_GetStiffness_0(b2MouseJoint* self) {
  return self->GetStiffness();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJoint_SetDamping_1(b2MouseJoint* self, float damping) {
  self->SetDamping(damping);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJoint_GetDamping_0(b2MouseJoint* self) {
  return self->GetDamping();
}

b2JointType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJoint_GetType_0(b2MouseJoint* self) {
  return self->GetType();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJoint_GetBodyA_0(b2MouseJoint* self) {
  return self->GetBodyA();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJoint_GetBodyB_0(b2MouseJoint* self) {
  return self->GetBodyB();
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJoint_GetAnchorA_0(b2MouseJoint* self) {
  static b2Vec2 temp;
  return (temp = self->GetAnchorA(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJoint_GetAnchorB_0(b2MouseJoint* self) {
  static b2Vec2 temp;
  return (temp = self->GetAnchorB(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJoint_GetReactionForce_1(b2MouseJoint* self, float inv_dt) {
  static b2Vec2 temp;
  return (temp = self->GetReactionForce(inv_dt), &temp);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJoint_GetReactionTorque_1(b2MouseJoint* self, float inv_dt) {
  return self->GetReactionTorque(inv_dt);
}

b2Joint* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJoint_GetNext_0(b2MouseJoint* self) {
  return self->GetNext();
}

b2JointUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJoint_GetUserData_0(b2MouseJoint* self) {
  return &self->GetUserData();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJoint_GetCollideConnected_0(b2MouseJoint* self) {
  return self->GetCollideConnected();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJoint___destroy___0(b2MouseJoint* self) {
  delete self;
}

// b2MouseJointDef

b2MouseJointDef* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJointDef_b2MouseJointDef_0() {
  return new b2MouseJointDef();
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJointDef_get_target_0(b2MouseJointDef* self) {
  return &self->target;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJointDef_set_target_1(b2MouseJointDef* self, b2Vec2* arg0) {
  self->target = *arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJointDef_get_maxForce_0(b2MouseJointDef* self) {
  return self->maxForce;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJointDef_set_maxForce_1(b2MouseJointDef* self, float arg0) {
  self->maxForce = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJointDef_get_stiffness_0(b2MouseJointDef* self) {
  return self->stiffness;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJointDef_set_stiffness_1(b2MouseJointDef* self, float arg0) {
  self->stiffness = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJointDef_get_damping_0(b2MouseJointDef* self) {
  return self->damping;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJointDef_set_damping_1(b2MouseJointDef* self, float arg0) {
  self->damping = arg0;
}

b2JointType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJointDef_get_type_0(b2MouseJointDef* self) {
  return self->type;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJointDef_set_type_1(b2MouseJointDef* self, b2JointType arg0) {
  self->type = arg0;
}

b2JointUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJointDef_get_userData_0(b2MouseJointDef* self) {
  return &self->userData;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJointDef_set_userData_1(b2MouseJointDef* self, b2JointUserData* arg0) {
  self->userData = *arg0;
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJointDef_get_bodyA_0(b2MouseJointDef* self) {
  return self->bodyA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJointDef_set_bodyA_1(b2MouseJointDef* self, b2Body* arg0) {
  self->bodyA = arg0;
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJointDef_get_bodyB_0(b2MouseJointDef* self) {
  return self->bodyB;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJointDef_set_bodyB_1(b2MouseJointDef* self, b2Body* arg0) {
  self->bodyB = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJointDef_get_collideConnected_0(b2MouseJointDef* self) {
  return self->collideConnected;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJointDef_set_collideConnected_1(b2MouseJointDef* self, bool arg0) {
  self->collideConnected = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MouseJointDef___destroy___0(b2MouseJointDef* self) {
  delete self;
}

// b2PolygonShape

b2PolygonShape* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PolygonShape_b2PolygonShape_0() {
  return new b2PolygonShape();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PolygonShape_Set_2(b2PolygonShape* self, b2Vec2* vertices, int vertexCount) {
  self->Set(vertices, vertexCount);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PolygonShape_SetAsBox_2(b2PolygonShape* self, float hx, float hy) {
  self->SetAsBox(hx, hy);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PolygonShape_SetAsBox_4(b2PolygonShape* self, float hx, float hy, b2Vec2* center, float angle) {
  self->SetAsBox(hx, hy, *center, angle);
}

b2ShapeType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PolygonShape_GetType_0(b2PolygonShape* self) {
  return self->GetType();
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PolygonShape_GetChildCount_0(b2PolygonShape* self) {
  return self->GetChildCount();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PolygonShape_TestPoint_2(b2PolygonShape* self, b2Transform* xf, b2Vec2* p) {
  return self->TestPoint(*xf, *p);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PolygonShape_RayCast_4(b2PolygonShape* self, b2RayCastOutput* output, b2RayCastInput* input, b2Transform* transform, int childIndex) {
  return self->RayCast(output, *input, *transform, childIndex);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PolygonShape_ComputeAABB_3(b2PolygonShape* self, b2AABB* aabb, b2Transform* xf, int childIndex) {
  self->ComputeAABB(aabb, *xf, childIndex);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PolygonShape_ComputeMass_2(b2PolygonShape* self, b2MassData* massData, float density) {
  self->ComputeMass(massData, density);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PolygonShape_get_m_centroid_0(b2PolygonShape* self) {
  return &self->m_centroid;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PolygonShape_set_m_centroid_1(b2PolygonShape* self, b2Vec2* arg0) {
  self->m_centroid = *arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PolygonShape_get_m_vertices_1(b2PolygonShape* self, int arg0) {
  return (array_bounds_check(sizeof(self->m_vertices) / sizeof(self->m_vertices[0]), arg0), &self->m_vertices[arg0]);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PolygonShape_set_m_vertices_2(b2PolygonShape* self, int arg0, b2Vec2* arg1) {
  (array_bounds_check(sizeof(self->m_vertices) / sizeof(self->m_vertices[0]), arg0), self->m_vertices[arg0] = *arg1);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PolygonShape_get_m_normals_1(b2PolygonShape* self, int arg0) {
  return (array_bounds_check(sizeof(self->m_normals) / sizeof(self->m_normals[0]), arg0), &self->m_normals[arg0]);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PolygonShape_set_m_normals_2(b2PolygonShape* self, int arg0, b2Vec2* arg1) {
  (array_bounds_check(sizeof(self->m_normals) / sizeof(self->m_normals[0]), arg0), self->m_normals[arg0] = *arg1);
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PolygonShape_get_m_count_0(b2PolygonShape* self) {
  return self->m_count;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PolygonShape_set_m_count_1(b2PolygonShape* self, int arg0) {
  self->m_count = arg0;
}

b2ShapeType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PolygonShape_get_m_type_0(b2PolygonShape* self) {
  return self->m_type;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PolygonShape_set_m_type_1(b2PolygonShape* self, b2ShapeType arg0) {
  self->m_type = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PolygonShape_get_m_radius_0(b2PolygonShape* self) {
  return self->m_radius;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PolygonShape_set_m_radius_1(b2PolygonShape* self, float arg0) {
  self->m_radius = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PolygonShape___destroy___0(b2PolygonShape* self) {
  delete self;
}

// b2PrismaticJoint

const b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_GetLocalAnchorA_0(b2PrismaticJoint* self) {
  return &self->GetLocalAnchorA();
}

const b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_GetLocalAnchorB_0(b2PrismaticJoint* self) {
  return &self->GetLocalAnchorB();
}

const b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_GetLocalAxisA_0(b2PrismaticJoint* self) {
  return &self->GetLocalAxisA();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_GetReferenceAngle_0(b2PrismaticJoint* self) {
  return self->GetReferenceAngle();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_GetJointTranslation_0(b2PrismaticJoint* self) {
  return self->GetJointTranslation();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_GetJointSpeed_0(b2PrismaticJoint* self) {
  return self->GetJointSpeed();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_IsLimitEnabled_0(b2PrismaticJoint* self) {
  return self->IsLimitEnabled();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_EnableLimit_1(b2PrismaticJoint* self, bool flag) {
  self->EnableLimit(flag);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_GetLowerLimit_0(b2PrismaticJoint* self) {
  return self->GetLowerLimit();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_GetUpperLimit_0(b2PrismaticJoint* self) {
  return self->GetUpperLimit();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_SetLimits_2(b2PrismaticJoint* self, float lower, float upper) {
  self->SetLimits(lower, upper);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_IsMotorEnabled_0(b2PrismaticJoint* self) {
  return self->IsMotorEnabled();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_EnableMotor_1(b2PrismaticJoint* self, bool flag) {
  self->EnableMotor(flag);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_SetMotorSpeed_1(b2PrismaticJoint* self, float speed) {
  self->SetMotorSpeed(speed);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_GetMotorSpeed_0(b2PrismaticJoint* self) {
  return self->GetMotorSpeed();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_SetMaxMotorForce_1(b2PrismaticJoint* self, float force) {
  self->SetMaxMotorForce(force);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_GetMaxMotorForce_0(b2PrismaticJoint* self) {
  return self->GetMaxMotorForce();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_GetMotorForce_1(b2PrismaticJoint* self, float inv_dt) {
  return self->GetMotorForce(inv_dt);
}

b2JointType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_GetType_0(b2PrismaticJoint* self) {
  return self->GetType();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_GetBodyA_0(b2PrismaticJoint* self) {
  return self->GetBodyA();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_GetBodyB_0(b2PrismaticJoint* self) {
  return self->GetBodyB();
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_GetAnchorA_0(b2PrismaticJoint* self) {
  static b2Vec2 temp;
  return (temp = self->GetAnchorA(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_GetAnchorB_0(b2PrismaticJoint* self) {
  static b2Vec2 temp;
  return (temp = self->GetAnchorB(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_GetReactionForce_1(b2PrismaticJoint* self, float inv_dt) {
  static b2Vec2 temp;
  return (temp = self->GetReactionForce(inv_dt), &temp);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_GetReactionTorque_1(b2PrismaticJoint* self, float inv_dt) {
  return self->GetReactionTorque(inv_dt);
}

b2Joint* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_GetNext_0(b2PrismaticJoint* self) {
  return self->GetNext();
}

b2JointUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_GetUserData_0(b2PrismaticJoint* self) {
  return &self->GetUserData();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint_GetCollideConnected_0(b2PrismaticJoint* self) {
  return self->GetCollideConnected();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJoint___destroy___0(b2PrismaticJoint* self) {
  delete self;
}

// b2PrismaticJointDef

b2PrismaticJointDef* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_b2PrismaticJointDef_0() {
  return new b2PrismaticJointDef();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_Initialize_4(b2PrismaticJointDef* self, b2Body* bodyA, b2Body* bodyB, b2Vec2* anchor, b2Vec2* axis) {
  self->Initialize(bodyA, bodyB, *anchor, *axis);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_get_localAnchorA_0(b2PrismaticJointDef* self) {
  return &self->localAnchorA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_set_localAnchorA_1(b2PrismaticJointDef* self, b2Vec2* arg0) {
  self->localAnchorA = *arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_get_localAnchorB_0(b2PrismaticJointDef* self) {
  return &self->localAnchorB;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_set_localAnchorB_1(b2PrismaticJointDef* self, b2Vec2* arg0) {
  self->localAnchorB = *arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_get_localAxisA_0(b2PrismaticJointDef* self) {
  return &self->localAxisA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_set_localAxisA_1(b2PrismaticJointDef* self, b2Vec2* arg0) {
  self->localAxisA = *arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_get_referenceAngle_0(b2PrismaticJointDef* self) {
  return self->referenceAngle;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_set_referenceAngle_1(b2PrismaticJointDef* self, float arg0) {
  self->referenceAngle = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_get_enableLimit_0(b2PrismaticJointDef* self) {
  return self->enableLimit;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_set_enableLimit_1(b2PrismaticJointDef* self, bool arg0) {
  self->enableLimit = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_get_lowerTranslation_0(b2PrismaticJointDef* self) {
  return self->lowerTranslation;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_set_lowerTranslation_1(b2PrismaticJointDef* self, float arg0) {
  self->lowerTranslation = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_get_upperTranslation_0(b2PrismaticJointDef* self) {
  return self->upperTranslation;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_set_upperTranslation_1(b2PrismaticJointDef* self, float arg0) {
  self->upperTranslation = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_get_enableMotor_0(b2PrismaticJointDef* self) {
  return self->enableMotor;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_set_enableMotor_1(b2PrismaticJointDef* self, bool arg0) {
  self->enableMotor = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_get_maxMotorForce_0(b2PrismaticJointDef* self) {
  return self->maxMotorForce;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_set_maxMotorForce_1(b2PrismaticJointDef* self, float arg0) {
  self->maxMotorForce = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_get_motorSpeed_0(b2PrismaticJointDef* self) {
  return self->motorSpeed;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_set_motorSpeed_1(b2PrismaticJointDef* self, float arg0) {
  self->motorSpeed = arg0;
}

b2JointType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_get_type_0(b2PrismaticJointDef* self) {
  return self->type;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_set_type_1(b2PrismaticJointDef* self, b2JointType arg0) {
  self->type = arg0;
}

b2JointUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_get_userData_0(b2PrismaticJointDef* self) {
  return &self->userData;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_set_userData_1(b2PrismaticJointDef* self, b2JointUserData* arg0) {
  self->userData = *arg0;
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_get_bodyA_0(b2PrismaticJointDef* self) {
  return self->bodyA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_set_bodyA_1(b2PrismaticJointDef* self, b2Body* arg0) {
  self->bodyA = arg0;
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_get_bodyB_0(b2PrismaticJointDef* self) {
  return self->bodyB;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_set_bodyB_1(b2PrismaticJointDef* self, b2Body* arg0) {
  self->bodyB = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_get_collideConnected_0(b2PrismaticJointDef* self) {
  return self->collideConnected;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef_set_collideConnected_1(b2PrismaticJointDef* self, bool arg0) {
  self->collideConnected = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PrismaticJointDef___destroy___0(b2PrismaticJointDef* self) {
  delete self;
}

// b2Profile

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Profile_get_step_0(b2Profile* self) {
  return self->step;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Profile_set_step_1(b2Profile* self, float arg0) {
  self->step = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Profile_get_collide_0(b2Profile* self) {
  return self->collide;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Profile_set_collide_1(b2Profile* self, float arg0) {
  self->collide = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Profile_get_solve_0(b2Profile* self) {
  return self->solve;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Profile_set_solve_1(b2Profile* self, float arg0) {
  self->solve = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Profile_get_solveInit_0(b2Profile* self) {
  return self->solveInit;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Profile_set_solveInit_1(b2Profile* self, float arg0) {
  self->solveInit = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Profile_get_solveVelocity_0(b2Profile* self) {
  return self->solveVelocity;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Profile_set_solveVelocity_1(b2Profile* self, float arg0) {
  self->solveVelocity = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Profile_get_solvePosition_0(b2Profile* self) {
  return self->solvePosition;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Profile_set_solvePosition_1(b2Profile* self, float arg0) {
  self->solvePosition = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Profile_get_broadphase_0(b2Profile* self) {
  return self->broadphase;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Profile_set_broadphase_1(b2Profile* self, float arg0) {
  self->broadphase = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Profile_get_solveTOI_0(b2Profile* self) {
  return self->solveTOI;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Profile_set_solveTOI_1(b2Profile* self, float arg0) {
  self->solveTOI = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Profile___destroy___0(b2Profile* self) {
  delete self;
}

// b2PulleyJoint

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJoint_GetGroundAnchorA_0(b2PulleyJoint* self) {
  static b2Vec2 temp;
  return (temp = self->GetGroundAnchorA(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJoint_GetGroundAnchorB_0(b2PulleyJoint* self) {
  static b2Vec2 temp;
  return (temp = self->GetGroundAnchorB(), &temp);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJoint_GetLengthA_0(b2PulleyJoint* self) {
  return self->GetLengthA();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJoint_GetLengthB_0(b2PulleyJoint* self) {
  return self->GetLengthB();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJoint_GetRatio_0(b2PulleyJoint* self) {
  return self->GetRatio();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJoint_GetCurrentLengthA_0(b2PulleyJoint* self) {
  return self->GetCurrentLengthA();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJoint_GetCurrentLengthB_0(b2PulleyJoint* self) {
  return self->GetCurrentLengthB();
}

b2JointType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJoint_GetType_0(b2PulleyJoint* self) {
  return self->GetType();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJoint_GetBodyA_0(b2PulleyJoint* self) {
  return self->GetBodyA();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJoint_GetBodyB_0(b2PulleyJoint* self) {
  return self->GetBodyB();
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJoint_GetAnchorA_0(b2PulleyJoint* self) {
  static b2Vec2 temp;
  return (temp = self->GetAnchorA(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJoint_GetAnchorB_0(b2PulleyJoint* self) {
  static b2Vec2 temp;
  return (temp = self->GetAnchorB(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJoint_GetReactionForce_1(b2PulleyJoint* self, float inv_dt) {
  static b2Vec2 temp;
  return (temp = self->GetReactionForce(inv_dt), &temp);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJoint_GetReactionTorque_1(b2PulleyJoint* self, float inv_dt) {
  return self->GetReactionTorque(inv_dt);
}

b2Joint* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJoint_GetNext_0(b2PulleyJoint* self) {
  return self->GetNext();
}

b2JointUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJoint_GetUserData_0(b2PulleyJoint* self) {
  return &self->GetUserData();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJoint_GetCollideConnected_0(b2PulleyJoint* self) {
  return self->GetCollideConnected();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJoint___destroy___0(b2PulleyJoint* self) {
  delete self;
}

// b2PulleyJointDef

b2PulleyJointDef* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_b2PulleyJointDef_0() {
  return new b2PulleyJointDef();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_Initialize_7(b2PulleyJointDef* self, b2Body* bodyA, b2Body* bodyB, b2Vec2* groundAnchorA, b2Vec2* groundAnchorB, b2Vec2* anchorA, b2Vec2* anchorB, float ratio) {
  self->Initialize(bodyA, bodyB, *groundAnchorA, *groundAnchorB, *anchorA, *anchorB, ratio);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_get_groundAnchorA_0(b2PulleyJointDef* self) {
  return &self->groundAnchorA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_set_groundAnchorA_1(b2PulleyJointDef* self, b2Vec2* arg0) {
  self->groundAnchorA = *arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_get_groundAnchorB_0(b2PulleyJointDef* self) {
  return &self->groundAnchorB;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_set_groundAnchorB_1(b2PulleyJointDef* self, b2Vec2* arg0) {
  self->groundAnchorB = *arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_get_localAnchorA_0(b2PulleyJointDef* self) {
  return &self->localAnchorA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_set_localAnchorA_1(b2PulleyJointDef* self, b2Vec2* arg0) {
  self->localAnchorA = *arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_get_localAnchorB_0(b2PulleyJointDef* self) {
  return &self->localAnchorB;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_set_localAnchorB_1(b2PulleyJointDef* self, b2Vec2* arg0) {
  self->localAnchorB = *arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_get_lengthA_0(b2PulleyJointDef* self) {
  return self->lengthA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_set_lengthA_1(b2PulleyJointDef* self, float arg0) {
  self->lengthA = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_get_lengthB_0(b2PulleyJointDef* self) {
  return self->lengthB;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_set_lengthB_1(b2PulleyJointDef* self, float arg0) {
  self->lengthB = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_get_ratio_0(b2PulleyJointDef* self) {
  return self->ratio;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_set_ratio_1(b2PulleyJointDef* self, float arg0) {
  self->ratio = arg0;
}

b2JointType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_get_type_0(b2PulleyJointDef* self) {
  return self->type;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_set_type_1(b2PulleyJointDef* self, b2JointType arg0) {
  self->type = arg0;
}

b2JointUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_get_userData_0(b2PulleyJointDef* self) {
  return &self->userData;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_set_userData_1(b2PulleyJointDef* self, b2JointUserData* arg0) {
  self->userData = *arg0;
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_get_bodyA_0(b2PulleyJointDef* self) {
  return self->bodyA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_set_bodyA_1(b2PulleyJointDef* self, b2Body* arg0) {
  self->bodyA = arg0;
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_get_bodyB_0(b2PulleyJointDef* self) {
  return self->bodyB;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_set_bodyB_1(b2PulleyJointDef* self, b2Body* arg0) {
  self->bodyB = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_get_collideConnected_0(b2PulleyJointDef* self) {
  return self->collideConnected;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef_set_collideConnected_1(b2PulleyJointDef* self, bool arg0) {
  self->collideConnected = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2PulleyJointDef___destroy___0(b2PulleyJointDef* self) {
  delete self;
}

// b2RayCastInput

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RayCastInput_get_p1_0(b2RayCastInput* self) {
  return &self->p1;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RayCastInput_set_p1_1(b2RayCastInput* self, b2Vec2* arg0) {
  self->p1 = *arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RayCastInput_get_p2_0(b2RayCastInput* self) {
  return &self->p2;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RayCastInput_set_p2_1(b2RayCastInput* self, b2Vec2* arg0) {
  self->p2 = *arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RayCastInput_get_maxFraction_0(b2RayCastInput* self) {
  return self->maxFraction;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RayCastInput_set_maxFraction_1(b2RayCastInput* self, float arg0) {
  self->maxFraction = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RayCastInput___destroy___0(b2RayCastInput* self) {
  delete self;
}

// b2RayCastOutput

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RayCastOutput_get_normal_0(b2RayCastOutput* self) {
  return &self->normal;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RayCastOutput_set_normal_1(b2RayCastOutput* self, b2Vec2* arg0) {
  self->normal = *arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RayCastOutput_get_fraction_0(b2RayCastOutput* self) {
  return self->fraction;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RayCastOutput_set_fraction_1(b2RayCastOutput* self, float arg0) {
  self->fraction = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RayCastOutput___destroy___0(b2RayCastOutput* self) {
  delete self;
}

// b2RevoluteJoint

const b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_GetLocalAnchorA_0(b2RevoluteJoint* self) {
  return &self->GetLocalAnchorA();
}

const b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_GetLocalAnchorB_0(b2RevoluteJoint* self) {
  return &self->GetLocalAnchorB();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_GetReferenceAngle_0(b2RevoluteJoint* self) {
  return self->GetReferenceAngle();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_GetJointAngle_0(b2RevoluteJoint* self) {
  return self->GetJointAngle();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_GetJointSpeed_0(b2RevoluteJoint* self) {
  return self->GetJointSpeed();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_IsLimitEnabled_0(b2RevoluteJoint* self) {
  return self->IsLimitEnabled();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_EnableLimit_1(b2RevoluteJoint* self, bool flag) {
  self->EnableLimit(flag);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_GetLowerLimit_0(b2RevoluteJoint* self) {
  return self->GetLowerLimit();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_GetUpperLimit_0(b2RevoluteJoint* self) {
  return self->GetUpperLimit();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_SetLimits_2(b2RevoluteJoint* self, float lower, float upper) {
  self->SetLimits(lower, upper);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_IsMotorEnabled_0(b2RevoluteJoint* self) {
  return self->IsMotorEnabled();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_EnableMotor_1(b2RevoluteJoint* self, bool flag) {
  self->EnableMotor(flag);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_SetMotorSpeed_1(b2RevoluteJoint* self, float speed) {
  self->SetMotorSpeed(speed);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_GetMotorSpeed_0(b2RevoluteJoint* self) {
  return self->GetMotorSpeed();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_SetMaxMotorTorque_1(b2RevoluteJoint* self, float torque) {
  self->SetMaxMotorTorque(torque);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_GetMaxMotorTorque_0(b2RevoluteJoint* self) {
  return self->GetMaxMotorTorque();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_GetMotorTorque_1(b2RevoluteJoint* self, float inv_dt) {
  return self->GetMotorTorque(inv_dt);
}

b2JointType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_GetType_0(b2RevoluteJoint* self) {
  return self->GetType();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_GetBodyA_0(b2RevoluteJoint* self) {
  return self->GetBodyA();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_GetBodyB_0(b2RevoluteJoint* self) {
  return self->GetBodyB();
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_GetAnchorA_0(b2RevoluteJoint* self) {
  static b2Vec2 temp;
  return (temp = self->GetAnchorA(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_GetAnchorB_0(b2RevoluteJoint* self) {
  static b2Vec2 temp;
  return (temp = self->GetAnchorB(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_GetReactionForce_1(b2RevoluteJoint* self, float inv_dt) {
  static b2Vec2 temp;
  return (temp = self->GetReactionForce(inv_dt), &temp);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_GetReactionTorque_1(b2RevoluteJoint* self, float inv_dt) {
  return self->GetReactionTorque(inv_dt);
}

b2Joint* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_GetNext_0(b2RevoluteJoint* self) {
  return self->GetNext();
}

b2JointUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_GetUserData_0(b2RevoluteJoint* self) {
  return &self->GetUserData();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint_GetCollideConnected_0(b2RevoluteJoint* self) {
  return self->GetCollideConnected();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJoint___destroy___0(b2RevoluteJoint* self) {
  delete self;
}

// b2RevoluteJointDef

b2RevoluteJointDef* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_b2RevoluteJointDef_0() {
  return new b2RevoluteJointDef();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_Initialize_3(b2RevoluteJointDef* self, b2Body* bodyA, b2Body* bodyB, b2Vec2* anchor) {
  self->Initialize(bodyA, bodyB, *anchor);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_get_localAnchorA_0(b2RevoluteJointDef* self) {
  return &self->localAnchorA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_set_localAnchorA_1(b2RevoluteJointDef* self, b2Vec2* arg0) {
  self->localAnchorA = *arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_get_localAnchorB_0(b2RevoluteJointDef* self) {
  return &self->localAnchorB;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_set_localAnchorB_1(b2RevoluteJointDef* self, b2Vec2* arg0) {
  self->localAnchorB = *arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_get_referenceAngle_0(b2RevoluteJointDef* self) {
  return self->referenceAngle;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_set_referenceAngle_1(b2RevoluteJointDef* self, float arg0) {
  self->referenceAngle = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_get_enableLimit_0(b2RevoluteJointDef* self) {
  return self->enableLimit;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_set_enableLimit_1(b2RevoluteJointDef* self, bool arg0) {
  self->enableLimit = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_get_lowerAngle_0(b2RevoluteJointDef* self) {
  return self->lowerAngle;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_set_lowerAngle_1(b2RevoluteJointDef* self, float arg0) {
  self->lowerAngle = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_get_upperAngle_0(b2RevoluteJointDef* self) {
  return self->upperAngle;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_set_upperAngle_1(b2RevoluteJointDef* self, float arg0) {
  self->upperAngle = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_get_enableMotor_0(b2RevoluteJointDef* self) {
  return self->enableMotor;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_set_enableMotor_1(b2RevoluteJointDef* self, bool arg0) {
  self->enableMotor = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_get_motorSpeed_0(b2RevoluteJointDef* self) {
  return self->motorSpeed;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_set_motorSpeed_1(b2RevoluteJointDef* self, float arg0) {
  self->motorSpeed = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_get_maxMotorTorque_0(b2RevoluteJointDef* self) {
  return self->maxMotorTorque;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_set_maxMotorTorque_1(b2RevoluteJointDef* self, float arg0) {
  self->maxMotorTorque = arg0;
}

b2JointType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_get_type_0(b2RevoluteJointDef* self) {
  return self->type;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_set_type_1(b2RevoluteJointDef* self, b2JointType arg0) {
  self->type = arg0;
}

b2JointUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_get_userData_0(b2RevoluteJointDef* self) {
  return &self->userData;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_set_userData_1(b2RevoluteJointDef* self, b2JointUserData* arg0) {
  self->userData = *arg0;
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_get_bodyA_0(b2RevoluteJointDef* self) {
  return self->bodyA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_set_bodyA_1(b2RevoluteJointDef* self, b2Body* arg0) {
  self->bodyA = arg0;
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_get_bodyB_0(b2RevoluteJointDef* self) {
  return self->bodyB;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_set_bodyB_1(b2RevoluteJointDef* self, b2Body* arg0) {
  self->bodyB = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_get_collideConnected_0(b2RevoluteJointDef* self) {
  return self->collideConnected;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef_set_collideConnected_1(b2RevoluteJointDef* self, bool arg0) {
  self->collideConnected = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RevoluteJointDef___destroy___0(b2RevoluteJointDef* self) {
  delete self;
}

// b2Rot

b2Rot* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Rot_b2Rot_0() {
  return new b2Rot();
}

b2Rot* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Rot_b2Rot_1(float angle) {
  return new b2Rot(angle);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Rot_Set_1(b2Rot* self, float angle) {
  self->Set(angle);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Rot_SetIdentity_0(b2Rot* self) {
  self->SetIdentity();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Rot_GetAngle_0(b2Rot* self) {
  return self->GetAngle();
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Rot_GetXAxis_0(b2Rot* self) {
  static b2Vec2 temp;
  return (temp = self->GetXAxis(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Rot_GetYAxis_0(b2Rot* self) {
  static b2Vec2 temp;
  return (temp = self->GetYAxis(), &temp);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Rot_get_s_0(b2Rot* self) {
  return self->s;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Rot_set_s_1(b2Rot* self, float arg0) {
  self->s = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Rot_get_c_0(b2Rot* self) {
  return self->c;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Rot_set_c_1(b2Rot* self, float arg0) {
  self->c = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Rot___destroy___0(b2Rot* self) {
  delete self;
}

// b2WheelJoint

const b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetLocalAnchorA_0(b2WheelJoint* self) {
  return &self->GetLocalAnchorA();
}

const b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetLocalAnchorB_0(b2WheelJoint* self) {
  return &self->GetLocalAnchorB();
}

const b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetLocalAxisA_0(b2WheelJoint* self) {
  return &self->GetLocalAxisA();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetJointTranslation_0(b2WheelJoint* self) {
  return self->GetJointTranslation();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetJointLinearSpeed_0(b2WheelJoint* self) {
  return self->GetJointLinearSpeed();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetJointAngle_0(b2WheelJoint* self) {
  return self->GetJointAngle();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetJointAngularSpeed_0(b2WheelJoint* self) {
  return self->GetJointAngularSpeed();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_IsLimitEnabled_0(b2WheelJoint* self) {
  return self->IsLimitEnabled();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_EnableLimit_1(b2WheelJoint* self, bool flag) {
  self->EnableLimit(flag);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetLowerLimit_0(b2WheelJoint* self) {
  return self->GetLowerLimit();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetUpperLimit_0(b2WheelJoint* self) {
  return self->GetUpperLimit();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_SetLimits_2(b2WheelJoint* self, float lower, float upper) {
  self->SetLimits(lower, upper);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_IsMotorEnabled_0(b2WheelJoint* self) {
  return self->IsMotorEnabled();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_EnableMotor_1(b2WheelJoint* self, bool flag) {
  self->EnableMotor(flag);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_SetMotorSpeed_1(b2WheelJoint* self, float speed) {
  self->SetMotorSpeed(speed);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetMotorSpeed_0(b2WheelJoint* self) {
  return self->GetMotorSpeed();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_SetMaxMotorTorque_1(b2WheelJoint* self, float torque) {
  self->SetMaxMotorTorque(torque);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetMaxMotorTorque_0(b2WheelJoint* self) {
  return self->GetMaxMotorTorque();
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetMotorTorque_1(b2WheelJoint* self, float inv_dt) {
  return self->GetMotorTorque(inv_dt);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_SetStiffness_1(b2WheelJoint* self, float stiffness) {
  self->SetStiffness(stiffness);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetStiffness_0(b2WheelJoint* self) {
  return self->GetStiffness();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_SetDamping_1(b2WheelJoint* self, float damping) {
  self->SetDamping(damping);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetDamping_0(b2WheelJoint* self) {
  return self->GetDamping();
}

b2JointType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetType_0(b2WheelJoint* self) {
  return self->GetType();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetBodyA_0(b2WheelJoint* self) {
  return self->GetBodyA();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetBodyB_0(b2WheelJoint* self) {
  return self->GetBodyB();
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetAnchorA_0(b2WheelJoint* self) {
  static b2Vec2 temp;
  return (temp = self->GetAnchorA(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetAnchorB_0(b2WheelJoint* self) {
  static b2Vec2 temp;
  return (temp = self->GetAnchorB(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetReactionForce_1(b2WheelJoint* self, float inv_dt) {
  static b2Vec2 temp;
  return (temp = self->GetReactionForce(inv_dt), &temp);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetReactionTorque_1(b2WheelJoint* self, float inv_dt) {
  return self->GetReactionTorque(inv_dt);
}

b2Joint* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetNext_0(b2WheelJoint* self) {
  return self->GetNext();
}

b2JointUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetUserData_0(b2WheelJoint* self) {
  return &self->GetUserData();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint_GetCollideConnected_0(b2WheelJoint* self) {
  return self->GetCollideConnected();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJoint___destroy___0(b2WheelJoint* self) {
  delete self;
}

// b2WheelJointDef

b2WheelJointDef* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_b2WheelJointDef_0() {
  return new b2WheelJointDef();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_Initialize_4(b2WheelJointDef* self, b2Body* bodyA, b2Body* bodyB, const b2Vec2* anchor, const b2Vec2* axis) {
  self->Initialize(bodyA, bodyB, *anchor, *axis);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_get_localAnchorA_0(b2WheelJointDef* self) {
  return &self->localAnchorA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_set_localAnchorA_1(b2WheelJointDef* self, b2Vec2* arg0) {
  self->localAnchorA = *arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_get_localAnchorB_0(b2WheelJointDef* self) {
  return &self->localAnchorB;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_set_localAnchorB_1(b2WheelJointDef* self, b2Vec2* arg0) {
  self->localAnchorB = *arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_get_localAxisA_0(b2WheelJointDef* self) {
  return &self->localAxisA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_set_localAxisA_1(b2WheelJointDef* self, b2Vec2* arg0) {
  self->localAxisA = *arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_get_enableLimit_0(b2WheelJointDef* self) {
  return self->enableLimit;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_set_enableLimit_1(b2WheelJointDef* self, bool arg0) {
  self->enableLimit = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_get_lowerTranslation_0(b2WheelJointDef* self) {
  return self->lowerTranslation;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_set_lowerTranslation_1(b2WheelJointDef* self, float arg0) {
  self->lowerTranslation = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_get_upperTranslation_0(b2WheelJointDef* self) {
  return self->upperTranslation;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_set_upperTranslation_1(b2WheelJointDef* self, float arg0) {
  self->upperTranslation = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_get_enableMotor_0(b2WheelJointDef* self) {
  return self->enableMotor;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_set_enableMotor_1(b2WheelJointDef* self, bool arg0) {
  self->enableMotor = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_get_maxMotorTorque_0(b2WheelJointDef* self) {
  return self->maxMotorTorque;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_set_maxMotorTorque_1(b2WheelJointDef* self, float arg0) {
  self->maxMotorTorque = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_get_motorSpeed_0(b2WheelJointDef* self) {
  return self->motorSpeed;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_set_motorSpeed_1(b2WheelJointDef* self, float arg0) {
  self->motorSpeed = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_get_stiffness_0(b2WheelJointDef* self) {
  return self->stiffness;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_set_stiffness_1(b2WheelJointDef* self, float arg0) {
  self->stiffness = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_get_damping_0(b2WheelJointDef* self) {
  return self->damping;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_set_damping_1(b2WheelJointDef* self, float arg0) {
  self->damping = arg0;
}

b2JointType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_get_type_0(b2WheelJointDef* self) {
  return self->type;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_set_type_1(b2WheelJointDef* self, b2JointType arg0) {
  self->type = arg0;
}

b2JointUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_get_userData_0(b2WheelJointDef* self) {
  return &self->userData;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_set_userData_1(b2WheelJointDef* self, b2JointUserData* arg0) {
  self->userData = *arg0;
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_get_bodyA_0(b2WheelJointDef* self) {
  return self->bodyA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_set_bodyA_1(b2WheelJointDef* self, b2Body* arg0) {
  self->bodyA = arg0;
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_get_bodyB_0(b2WheelJointDef* self) {
  return self->bodyB;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_set_bodyB_1(b2WheelJointDef* self, b2Body* arg0) {
  self->bodyB = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_get_collideConnected_0(b2WheelJointDef* self) {
  return self->collideConnected;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef_set_collideConnected_1(b2WheelJointDef* self, bool arg0) {
  self->collideConnected = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2WheelJointDef___destroy___0(b2WheelJointDef* self) {
  delete self;
}

// b2MotorJoint

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJoint_SetLinearOffset_1(b2MotorJoint* self, b2Vec2* linearOffset) {
  self->SetLinearOffset(*linearOffset);
}

const b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJoint_GetLinearOffset_0(b2MotorJoint* self) {
  return &self->GetLinearOffset();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJoint_SetAngularOffset_1(b2MotorJoint* self, float angularOffset) {
  self->SetAngularOffset(angularOffset);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJoint_GetAngularOffset_0(b2MotorJoint* self) {
  return self->GetAngularOffset();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJoint_SetMaxForce_1(b2MotorJoint* self, float force) {
  self->SetMaxForce(force);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJoint_GetMaxForce_0(b2MotorJoint* self) {
  return self->GetMaxForce();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJoint_SetMaxTorque_1(b2MotorJoint* self, float torque) {
  self->SetMaxTorque(torque);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJoint_GetMaxTorque_0(b2MotorJoint* self) {
  return self->GetMaxTorque();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJoint_SetCorrectionFactor_1(b2MotorJoint* self, float factor) {
  self->SetCorrectionFactor(factor);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJoint_GetCorrectionFactor_0(b2MotorJoint* self) {
  return self->GetCorrectionFactor();
}

b2JointType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJoint_GetType_0(b2MotorJoint* self) {
  return self->GetType();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJoint_GetBodyA_0(b2MotorJoint* self) {
  return self->GetBodyA();
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJoint_GetBodyB_0(b2MotorJoint* self) {
  return self->GetBodyB();
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJoint_GetAnchorA_0(b2MotorJoint* self) {
  static b2Vec2 temp;
  return (temp = self->GetAnchorA(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJoint_GetAnchorB_0(b2MotorJoint* self) {
  static b2Vec2 temp;
  return (temp = self->GetAnchorB(), &temp);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJoint_GetReactionForce_1(b2MotorJoint* self, float inv_dt) {
  static b2Vec2 temp;
  return (temp = self->GetReactionForce(inv_dt), &temp);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJoint_GetReactionTorque_1(b2MotorJoint* self, float inv_dt) {
  return self->GetReactionTorque(inv_dt);
}

b2Joint* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJoint_GetNext_0(b2MotorJoint* self) {
  return self->GetNext();
}

b2JointUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJoint_GetUserData_0(b2MotorJoint* self) {
  return &self->GetUserData();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJoint_GetCollideConnected_0(b2MotorJoint* self) {
  return self->GetCollideConnected();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJoint___destroy___0(b2MotorJoint* self) {
  delete self;
}

// b2MotorJointDef

b2MotorJointDef* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJointDef_b2MotorJointDef_0() {
  return new b2MotorJointDef();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJointDef_Initialize_2(b2MotorJointDef* self, b2Body* bodyA, b2Body* bodyB) {
  self->Initialize(bodyA, bodyB);
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJointDef_get_linearOffset_0(b2MotorJointDef* self) {
  return &self->linearOffset;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJointDef_set_linearOffset_1(b2MotorJointDef* self, b2Vec2* arg0) {
  self->linearOffset = *arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJointDef_get_angularOffset_0(b2MotorJointDef* self) {
  return self->angularOffset;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJointDef_set_angularOffset_1(b2MotorJointDef* self, float arg0) {
  self->angularOffset = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJointDef_get_maxForce_0(b2MotorJointDef* self) {
  return self->maxForce;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJointDef_set_maxForce_1(b2MotorJointDef* self, float arg0) {
  self->maxForce = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJointDef_get_maxTorque_0(b2MotorJointDef* self) {
  return self->maxTorque;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJointDef_set_maxTorque_1(b2MotorJointDef* self, float arg0) {
  self->maxTorque = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJointDef_get_correctionFactor_0(b2MotorJointDef* self) {
  return self->correctionFactor;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJointDef_set_correctionFactor_1(b2MotorJointDef* self, float arg0) {
  self->correctionFactor = arg0;
}

b2JointType EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJointDef_get_type_0(b2MotorJointDef* self) {
  return self->type;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJointDef_set_type_1(b2MotorJointDef* self, b2JointType arg0) {
  self->type = arg0;
}

b2JointUserData* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJointDef_get_userData_0(b2MotorJointDef* self) {
  return &self->userData;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJointDef_set_userData_1(b2MotorJointDef* self, b2JointUserData* arg0) {
  self->userData = *arg0;
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJointDef_get_bodyA_0(b2MotorJointDef* self) {
  return self->bodyA;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJointDef_set_bodyA_1(b2MotorJointDef* self, b2Body* arg0) {
  self->bodyA = arg0;
}

b2Body* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJointDef_get_bodyB_0(b2MotorJointDef* self) {
  return self->bodyB;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJointDef_set_bodyB_1(b2MotorJointDef* self, b2Body* arg0) {
  self->bodyB = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJointDef_get_collideConnected_0(b2MotorJointDef* self) {
  return self->collideConnected;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJointDef_set_collideConnected_1(b2MotorJointDef* self, bool arg0) {
  self->collideConnected = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2MotorJointDef___destroy___0(b2MotorJointDef* self) {
  delete self;
}

// b2RopeTuning

b2RopeTuning* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_b2RopeTuning_0() {
  return new b2RopeTuning();
}

b2StretchingModel EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_get_stretchingModel_0(b2RopeTuning* self) {
  return self->stretchingModel;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_set_stretchingModel_1(b2RopeTuning* self, b2StretchingModel arg0) {
  self->stretchingModel = arg0;
}

b2BendingModel EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_get_bendingModel_0(b2RopeTuning* self) {
  return self->bendingModel;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_set_bendingModel_1(b2RopeTuning* self, b2BendingModel arg0) {
  self->bendingModel = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_get_damping_0(b2RopeTuning* self) {
  return self->damping;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_set_damping_1(b2RopeTuning* self, float arg0) {
  self->damping = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_get_stretchStiffness_0(b2RopeTuning* self) {
  return self->stretchStiffness;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_set_stretchStiffness_1(b2RopeTuning* self, float arg0) {
  self->stretchStiffness = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_get_stretchHertz_0(b2RopeTuning* self) {
  return self->stretchHertz;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_set_stretchHertz_1(b2RopeTuning* self, float arg0) {
  self->stretchHertz = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_get_stretchDamping_0(b2RopeTuning* self) {
  return self->stretchDamping;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_set_stretchDamping_1(b2RopeTuning* self, float arg0) {
  self->stretchDamping = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_get_bendStiffness_0(b2RopeTuning* self) {
  return self->bendStiffness;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_set_bendStiffness_1(b2RopeTuning* self, float arg0) {
  self->bendStiffness = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_get_bendHertz_0(b2RopeTuning* self) {
  return self->bendHertz;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_set_bendHertz_1(b2RopeTuning* self, float arg0) {
  self->bendHertz = arg0;
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_get_bendDamping_0(b2RopeTuning* self) {
  return self->bendDamping;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_set_bendDamping_1(b2RopeTuning* self, float arg0) {
  self->bendDamping = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_get_isometric_0(b2RopeTuning* self) {
  return self->isometric;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_set_isometric_1(b2RopeTuning* self, bool arg0) {
  self->isometric = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_get_fixedEffectiveMass_0(b2RopeTuning* self) {
  return self->fixedEffectiveMass;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_set_fixedEffectiveMass_1(b2RopeTuning* self, bool arg0) {
  self->fixedEffectiveMass = arg0;
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_get_warmStart_0(b2RopeTuning* self) {
  return self->warmStart;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning_set_warmStart_1(b2RopeTuning* self, bool arg0) {
  self->warmStart = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeTuning___destroy___0(b2RopeTuning* self) {
  delete self;
}

// b2RopeDef

b2RopeDef* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeDef_b2RopeDef_0() {
  return new b2RopeDef();
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeDef_get_position_0(b2RopeDef* self) {
  return &self->position;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeDef_set_position_1(b2RopeDef* self, b2Vec2* arg0) {
  self->position = *arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeDef_get_vertices_0(b2RopeDef* self) {
  return self->vertices;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeDef_set_vertices_1(b2RopeDef* self, b2Vec2* arg0) {
  self->vertices = arg0;
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeDef_get_count_0(b2RopeDef* self) {
  return self->count;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeDef_set_count_1(b2RopeDef* self, int arg0) {
  self->count = arg0;
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeDef_get_gravity_0(b2RopeDef* self) {
  return &self->gravity;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeDef_set_gravity_1(b2RopeDef* self, b2Vec2* arg0) {
  self->gravity = *arg0;
}

b2RopeTuning* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeDef_get_tuning_0(b2RopeDef* self) {
  return &self->tuning;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeDef_set_tuning_1(b2RopeDef* self, b2RopeTuning* arg0) {
  self->tuning = *arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2RopeDef___destroy___0(b2RopeDef* self) {
  delete self;
}

// b2Rope

b2Rope* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Rope_b2Rope_0() {
  return new b2Rope();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Rope_Create_1(b2Rope* self, const b2RopeDef* def) {
  self->Create(*def);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Rope_SetTuning_1(b2Rope* self, const b2RopeTuning* tuning) {
  self->SetTuning(*tuning);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Rope_Step_3(b2Rope* self, float timeStep, int iterations, const b2Vec2* position) {
  self->Step(timeStep, iterations, *position);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Rope_Reset_1(b2Rope* self, const b2Vec2* position) {
  self->Reset(*position);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Rope_Draw_1(b2Rope* self, b2Draw* draw) {
  self->Draw(draw);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2Rope___destroy___0(b2Rope* self) {
  delete self;
}

// b2ClipVertex

b2ClipVertex* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ClipVertex_b2ClipVertex_0() {
  return new b2ClipVertex();
}

b2Vec2* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ClipVertex_get_v_0(b2ClipVertex* self) {
  return &self->v;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ClipVertex_set_v_1(b2ClipVertex* self, b2Vec2* arg0) {
  self->v = *arg0;
}

b2ContactID* EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ClipVertex_get_id_0(b2ClipVertex* self) {
  return &self->id;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ClipVertex_set_id_1(b2ClipVertex* self, b2ContactID* arg0) {
  self->id = *arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_b2ClipVertex___destroy___0(b2ClipVertex* self) {
  delete self;
}

// b2ShapeType
b2ShapeType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2ShapeType_e_circle() {
  return b2Shape::e_circle;
}
b2ShapeType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2ShapeType_e_edge() {
  return b2Shape::e_edge;
}
b2ShapeType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2ShapeType_e_polygon() {
  return b2Shape::e_polygon;
}
b2ShapeType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2ShapeType_e_chain() {
  return b2Shape::e_chain;
}
b2ShapeType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2ShapeType_e_typeCount() {
  return b2Shape::e_typeCount;
}

// b2BodyType
b2BodyType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2BodyType_b2_staticBody() {
  return b2_staticBody;
}
b2BodyType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2BodyType_b2_kinematicBody() {
  return b2_kinematicBody;
}
b2BodyType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2BodyType_b2_dynamicBody() {
  return b2_dynamicBody;
}

// b2JointType
b2JointType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2JointType_e_unknownJoint() {
  return e_unknownJoint;
}
b2JointType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2JointType_e_revoluteJoint() {
  return e_revoluteJoint;
}
b2JointType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2JointType_e_prismaticJoint() {
  return e_prismaticJoint;
}
b2JointType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2JointType_e_distanceJoint() {
  return e_distanceJoint;
}
b2JointType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2JointType_e_pulleyJoint() {
  return e_pulleyJoint;
}
b2JointType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2JointType_e_mouseJoint() {
  return e_mouseJoint;
}
b2JointType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2JointType_e_gearJoint() {
  return e_gearJoint;
}
b2JointType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2JointType_e_wheelJoint() {
  return e_wheelJoint;
}
b2JointType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2JointType_e_weldJoint() {
  return e_weldJoint;
}
b2JointType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2JointType_e_frictionJoint() {
  return e_frictionJoint;
}
b2JointType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2JointType_e_ropeJoint() {
  return e_ropeJoint;
}
b2JointType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2JointType_e_motorJoint() {
  return e_motorJoint;
}

// b2ContactFeatureType
b2ContactFeatureType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2ContactFeatureType_e_vertex() {
  return b2ContactFeature::e_vertex;
}
b2ContactFeatureType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2ContactFeatureType_e_face() {
  return b2ContactFeature::e_face;
}

// b2DrawFlag
b2DrawFlag EMSCRIPTEN_KEEPALIVE emscripten_enum_b2DrawFlag_e_shapeBit() {
  return b2Draw::e_shapeBit;
}
b2DrawFlag EMSCRIPTEN_KEEPALIVE emscripten_enum_b2DrawFlag_e_jointBit() {
  return b2Draw::e_jointBit;
}
b2DrawFlag EMSCRIPTEN_KEEPALIVE emscripten_enum_b2DrawFlag_e_aabbBit() {
  return b2Draw::e_aabbBit;
}
b2DrawFlag EMSCRIPTEN_KEEPALIVE emscripten_enum_b2DrawFlag_e_pairBit() {
  return b2Draw::e_pairBit;
}
b2DrawFlag EMSCRIPTEN_KEEPALIVE emscripten_enum_b2DrawFlag_e_centerOfMassBit() {
  return b2Draw::e_centerOfMassBit;
}

// b2ManifoldType
b2ManifoldType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2ManifoldType_e_circles() {
  return b2Manifold::e_circles;
}
b2ManifoldType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2ManifoldType_e_faceA() {
  return b2Manifold::e_faceA;
}
b2ManifoldType EMSCRIPTEN_KEEPALIVE emscripten_enum_b2ManifoldType_e_faceB() {
  return b2Manifold::e_faceB;
}

// b2PointState
b2PointState EMSCRIPTEN_KEEPALIVE emscripten_enum_b2PointState_b2_nullState() {
  return b2_nullState;
}
b2PointState EMSCRIPTEN_KEEPALIVE emscripten_enum_b2PointState_b2_addState() {
  return b2_addState;
}
b2PointState EMSCRIPTEN_KEEPALIVE emscripten_enum_b2PointState_b2_persistState() {
  return b2_persistState;
}
b2PointState EMSCRIPTEN_KEEPALIVE emscripten_enum_b2PointState_b2_removeState() {
  return b2_removeState;
}

// b2StretchingModel
b2StretchingModel EMSCRIPTEN_KEEPALIVE emscripten_enum_b2StretchingModel_b2_pbdStretchingModel() {
  return b2_pbdStretchingModel;
}
b2StretchingModel EMSCRIPTEN_KEEPALIVE emscripten_enum_b2StretchingModel_b2_xpbdStretchingModel() {
  return b2_xpbdStretchingModel;
}

// b2BendingModel
b2BendingModel EMSCRIPTEN_KEEPALIVE emscripten_enum_b2BendingModel_b2_springAngleBendingModel() {
  return b2_springAngleBendingModel;
}
b2BendingModel EMSCRIPTEN_KEEPALIVE emscripten_enum_b2BendingModel_b2_pbdAngleBendingModel() {
  return b2_pbdAngleBendingModel;
}
b2BendingModel EMSCRIPTEN_KEEPALIVE emscripten_enum_b2BendingModel_b2_xpbdAngleBendingModel() {
  return b2_xpbdAngleBendingModel;
}
b2BendingModel EMSCRIPTEN_KEEPALIVE emscripten_enum_b2BendingModel_b2_pbdDistanceBendingModel() {
  return b2_pbdDistanceBendingModel;
}
b2BendingModel EMSCRIPTEN_KEEPALIVE emscripten_enum_b2BendingModel_b2_pbdHeightBendingModel() {
  return b2_pbdHeightBendingModel;
}

}
#endif