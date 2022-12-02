#include "pch.h"
#include "ECS.h"


namespace Cober {

	int IComponent::nextIndex = 0;

	///////////////////////////////////////////////////////////////////
	////++++++++++++++++++++   ENTITY   +++++++++++++++++++++++++++////
	void Entity::Destroy() {

		registry->DeleteEntity(*this);
	}

	std::string Entity::GetTag() const {

		return this->HasComponent<Tag>() ? this->GetComponent<Tag>().tag : "None";
	}

	std::string Entity::GetGroup() const {

		return registry->GetEntityGroup(*this);
	}

	void Entity::SetTag(std::string name) {

		registry->SetEntityTag(*this, name);
	}

	void Entity::SetGroup(std::string group) {

		registry->SetEntityGroup(*this, group);
	}

	void Entity::RemoveFromGroup() {

		registry->RemoveEntityGroup(*this);
	}

	bool Entity::BelongsToGroup(const std::string& group) const
	{
		return GetGroup() == group;
	}

	////////////////////////////////////////////////////////////////////////////
	////++++++++++++++++++++++++   REGISTRY   ++++++++++++++++++++++++++++++////
	Entity Registry::CreateEntity(std::string name) {

		int entityID;
		if (freeIDs.empty()) {
			// If there are no free IDs waiting to be reused
			entityID = numEntities++;
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

		entity.AddComponent<Tag>(name);
		entity.AddComponent<Transform>();
		entity.SetTag(name);
		entity.SetGroup("None");

		Logger::Log("Created entity with ID = " + std::to_string(entity.GetIndex()));
		return entity;
	}


	Entity Registry::GetEntity(Entity& requestedEntity) {

		return entities[requestedEntity.GetIndex()];
	}
	
	void Registry::DeleteEntity(Entity& entity) {

		entitiesToBeKilled.insert(entity);
		Logger::Log("Deleted entity with ID = " + std::to_string(entity.GetIndex()));
	}

	std::vector<std::string> Registry::GetAllTags()
	{
		std::vector<std::string> vector;
		for (auto i : tagsFromEntities)
			vector.push_back(i.second);
		return vector;
	}

	std::vector<std::string> Registry::GetAllGroups()
	{
		std::vector<std::string> vector;
		for (auto i : entitiesByGroup)
			vector.push_back(i.first);
		return vector;
	}

	std::string Registry::GetEntityGroup(Entity entity) {

		if (groupsByEntities.find(entity.GetIndex()) != groupsByEntities.end())
			return groupsByEntities.at(entity.GetIndex());
		else
			return "None";
	}

	std::vector<Entity> Registry::GetGroupOfEntities(Entity& entity)
	{
		std::string group = groupsByEntities.at(entity.GetIndex());
		auto& groupOfEntities = entitiesByGroup.at(group);
		return std::vector<Entity>(groupOfEntities.begin(), groupOfEntities.end());
	}

	std::vector<Entity> Registry::GetGroupOfEntities(const std::string& group)
	{
		return std::vector<Entity>(entitiesByGroup.at(group).begin(), entitiesByGroup.at(group).end());
	}
	
	Entity Registry::GetEntityByIndex(const int ID) const
	{
		return entities.at(ID);
	}

	Entity Registry::GetEntityByTag(const std::string& tag) const
	{
		return entityByTag.at(tag);
	}

	void Registry::SetEntityTag(Entity& entity, std::string tag) {
	
		// Only remove if the entity already is in tag lists (name change)
		RemoveEntityTag(entity);
		// Check repeat tags
		if (entityByTag.find(tag) != entityByTag.end()) {
			int enttCount = 0;
			for (auto entityTag : entityByTag) {
				std::string repeatedTag = entityTag.first.substr(0, entityTag.first.find_first_of("("));
				if (repeatedTag == tag)
					enttCount++;
			}
			tag += "(" + std::to_string(enttCount) + ")";
		}

		// Check if the tag does not appeared beffore, we must include in the map
		if (tagsFromEntities.find(entity.GetIndex()) == tagsFromEntities.end())
			tagsFromEntities.emplace(entity.GetIndex(), tag);

		if (entityByTag.find(tag) == entityByTag.end())
			entityByTag.emplace(tag, entity);

		entities[entity.GetIndex()].GetComponent<Tag>().tag = tag;
	}

	void Registry::SetEntityGroup(Entity& entity, const std::string& newGroup)
	{
		// Check if the group does not appeared beffore, we must include in the map
		if (entitiesByGroup.find(newGroup) == entitiesByGroup.end())
			entitiesByGroup.emplace(newGroup, std::set<Entity>());
 
		// Check if the entity we want to include is not int he group yet
		if (entitiesByGroup.at(newGroup).find(entity) == entitiesByGroup.at(newGroup).end()) {
			// If the entity already belong to a group we must remove from that group
			RemoveEntityGroup(entity);
			// Add the Entity to the Group map and to the EntitiesGroup map
			entitiesByGroup[newGroup].emplace(entity);

			// Add the Entity to the EntityGroup map if already exists or 
			// insert the Entity if has appeared for the first time
			if(groupsByEntities.find(entity.GetIndex()) == groupsByEntities.end())
				groupsByEntities.emplace(entity.GetIndex(), newGroup);
			else
				groupsByEntities.find(entity.GetIndex())->second = newGroup;
		}
		else
			Logger::Log("The Entity with ID " + std::to_string(entity.GetIndex()) + (std::string)" already belongs to the group " + newGroup);
	}

	void Registry::RemoveEntityTag(Entity& entity) {

		if (tagsFromEntities.find(entity.GetIndex()) != tagsFromEntities.end()) {
			tagsFromEntities.erase(entity.GetIndex());
			entityByTag.erase(entity.GetComponent<Tag>().tag);
		}
	}
	void Registry::RemoveEntityGroup(Entity& entity)
	{
		std::string group = GetEntityGroup(entity);
		if (entitiesByGroup.find(group) != entitiesByGroup.end()) {

			if (entitiesByGroup.at(group).find(entity) != entitiesByGroup.at(group).end()) {
				entitiesByGroup.at(group).erase(entity);
				groupsByEntities.erase(entity.GetIndex());
			}

			if (entitiesByGroup.at(group).empty())
				entitiesByGroup.erase(group);
		}
	}

	bool Registry::EntityBelongsToGroup(Entity& entity, const std::string& group) const
	{
		return entitiesByGroup.at(group).find(entity) == entitiesByGroup.at(group).end();
	}

	void Registry::Update() {

		for (auto& entity : entitiesToBeAdded)
			AddEntityToSystems(entity);

		entitiesToBeAdded.clear();

		for (auto entity : entitiesToBeKilled) {
			RemoveEntityFromSystems(entity);
			// Must clear component signatures for this entity
			entityComponentSignatures[entity.GetIndex()].reset();
			// Make the entity ID available to be reused
			freeIDs.push_back(entity.GetIndex());
			// Remove Tag and Group from registry
			RemoveEntityTag(entity);
			RemoveEntityGroup(entity);
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
	

	///////////////////////////////////////////////////////////////////////////
	////++++++++++++++++++++++++   SYSTEM   +++++++++++++++++++++++++++++++////
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