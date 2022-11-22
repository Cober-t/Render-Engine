#include "pch.h"

#include "PhysicsSystem.h"

namespace Cober {

	PhysicsSystem::PhysicsSystem()
	{
		RequireComponent<Transform>();
		RequireComponent<Rigidbody2D>();
		//RequireComponent<BoxCollider2D>();
	}

	PhysicsSystem::~PhysicsSystem()
	{
		LOG("Physics System removed from Registry");

		delete _physicsWorld;
		_physicsWorld = nullptr;
	}

	void PhysicsSystem::Start()
	{
		_physicsWorld = new b2World({ 0.0f, -0.5f });

		for (auto& entity : GetSystemEntities()) {

			auto& transform = entity.GetComponent<Transform>();
			auto& rb2d = entity.GetComponent<Rigidbody2D>();

			b2BodyDef bodyDef;
			bodyDef.type = (b2BodyType)rb2d.type;
			bodyDef.angle = transform.rotation.z;

			// BOX COLLIDER
			b2FixtureDef fixtureDef;
			if (entity.HasComponent<BoxCollider2D>()) {
				auto& bc2d = entity.GetComponent<BoxCollider2D>();

				bc2d.shape.SetAsBox((abs(bc2d.size.x)+ abs(transform.scale.x)) * 0.5f, (abs(bc2d.size.y) + abs(transform.scale.y)) * 0.5f);
				bodyDef.position.Set(transform.position.x + bc2d.offset.x, transform.position.y + bc2d.offset.y);

				fixtureDef.shape = &bc2d.shape;
				fixtureDef.density = bc2d.density;
				fixtureDef.friction = bc2d.friction;
				fixtureDef.restitution = bc2d.restitution;
				fixtureDef.restitutionThreshold = bc2d.restitutionThreshold;
			}
			else 
				bodyDef.position.Set(transform.position.x, transform.position.y);

			b2Body* body = _physicsWorld->CreateBody(&bodyDef);
			body->SetFixedRotation(rb2d.fixedRotation);
			
			if(entity.HasComponent<BoxCollider2D>())
				body->CreateFixture(&fixtureDef);

			rb2d.runtimeBody = body;

			// BOX COLLIDER 3D
			// ...
			// CIRCLE COLLIDER
			// ...
			// SPHERE COLLIDER
			// ...
			// TRIGGERS ...
		}
		LOG("Physic System Started!!");
	}

	void PhysicsSystem::Update(double ts)
	{
#ifdef __EMSCRIPTEN__
		const int32_t velocityIterations = 3;
		const int32_t positionIterations = 2;
		_physicsWorld->Step(0.016f, velocityIterations, positionIterations);
#else
		const int32_t velocityIterations = 6;
		const int32_t positionIterations = 2;
		_physicsWorld->Step(ts, velocityIterations, positionIterations);
#endif

		for (auto& entity : GetSystemEntities()) {
			auto& transform = entity.GetComponent<Transform>();
			auto& rb2d = entity.GetComponent<Rigidbody2D>();
			
			b2Body* body = (b2Body*)rb2d.runtimeBody;
			const auto& position = body->GetPosition();

			if (rb2d.type != BodyType::Static) {
				transform.position.x = position.x;
				transform.position.y = position.y;
				transform.rotation.x = 0.0f;	// 2D
				transform.rotation.y = 0.0f;	// 2D
				if (rb2d.fixedRotation)
					transform.rotation.z = 0.0f;
				else
					transform.rotation.z = body->GetAngle();
			}
		}
	}
}