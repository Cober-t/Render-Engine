#include "pch.h"
#include "ECS.h"


namespace Cober {

	int IComponent::nextIndex = 0;

	Entity Registry::CreateEntity(std::string name, UUID uuid) {

		int entityIndex = numEntities++;
		Entity entity(name, entityIndex, uuid);
		entity.registry = this;

		entitiesToBeAdded.insert(entity);
		entities.insert(entity);

		if (entityIndex >= entityComponentSignatures.size())
			entityComponentSignatures.resize(entityIndex + 1);

		entity.AddComponent<IDComponent>(entity.GetID());
		entity.AddComponent<Tag>(name);
		entity.AddComponent<Transform>();

		//Logger::Log("Created entity with ID = " + std::to_string(entity.GetID()));
		return entity;
	}

	Entity Registry::GetEntity(Entity requestedEntity) {

		for (auto entity : entities) {
			if (entity == requestedEntity)
				return entity;
		}
	}
	
	void Registry::DeleteEntity(Entity entity) {

		Logger::Log("Deleted entity with ID = " + std::to_string(entity.GetID()));
		entitiesToBeKilled.insert(entity);
	}

	void Registry::Update() {
		// TODO: Add the entities that are waiting to be created to the active Systems

		for (auto entity : entitiesToBeAdded)
			AddEntityToSystems(entity);

		entitiesToBeAdded.clear();

		for (auto entity : entitiesToBeKilled) {
			entities.erase(entity);
			RemoveEntityFromSystems(entity);
		}

		entitiesToBeKilled.clear();
	}

	void Registry::AddEntityToSystems(Entity entity) {
		const auto& entityComponentSignature = entityComponentSignatures[entity.GetIndex()];

		for (auto& system : systems) {
			const auto& systemComponentSignature = system.second->GetComponentSignature();
			bool isInterested = (entityComponentSignature & systemComponentSignature) == systemComponentSignature;
			if (isInterested)
				// TODO: Add the entity to the system
				system.second->AddEntityToSystem(entity);
		}
	}

	void Registry::RemoveEntityFromSystems(Entity entity) {
		const auto& entityComponentSignature = entityComponentSignatures[entity.GetIndex()];

		for (auto& system : systems) {
			const auto& systemComponentSignature = system.second->GetComponentSignature();
			bool isInterested = (entityComponentSignature & systemComponentSignature) == systemComponentSignature;
			if (!isInterested)
				// TODO: Add the entity to the system
				system.second->RemoveEntityFromSystem(entity);
		}
	}

	void System::AddEntityToSystem(Entity entity) {
		entities.push_back(entity);
	}

	void System::RemoveEntityFromSystem(Entity entity) {
		entities.erase(std::remove_if(entities.begin(), entities.end(), [&entity](Entity other) {
			return entity == other;
			}), entities.end());
	}
}