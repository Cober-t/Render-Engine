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
		virtual ~IPool() = default;
		virtual void RemoveEntityFromPool(int entityID) = 0;
	};

	template<typename T>
	class Pool : public IPool {
	public:
		Pool(int capacity = 100) { size = 0; data.resize(capacity); }
		virtual ~Pool() = default;

		bool IsEmpty() const { return size == 0; }
		int  GetSize() const { return size;		 }
		void Resize(int n)	 { data.resize(n);	 }

		void Clear()		 { data.clear(); size = 0; }
		void Add(T object)	 { data.push_back(object); }
		void Set(int entitiID, T object); 
		void Remove(int entityID);

		void RemoveEntityFromPool(int entityID) override;

		T& Get(int entityID);
		T& operator [](unsigned int index) { return data[index]; }
	private:
		// Keep track of the vecgtor of component objects and ther current size
		std::vector<T> data;
		int size;
		// Maps to keep track of entity ids per index so the vector is always packed
		std::map<int, int> entityIDToIndex;
		std::map<int, int> indexToEntityID;
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
		bool EntityBelongsToGroup(Entity entity, const std::string& group) const;

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
		const auto componentID = Component<TComponent>::GetComponentID();
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
		const auto componentID = Component<TComponent>::GetComponentID();
		const auto entityID = entity.GetIndex();

		if (componentID >= componentPools.size())
			componentPools.resize(componentID + 1, nullptr);

		if (!componentPools[componentID]) {
			Ref<Pool<TComponent>> newComponentPool = CreateRef<Pool<TComponent>>();
			componentPools[componentID] = newComponentPool;
		}

		Ref<Pool<TComponent>> componentPool = std::static_pointer_cast<Pool<TComponent>>(componentPools[componentID]);

		TComponent newComponent(std::forward<TArgs>(args)...);
		componentPool->Set(entityID, newComponent);
		entityComponentSignatures[entityID].set(componentID);

		//Logger::Log("Component ID = " + std::to_string(componentID) + " --> Pool Size: " + std::to_string(componentPool->GetSize()));
	}

	template<typename TComponent>
	void Registry::RemoveComponent(Entity entity) {

		const auto componentID = Component<TComponent>::GetComponentID();
		const auto entityID = entity.GetIndex();
		// Remove the component fmro the component list for that entity
		Ref<Pool<TComponent>> componentPool = std::static_pointer_cast<Pool<TComponent>>(componentPools[componentID]);
		componentPool->Remove(entityID);
		// Set this component signature for that entity to false
		entityComponentSignatures[entityID].set(componentID, false);
		
		//LOG("Component ID = " + std::to_string(componentID) + " was removed from entity ID: " + std::to_string(entityID));
	}

	template<typename TComponent>
	bool Registry::HasComponent(Entity entity) const {
		const auto componentID = Component<TComponent>::GetComponentID();
		const auto entityID = entity.GetIndex();

		return entityComponentSignatures[entityID].test(componentID);
	}

	template<typename TComponent>
	TComponent& Registry::GetComponent(Entity entity) const {
		const auto componentID = Component<TComponent>::GetComponentID();
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

	template<typename T>
	inline void Pool<T>::Set(int entityID, T object) {

		if (entityIDToIndex.find(entityID) != entityIDToIndex.end()) {
			// If the element already exists, simply replace the component object
			int index = entityIDToIndex[entityID];
			data[index] = object;
		}
		else {
			// When adding a new object, keep track of the entity ID and its vector index
			int index = size;
			entityIDToIndex.emplace(entityID, index);
			indexToEntityID.emplace(index, entityID);
			if(index >= data.capacity()) {
				// If necessary, we resize by alwats doubling the current capacity
				data.resize(size * 2);
			}
			data[index] = object;
			size++;
		}
	}

	template<typename T>
	inline void Pool<T>::Remove(int entityID) {
		// Copy the last element to the deleted position to keep the array packed
		int indexOfRemoved = entityIDToIndex[entityID];
		int indexOfLast = size - 1;
		data[indexOfRemoved] = data[indexOfLast];

		// Update the index-entity maps to point to the correct elements
		int entityIdLastElement = indexToEntityID[indexOfLast];
		entityIDToIndex[entityIdLastElement] = indexOfRemoved;
		indexToEntityID[indexOfRemoved] = entityIdLastElement;

		entityIDToIndex.erase(entityID);
		indexToEntityID.erase(indexOfLast);
		size--;
	}

	template<typename T>
	void Pool<T>::RemoveEntityFromPool(int entityID) {

		if (entityIDToIndex.find(entityID) != entityIDToIndex.end())
			Remove(entityID);
	}

	template<typename T>
	inline T& Pool<T>::Get(int entityID) {

		int index = entityIDToIndex[entityID];
		return static_cast<T&>(data[index]);
	}
}