#include "pch.h"
#include "ECS.h"


namespace Cober {

	int IComponent::nextIndex = 0;

	Entity Registry::CreateEntity(std::string name, UUID uuid) {

		int entityIndex = numEntities++;
		Entity entity(name, entityIndex, uuid);
		entity.registry = this;

		entitiesToBeAdded.insert(entity);
		entities[uuid] = entity;

		if (entityIndex >= entityComponentSignatures.size())
			entityComponentSignatures.resize(entityIndex + 1);

		entity.AddComponent<IDComponent>(entity.GetID());
		entity.AddComponent<Tag>(name);
		entity.AddComponent<Transform>();

		//Logger::Log("Created entity with ID = " + std::to_string(entity.GetIndex()));
		return entity;
	}


	Entity Registry::GetEntity(Entity requestedEntity) {

		return entities[requestedEntity.GetComponent<IDComponent>().ID];
	}
	
	void Registry::DeleteEntity(Entity entity) {

		entitiesToBeKilled.insert(entity);
	}

	void Registry::Update() {
		// TODO: Add the entities that are waiting to be created to the active Systems

		for (auto& entity : entitiesToBeAdded)
			AddEntityToSystems(entity);

		entitiesToBeAdded.clear();

		for (auto& entity : entitiesToBeKilled) {
			for (auto& system : systems)
				system.second->RemoveEntityFromSystem(entity);
			entities.erase(entity.GetComponent<IDComponent>().ID);
		}

		entitiesToBeKilled.clear();
	}

	void Registry::AddEntityToSystems(Entity entity) {
		const auto& entityComponentSignature = entityComponentSignatures[entity.GetIndex()];

		for (auto& system : systems) {
			const auto& systemComponentSignature = system.second->GetComponentSignature();
			bool isInterested = (entityComponentSignature & systemComponentSignature) == systemComponentSignature;
			if (isInterested)
				system.second->AddEntityToSystem(entity);
		}
	}

	void Registry::RemoveEntityFromSystems(Entity entity) {
		const auto& entityComponentSignature = entityComponentSignatures[entity.GetIndex()];

		for (auto& system : systems) {
			const auto& systemComponentSignature = system.second->GetComponentSignature();
			bool isInterested = (entityComponentSignature & systemComponentSignature) == systemComponentSignature;
			if (!isInterested)
				system.second->RemoveEntityFromSystem(entity);
		}
	}

	void System::AddEntityToSystem(Entity entity) {
		if (std::find(entities.begin(), entities.end(), entity) == entities.end()) {
			entities.push_back(entity);
		}
	}

	void System::RemoveEntityFromSystem(Entity entity) {
		entities.erase(std::remove_if(entities.begin(), entities.end(), [&entity](Entity other) {
			return entity == other;
			}), entities.end());
	}
}