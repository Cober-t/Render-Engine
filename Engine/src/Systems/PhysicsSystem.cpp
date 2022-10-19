#include "pch.h"

#include "PhysicsSystem.h"

namespace Cober {

	PhysicsSystem::PhysicsSystem()
	{
		RequireComponent<Transform>();
		RequireComponent<Sprite>();
	}

	PhysicsSystem::~PhysicsSystem()
	{
		Logger::Log("Physics System removed from Registry");
	}

	void PhysicsSystem::Update(double deltaTime)
	{
	}
}
