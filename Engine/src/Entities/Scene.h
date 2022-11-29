#pragma once

#include "core/Utils.h"
#include "core/Application.h"
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
		void SetWidth(uint32_t w)  { _width = w; }
		void SetHeight(uint32_t h) { _height = h; }

		void GetEntity(int index, Entity& hoveredEntity);
		Entity GetEntity(int index) { return GetSceneEntities().at(index); };
		std::map<int, Entity>& GetSceneEntities() { return _registry.GetAllEntities(); }

		void SetDefaultEntity(Entity& entity) { entity.SetTag("None"); entity.SetIndex(-1); }
		Entity CreateEntity(std::string name = "Empty Entity") { return _registry.CreateEntity(name); }

		Registry& GetRegistry() { return _registry; }

		static Ref<Scene> Create();
		static Ref<Scene> Copy(Ref<Scene> scene);
		static void Save(const Ref<Scene>& scene, std::string sceneName = "Scene1");
		static Ref<Scene> Load(std::string scenePath);
	private:
		bool _world2D;
		Registry _registry;
		uint32_t _width; 
		uint32_t _height;
	};
}