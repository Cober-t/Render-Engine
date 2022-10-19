#include "pch.h"
#include "ECS.h"

namespace Cober {

	int IComponent::nextID = 0;

	void System::AddEntityToSystem(Entity entity) {
		entities.push_back(entity);
	}

	void System::RemoveEntityFromSystem(Entity entity) {
		entities.erase(std::remove_if(entities.begin(), entities.end(), [&entity](Entity other) {
			return entity == other;
			}), entities.end());
	}

	Entity Registry::CreateEntity() {
		// Change for Universal Unique Identifier
		Logger::Log("Entity created with id = " + std::to_string(numEntities));

		int entityID = numEntities++;
		Entity entity(entityID);
		entity.registry = this;
		entitiesToBeAdded.insert(entity);

		if (entityID >= entityComponentSignatures.size())
			entityComponentSignatures.resize(entityID + 1);
		return entity;
	}

	void Registry::AddEntityToSystems(Entity entity) {
		const auto& entityComponentSignature = entityComponentSignatures[entity.GetID()];

		for (auto& system : systems) {
			const auto& systemComponentSignature = system.second->GetComponentSignature();
			bool isInterested = (entityComponentSignature & systemComponentSignature) == systemComponentSignature;
			if (isInterested)
				// TODO: Add the entity to the system
				system.second->AddEntityToSystem(entity);
		}
	}

	void Registry::Update() {
		// TODO: Add the entities that are waiting to be created to the active Systems

		for (auto entity : entitiesToBeAdded)
			AddEntityToSystems(entity);

		entitiesToBeAdded.clear();

		for (auto entity : entitiesToBeAdded)
			AddEntityToSystems(entity);

		// TODO: Remove the entities that are waiting to be killed from the active Systems
	}
}