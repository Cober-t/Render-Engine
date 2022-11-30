#include "pch.h"
#include "ECS.h"


namespace Cober {

	int IComponent::nextIndex = 0;

	void Entity::Destroy() {

		registry->DeleteEntity(*this);
	}

	Entity Registry::CreateEntity(std::string name) {

		int entityID;
		if (freeIDs.empty()) {
			// If there are no free IDs waiting to be reused
			entityID = numEntities;
			if (entityID >= entityComponentSignatures.size())
				entityComponentSignatures.resize(entityID + 1);
		}
		else {
			// Reuse an ID from the list of previously removed entities
			entityID = freeIDs.front();
			freeIDs.pop_back();
		}

		Entity entity(name, entityID);
		entity.registry = this;
		entitiesToBeAdded.insert(entity);
		entities[entityID] = entity;
		numEntities++;

		entity.AddComponent<Tag>(name);
		entity.AddComponent<Transform>();

		Logger::Log("Created entity with ID = " + std::to_string(entity.GetIndex()));
		return entity;
	}


	Entity Registry::GetEntity(Entity requestedEntity) {

		return entities[requestedEntity.GetIndex()];
	}
	
	void Registry::DeleteEntity(Entity entity) {

		entitiesToBeKilled.insert(entity);
		Logger::Log("Deleted entity with ID = " + std::to_string(entity.GetIndex()));
	}

	void Registry::Update() {

		for (auto& entity : entitiesToBeAdded)
			AddEntityToSystems(entity);

		entitiesToBeAdded.clear();

		for (auto& entity : entitiesToBeKilled) {
			RemoveEntityFromSystems(entity);
			// Must clear component signatures for this entity
			entityComponentSignatures[entity.GetIndex()].reset();
			// Make the entity ID available to be reused
			freeIDs.push_back(entity.GetIndex());
			// Delelete from the global set of entities
			entities.erase(entity.GetIndex());
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

		for (auto& system : systems)
			system.second->RemoveEntityFromSystem(entity);
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