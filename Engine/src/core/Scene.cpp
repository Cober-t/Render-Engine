#include "pch.h"

#include "Scene.h"
#include "Systems/RenderSystem.h"
#include "Systems/MovementSystem.h"
#include "Systems/PhysicsSystem.h"
#include "Systems/UISystem.h"

#include "Render/RenderGlobals.h"

namespace Cober {

	Scene::Scene() : _world2D(false), _width(1280), _height(720){

		_registry.AddSystem<PhysicsSystem>();
		_registry.AddSystem<RenderSystem>();

		// [+++++ TODO
		//_registry->AddSystem<CameraSystem>();				// CAMERA SYSTEM		*(something like Cinemachine in Unity)
		//_registry->AddSystem<ScriptingSystem>();			// SCRIPTING			*(With Lua & Sol wrapper)
		//_registry->AddSystem<Animation2DSystem>();	    // ANIMATION 2D SYSTEM	*(Interpolation, )
		//_registry->AddSystem<MaterialSystem>();			// MATERIAL SYSTEM
		//_registry->AddSystem<InputSystem>();				// INPUTS MANAGER		*(For an easy cutomization of inputs)
		//_registry->AddSystem<TerrainGeneratorSystem>();	// TERRAIN GENERATOR	*(perlin noise, wave function collapse...)
		//_registry->AddSystem<ParticleSystem>();			// PARTICLE SYSTEM		*(see Unity options)
		//_registry->AddSystem<AISystem>();					// AI SYSTEM			*(dijkstra pathfinding, A* star ...)
		//_registry->AddSystem<DialogueSystem>();			// DIALOGUE SYSTEM		*(excel wrinting with aware of entities and conditions)
	}

	Scene::~Scene()
	{
		LOG("Scene finished, removing systems from registry...");
		_registry.RemoveSystem<PhysicsSystem>();
		_registry.RemoveSystem<RenderSystem>();
		//_registry->RemoveSystem<UISystem>();
	}

	Ref<Scene> Scene::Create() {

		return CreateRef<Scene>();
	}

	void Scene::GetEntity(int index, Entity& hoveredEntity) {

		for (auto& entity : GetSceneEntities()) {
			if (entity.second.GetIndex()  == index) {
				hoveredEntity = entity.second;
				return;
			}
		}
		//Logger::Warning("There is no Entity with ID: " + std::to_string(index));
		SetDefaultEntity(hoveredEntity);
	}

	template<typename TComponent>
	static void CopyComponent(std::unordered_map<UUID, Entity>& dst, std::unordered_map<UUID, Entity>& src)
	{
		for (auto& e : dst)
		{
			UUID uuid = e.second.GetComponent<IDComponent>().ID;
			if (!dst.at(uuid).HasComponent<TComponent>() && src.at(uuid).HasComponent<TComponent>())
			{
				TComponent& componentData = src.at(uuid).GetComponent<TComponent>();
				dst.at(uuid).AddComponent<TComponent>(componentData);
			}
		}
	}

	Ref<Scene> Scene::Copy(Ref<Scene> baseScene) {

		Ref<Scene> newScene = CreateRef<Scene>();
		newScene->SetWidth(baseScene->GetWidth());
		newScene->SetHeight(baseScene->GetHeight());

		if (baseScene->GetSceneEntities().size() > 0) {
			// Create entities in new scene
			for (auto& e : baseScene->GetSceneEntities()) {
				UUID uuid = e.first;
				const auto& name = e.second.GetComponent<Tag>().tag;
				newScene->CreateEntity(name, uuid);

				// Copy Transform Component Data
				auto& srcTransform = baseScene->GetSceneEntities().at(uuid).GetComponent<Transform>();
				auto& dstTransform = newScene->GetSceneEntities().at(uuid).GetComponent<Transform>();
				dstTransform.position = srcTransform.position;
				dstTransform.rotation = srcTransform.rotation;
				dstTransform.scale = srcTransform.scale;
			}

			auto& srcEntities = baseScene->GetSceneEntities();
			auto& dstEntities = newScene->GetSceneEntities();

			// Copy components (except IDComponent and TagComponent)
			CopyComponent<Sprite>(dstEntities, srcEntities);
			CopyComponent<Rigidbody2D>(dstEntities, srcEntities);
			CopyComponent<BoxCollider2D>(dstEntities, srcEntities);
			// Script Component, Camera component, Movement script component ...
		}

		return newScene;
	}

	void Scene::OnRuntimeStart(const Ref<Scene>& scene) {

		_registry.Update();

		_registry.GetSystem<PhysicsSystem>().Start();
		_registry.GetSystem<RenderSystem>().Start();
		//_registry->GetSystem<UISystem>().Start(Engine::Get().GetWindow().GetNativeWindow());
		//_registry->GetSystem<MovementSystem>().Start(scene);
	}

	void Scene::OnRuntimeStop() 
	{

	}
	void Scene::OnViewportResize(uint32_t width, uint32_t height)
	{
		_width = width;
		_height = height;

		//// Resize our non-FixedAspectRatio cameras
		//auto view = m_Registry.view<CameraComponent>();
		//for (auto entity : view) {
		//	auto& cameraComponent = view.get<CameraComponent>(entity);
		//	if (!cameraComponent.FixedAspectRatio)
		//		cameraComponent.Camera.SetViewportSize(width, height);
		//}
		RenderGlobals::SetViewport(0, 0, width, height);
	}


	void Scene::OnUpdateRuntime(Ref<Timestep> ts, Ref<EditorCamera> camera) {
		
		_registry.Update();

		_registry.GetSystem<PhysicsSystem>().Update(ts->deltaTime);
		_registry.GetSystem<RenderSystem>().Update(camera);	// Get Camera components from entities
		//_registry->GetSystem<UISystem>().Update();
	}

	void Scene::OnUpdateEditor(Ref<Timestep> ts, Ref<EditorCamera> editorCamera) {

		_registry.Update();

		_registry.GetSystem<RenderSystem>().Update(editorCamera);
		//_registry->GetSystem<UISystem>().Update();
	}
}
