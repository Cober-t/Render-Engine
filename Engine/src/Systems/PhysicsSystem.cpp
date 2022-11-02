#include "pch.h"

#include "PhysicsSystem.h"

namespace Cober {

	PhysicsSystem::PhysicsSystem()
	{
		_debugPhysics = DebugSystem::Create();

		RequireComponent<Transform>();
		RequireComponent<Rigidbody2D>();
		//RequireComponent<BoxCollider2D>();

		Logger::Log("Physics SYSTEM Added!!");
	}

	PhysicsSystem::~PhysicsSystem()
	{
		Logger::Log("Physics System removed from Registry");

		delete _physicsWorld;
		delete _debugPhysics;
		_physicsWorld = nullptr;
		_debugPhysics = nullptr;
	}
	void PhysicsSystem::Start(const Ref<Scene>& scene) {

		_registry = scene->GetRegistry();

		//for (auto entity : _registry->GetAllEntities())
			//_registry->AddEntityToSystems(entity);

		_physicsWorld = new b2World({ 0.0f, -9.8f });
		for (auto entity : GetSystemEntities()) {

			// RIGIDBODY
			auto& transform = entity.GetComponent<Transform>();
			auto& rb2d = entity.GetComponent<Rigidbody2D>();

			b2BodyDef bodyDef;
			bodyDef.type = (b2BodyType)rb2d.type;
			bodyDef.position.Set(transform.position.x, transform.position.y);
			bodyDef.angle = transform.rotation.z;

			body = _physicsWorld->CreateBody(&bodyDef);
			body->SetFixedRotation(rb2d.fixedRotation);
			rb2d.runtimeBody = body;

			// BOX COLLIDER 2D
			if (entity.HasComponent<BoxCollider2D>()) {
				auto& bc2d = entity.GetComponent<BoxCollider2D>();
				bc2d.shape.SetAsBox((bc2d.size.x * transform.scale.x) + bc2d.offset.x,
					(bc2d.size.y * transform.scale.y) + bc2d.offset.y);
			}

			// BOX COLLIDER 3D
			// ...
			// CIRCLE COLLIDER
			// ...
			// SPHERE COLLIDER
		}
	}

	void PhysicsSystem::Update(double ts)
	{
		const int32_t velocityIterations = 6;
		const int32_t positionIterations = 2;
		_physicsWorld->Step(ts, velocityIterations, positionIterations);
		_physicsWorld->DebugDraw();

		for (auto entity : GetSystemEntities()) {
			auto& transform = entity.GetComponent<Transform>();
			auto& rb2d = entity.GetComponent<Rigidbody2D>();
			
			// RIGIDBODY
			b2Body* body = (b2Body*)rb2d.runtimeBody;
			const auto& position = body->GetPosition();
			transform.position.x = position.x;
			transform.position.y = position.y;
			transform.rotation.x = 0.0f;
			transform.rotation.y = 0.0f;
			if (rb2d.fixedRotation)
				transform.rotation.z = 0.0f;
			else
				transform.rotation.z = body->GetAngle();

			// BOX COLLIDER
			if (entity.HasComponent<BoxCollider2D>()) {
				auto& bc2d = entity.GetComponent<BoxCollider2D>();
				bc2d.shape.SetAsBox((bc2d.size.x * transform.scale.x) + bc2d.offset.x,
					(bc2d.size.y * transform.scale.y) + bc2d.offset.y);

				b2FixtureDef fixtureDef;
				fixtureDef.shape = &bc2d.shape;
				fixtureDef.density = bc2d.density;
				fixtureDef.friction = bc2d.friction;
				fixtureDef.restitution = bc2d.restitution;
				fixtureDef.restitutionThreshold = bc2d.restitutionThreshold;
				body->CreateFixture(&fixtureDef);			
			}

			// BOX COLLIDER 3D
			// ...
			// CIRCLE COLLIDER
			// ...
			// SPHERE COLLIDER
		}
	}

	void PhysicsSystem::UpdateData()
	{
		//_physicsWorld->DebugDraw();

		for (auto entity : GetSystemEntities()) {
			auto& transform = entity.GetComponent<Transform>();
			auto& rb2d = entity.GetComponent<Rigidbody2D>();
			
			b2BodyDef bodyDef;
			bodyDef.type = (b2BodyType)rb2d.type;
			bodyDef.position.Set(transform.position.x, transform.position.y);
			bodyDef.angle = transform.rotation.z;

			body = _physicsWorld->CreateBody(&bodyDef);
			rb2d.runtimeBody = body;

			// BOX COLLIDER
			if (entity.HasComponent<BoxCollider2D>()) {
				auto& bc2d = entity.GetComponent<BoxCollider2D>();
				bc2d.shape.SetAsBox((bc2d.size.x * transform.scale.x) + bc2d.offset.x, (bc2d.size.y * transform.scale.y) + bc2d.offset.y);

				b2FixtureDef fixtureDef;
				fixtureDef.shape = &bc2d.shape;
				fixtureDef.density = bc2d.density;
				fixtureDef.friction = bc2d.friction;
				fixtureDef.restitution = bc2d.restitution;
				fixtureDef.restitutionThreshold = bc2d.restitutionThreshold;
				body->CreateFixture(&fixtureDef);
			}

			// BOX COLLIDER 3D
			// ...
			// CIRCLE COLLIDER
			// ...
			// SPHERE COLLIDER
		}
	}
}
