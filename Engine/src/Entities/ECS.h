#pragma once
#include "Components.h"
#include "core/Core.h"

#include <vector>
#include <bitset>
#include <map>
#include <typeindex>
#include <memory>
#include <set>
#include <deque>
#include <core/Logger.h>


const unsigned int MAX_COMPONENTS = 32;

//// SIGNATURE
// We use a bitset (1s and 0s) to keep track of which components an entity has
// and also keep track of which entities a system is interested in.
typedef std::bitset<MAX_COMPONENTS> Signature;

namespace Cober {

	////////////////////////////////////////////////////////////////
	// +++++ ENTITY +++++++++++++++++++++++++++++++++++++++++++++ //
	class Entity {
	public:
		Entity() = default;
		Entity(std::string name, int entityIndex) : index(entityIndex), registry(nullptr) {};
		Entity(const Entity& entity) = default;

		void Destroy();
		
		std::string GetTag() const;
		std::string GetGroup() const;
		int GetIndex() const { return index; }
		void SetIndex(int id) { index = id; }

		void SetTag(std::string name);
		void SetGroup(std::string group);
		void RemoveFromGroup();
		bool BelongsToGroup(const std::string& group) const;

		bool operator ==(const Entity& other) const { return index == other.index; };
		bool operator !=(const Entity& other) const { return index != other.index; };
		bool operator < (const Entity& other) const { return index < other.index; };
		bool operator > (const Entity& other) const { return index > other.index; };
		operator uint32_t() const { return (uint32_t)this; }

		template<typename TComponent,
			typename ...TArgs>		void AddComponent(TArgs&& ...args);
		template<typename TComponent>	void RemoveComponent();
		template<typename TComponent>	bool HasComponent() const;
		template<typename TComponent>	TComponent& GetComponent() const;

		class Registry* registry;	// Alternative to Forward Declaration

		int index;
		//std::string group;
	};

	////////////////////////////////////////////////////////////////
	// +++++ SYSTEM +++++++++++++++++++++++++++++++++++++++++++++ //
	class System {
	public:
		System() = default;
		~System() = default;

		void AddEntityToSystem(Entity entity);
		void RemoveEntityFromSystem(Entity entity);

		std::vector<Entity> GetSystemEntities() const { return entities; }
		const Signature& GetComponentSignature() const { return componentSignature; }

		// Defines the component type that entities must have to be considered by the system
		template<typename TComponent>	void RequireComponent();
	private:
		Signature componentSignature;
		std::vector<Entity> entities;
	};


	////////////////////////////////////////////////////////////////
	// +++++ POOL +++++++++++++++++++++++++++++++++++++++++++++++ //
	class IPool {
	public:
		virtual ~IPool() {}
	};

	template<typename T>
	class Pool : public IPool {
	public:
		Pool(int size = 100) { data.resize(size); }
		virtual ~Pool() = default;

		bool IsEmpty() const { return data.empty();	}
		int  GetSize() const { return data.size();	}
		void Resize(int n)	 { data.resize(n);		}

		void Clear() { data.clear(); }
		void Add(T object) { data, push_back(object); }
		void Set(int index, T object) { data[index] = object; }

		T& Get(int index) { return static_cast<T&>(data[index]); }
		T& operator [](unsigned int index) { return data[index]; }
	private:
		std::vector<T> data;
	};

	////////////////////////////////////////////////////////////////
	// +++++ REGISTRY +++++++++++++++++++++++++++++++++++++++++++ //
	class Registry {
	public:
		Registry()  { LOG_INFO("Registry constructor called"); };
		~Registry() { LOG_INFO("Registry destructor called"); };

		void Update();

		Entity CreateEntity(std::string name = "Empty Entity");
		Entity GetEntity(Entity& requestedEntity);
		std::map<int, Entity>& GetAllEntities() { return entities; };
		void DeleteEntity(Entity& entity);

		std::vector<std::string> GetAllTags();
		std::vector<std::string> GetAllGroups();

		std::string GetEntityGroup(Entity entity);
		std::vector<Entity> GetGroupOfEntities(Entity& entity);
		std::vector<Entity> GetGroupOfEntities(const std::string& group);

		Entity GetEntityByIndex(const int ID) const;
		Entity GetEntityByTag(const std::string& tag) const;
		void SetEntityTag(Entity& entity, std::string tag);
		void SetEntityGroup(Entity& entity, const std::string& group);

		// Remove an entity from a group
		void RemoveEntityTag(Entity& entity);
		void RemoveEntityGroup(Entity& entity);
		// Check if an entity belongs to a group
		bool EntityBelongsToGroup(Entity& entity, const std::string& group) const;

		// Add the entity to the systems that are interested in it
		void AddEntityToSystems(Entity entity);
		void RemoveEntityFromSystems(Entity entity);

		// Component management
		template<typename TComponent,
			typename ...TArgs>			void AddComponent(Entity entity, TArgs&& ...args);
		template<typename TComponent>	void RemoveComponent(Entity entity);
		template<typename TComponent>	bool HasComponent(Entity entity) const;
		template<typename TComponent>	TComponent& GetComponent(Entity entity) const;

		// System management
		template<typename TSystem,
			typename ...TArgs> 			void AddSystem(TArgs&& ...args);
		template<typename TSystem>		void RemoveSystem();
		template<typename TSystem>		bool HasSystem() const;
		template<typename TSystem>		TSystem& GetSystem() const;

	private:
		int numEntities = 0;
		std::vector<Ref<IPool>> componentPools;

		std::vector<Signature> entityComponentSignatures;

		std::map<std::type_index, Ref<System>> systems;

		std::map<int, Entity> entities;
		std::map<std::string, Entity> entityByTag;
		std::map<std::string, std::set<Entity>> entitiesByGroup;
		std::map<int, std::string> tagsFromEntities;
		std::map<int, std::string> groupsByEntities;

		std::set<Entity> entitiesToBeAdded;
		std::set<Entity> entitiesToBeKilled;
		std::deque<int> freeIDs;
	};


	////////////////////////////////////////////////////////////////
	// +++++ TEMPLATES ++++++++++++++++++++++++++++++++++++++++++ //
	template <typename TComponent>
	void System::RequireComponent() {
		const auto componentID = Component<TComponent>::GetComponentIndex();
		componentSignature.set(componentID);
	}

	template<typename TSystem, typename ... TArgs>
	void Registry::AddSystem(TArgs&& ...args) {
		Ref<TSystem> newSystem(CreateRef<TSystem>(std::forward<TArgs>(args)...));
		systems.insert(std::make_pair(std::type_index(typeid(TSystem)), newSystem));
	}

	template<typename TSystem>
	void Registry::RemoveSystem() {
		auto system = systems.find(std::type_index(typeid(TSystem)));
		systems.erase(system);
	}

	template<typename TSystem>
	bool Registry::HasSystem() const {
		return systems.find(std::type_index(typeid(TSystem))) != systems.end();
	}

	template<typename TSystem>
	TSystem& Registry::GetSystem() const {
		auto system = systems.find(std::type_index(typeid(TSystem)));
		return *(std::static_pointer_cast<TSystem>(system->second));
	}

	template<typename TComponent, typename ...TArgs>
	void Registry::AddComponent(Entity entity, TArgs&& ...args) {
		const auto componentID = Component<TComponent>::GetComponentIndex();
		const auto entityID = entity.GetIndex();

		if (componentID >= componentPools.size())
			componentPools.resize(componentID + 1, nullptr);

		if (!componentPools[componentID]) {
			Ref<Pool<TComponent>> newComponentPool = CreateRef<Pool<TComponent>>();
			componentPools[componentID] = newComponentPool;
		}

		Ref<Pool<TComponent>> componentPool = std::static_pointer_cast<Pool<TComponent>>(componentPools[componentID]);

		if (entityID >= componentPool->GetSize())
			componentPool->Resize(numEntities);

		TComponent newComponent(std::forward<TArgs>(args)...);
		componentPool->Set(entityID, newComponent);
		entityComponentSignatures[entityID].set(componentID);

		//if (componentID != 0 && componentID != 3 && componentID != 4)
		//	LOG("Component ID = " + std::to_string(componentID) + " was added to entity: " + entity.GetComponent<Tag>().tag);
	}

	template<typename TComponent>
	void Registry::RemoveComponent(Entity entity) {
		const auto componentID = Component<TComponent>::GetComponentIndex();
		const auto entityID = entity.GetIndex();

		entityComponentSignatures[entityID].set(componentID, false);
		//LOG("Component ID = " + std::to_string(componentID) + " was removed from entity ID: " + std::to_string(entityID));
	}

	template<typename TComponent>
	bool Registry::HasComponent(Entity entity) const {
		const auto componentID = Component<TComponent>::GetComponentIndex();
		const auto entityID = entity.GetIndex();

		return entityComponentSignatures[entityID].test(componentID);
	}

	template<typename TComponent>
	TComponent& Registry::GetComponent(Entity entity) const {
		const auto componentID = Component<TComponent>::GetComponentIndex();
		const auto entityID = entity.GetIndex();
		auto componentPool = std::static_pointer_cast<Pool<TComponent>>(componentPools[componentID]);

		return componentPool->Get(entityID);
	}

	template<typename TComponent, typename ...TArgs>
	void Entity::AddComponent(TArgs&& ...args) {
		registry->AddComponent<TComponent>(*this, std::forward<TArgs>(args)...);
	}

	template<typename TComponent>
	void Entity::RemoveComponent() {
		registry->RemoveComponent<TComponent>(*this);
	}

	template<typename TComponent>
	bool Entity::HasComponent() const {
		return registry->HasComponent<TComponent>(*this);
	}

	template<typename TComponent>
	TComponent& Entity::GetComponent() const {
		return registry->GetComponent<TComponent>(*this);
	}
}