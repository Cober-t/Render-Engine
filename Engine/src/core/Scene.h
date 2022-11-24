#pragma once

#include "Application.h"
#include "Render/Camera/EditorCamera.h"

namespace Cober {

	class Scene {
	public:
		Scene();
		~Scene();

		void OnRuntimeStart(const Ref<Scene>& scene);
		void OnRuntimeStop();

		//void OnUpdateRuntime(Ref<Timestep> ts);	// Get Camera components from entities
		void OnUpdateRuntime(Ref<Timestep> ts, Ref<EditorCamera> camera);
		void OnUpdateEditor(Ref<Timestep> ts, Ref<EditorCamera> camera);

		void OnViewportResize(uint32_t width, uint32_t height);

		uint32_t GetWidth()  { return _width; }
		uint32_t GetHeight() { return _height; }
		void GetEntity(int index, Entity& hoveredEntity);
		std::unordered_map<UUID, Entity>& GetSceneEntities() { return _registry.GetAllEntities(); }

		void SetDefaultEntity(Entity& entity) { entity.SetTag("None"); entity.SetIndex(-1); }
		void CreateEntity(std::string name = "Empty Entity", UUID uuid = UUID()) { _registry.CreateEntity(name, uuid); }

		Registry& GetRegistry() { return _registry; }

		static Ref<Scene> Copy(Ref<Scene> scene);

		static Ref<Scene> Create();
	private:
		bool _world2D;
		Registry _registry;
		uint32_t _width; 
		uint32_t _height;
	};
}