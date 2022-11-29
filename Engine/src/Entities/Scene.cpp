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

	template<typename TComponent>
	static void CopyComponent(std::map<int, Entity>& dst, std::map<int, Entity>& src)
	{
		for (auto& e : dst)
		{
			int id = e.second.GetIndex();
			if (!dst.at(id).HasComponent<TComponent>() && src.at(id).HasComponent<TComponent>())
			{
				TComponent& componentData = src.at(id).GetComponent<TComponent>();
				dst.at(id).AddComponent<TComponent>(componentData);
			}
		}
	}

	Ref<Scene> Scene::Copy(Ref<Scene> baseScene) {

		Ref<Scene> newScene = CreateRef<Scene>();
		newScene->_width = baseScene->GetWidth();
		newScene->_height = baseScene->GetHeight();

		if (baseScene->GetSceneEntities().size() > 0) {
			// Create entities in new scene
			for (auto& e : baseScene->GetSceneEntities()) {
				int id = e.first;
				const auto& name = e.second.GetComponent<Tag>().tag;
				newScene->CreateEntity(name);

				// Copy Transform Component Data
				auto& srcTransform = baseScene->GetSceneEntities().at(id).GetComponent<Transform>();
				auto& dstTransform = newScene->GetSceneEntities().at(id).GetComponent<Transform>();
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
			// ...
			// Script Component, Camera component, Movement script component ...
			// ...
		}

		return newScene;
	}

	void Scene::Save(const Ref<Scene>& scene, std::string sceneName) {

		Utils::DataFile sceneSaver;
		std::string name;
		if (sceneName.find_last_of('.') != std::string::npos)
			name = sceneName.substr(0, sceneName.find_last_of('.'));
		else
			name = sceneName;

		sceneSaver[name]["world2D"].SetInt(scene->_world2D);
		sceneSaver[name]["width"].SetInt(scene->_width);
		sceneSaver[name]["height"].SetInt(scene->_height);
		sceneSaver[name]["numEntities"].SetInt(scene->GetSceneEntities().size());

		for (auto& entity : scene->GetSceneEntities()) {

			auto& entityToBeSaved = sceneSaver[name]["Entity" + std::to_string(entity.first)];

			entityToBeSaved["tag"].SetString(entity.second.GetTag());
			entityToBeSaved["index"].SetInt(entity.first);

			entityToBeSaved["Tag"]["tag"].SetString(entity.second.GetComponent<Tag>().tag);
			
			auto& transform = entity.second.GetComponent<Transform>();
			entityToBeSaved["Transform"]["position"].SetVec3(transform.position);
			entityToBeSaved["Transform"]["rotation"].SetVec3(transform.rotation);
			entityToBeSaved["Transform"]["scale"].SetVec3(transform.scale);

			if (entity.second.HasComponent<Sprite>()) {
				auto& sprite = entity.second.GetComponent<Sprite>();
				entityToBeSaved["Sprite"]["color"].SetVec4(sprite.color);
				if(sprite.texture)
					entityToBeSaved["Sprite"]["texture"].SetString(sprite.texture->GetPath());
			}

			if (entity.second.HasComponent<Rigidbody2D>()) {
				auto& rb2d = entity.second.GetComponent<Rigidbody2D>();
				entityToBeSaved["Rigidbody2D"]["bodyType"].SetInt((int)rb2d.type);
				entityToBeSaved["Rigidbody2D"]["fixedRotation"].SetInt(rb2d.fixedRotation);
			}

			if (entity.second.HasComponent<BoxCollider2D>()) {
				auto& bc2D = entity.second.GetComponent<BoxCollider2D>();
				entityToBeSaved["BoxCollider2D"]["offset"].SetVec2(bc2D.offset);
				entityToBeSaved["BoxCollider2D"]["size"].SetVec2(bc2D.size);
				entityToBeSaved["BoxCollider2D"]["density"].SetReal(bc2D.density);
				entityToBeSaved["BoxCollider2D"]["friction"].SetReal(bc2D.friction);
				entityToBeSaved["BoxCollider2D"]["restitution"].SetReal(bc2D.restitution);
				entityToBeSaved["BoxCollider2D"]["restitution Threshold"].SetReal(bc2D.restitutionThreshold);
			}
			//...
		}
		
		Utils::DataFile::Write(sceneSaver, sceneName);
	}

	Ref<Scene> Scene::Load(std::string sceneName) {

		Utils::DataFile sceneLoader;
		std::string name;
		if (sceneName.find_last_of('.') != std::string::npos)
			name = sceneName.substr(0, sceneName.find_last_of('.'));
		else
			name = sceneName;

		if (Utils::DataFile::Read(sceneLoader, sceneName)) {

			Ref<Scene> newScene = Scene::Create();
			Registry& newRegistry = newScene->GetRegistry();
			newScene->_world2D = sceneLoader[name]["world2D"].GetInt();
			newScene->_width = sceneLoader[name]["width"].GetInt();
			newScene->_height = sceneLoader[name]["height"].GetInt();

			for (int i = 0; i < sceneLoader[name]["numEntities"].GetInt(); i++) {

				if (sceneLoader[name].HasProperty("Entity" + std::to_string(i))) {
					auto& loader = sceneLoader[name]["Entity" + std::to_string(i)];
					Entity newEntity = newRegistry.CreateEntity("Entity" + std::to_string(i));

					newEntity.GetComponent<Tag>().tag = loader["Tag"]["tag"].GetString();

					newEntity.GetComponent<Transform>().position = loader["Transform"]["position"].GetVec3();
					newEntity.GetComponent<Transform>().rotation = loader["Transform"]["rotation"].GetVec3();
					newEntity.GetComponent<Transform>().scale = loader["Transform"]["scale"].GetVec3();

					if (loader.HasProperty("Sprite")) {
						auto sprite = loader["Sprite"];
						newEntity.AddComponent<Sprite>();
						newEntity.GetComponent<Sprite>().color = sprite["color"].GetVec4();

						if (sprite.HasProperty("texture"))
							newEntity.GetComponent<Sprite>().texture = Texture::Create(sprite["texture"].GetString());
					}

					if (loader.HasProperty("Rigidbody2D")) {
						auto rb2d = loader["Rigibody2D"];
						newEntity.AddComponent<Rigidbody2D>();
						newEntity.GetComponent<Rigidbody2D>().type = (BodyType)rb2d["bodyType"].GetInt();
						newEntity.GetComponent<Rigidbody2D>().fixedRotation = rb2d["fixedRotation"].GetInt();
					}

					if (loader.HasProperty("BoxCollider2D")) {
						auto bc2d = loader["BoxCollider2D"];
						newEntity.AddComponent<BoxCollider2D>();
						newEntity.GetComponent<BoxCollider2D>().offset = bc2d["offset"].GetVec2();
						newEntity.GetComponent<BoxCollider2D>().size = bc2d["size"].GetVec2();
						newEntity.GetComponent<BoxCollider2D>().density = bc2d["density"].GetReal();
						newEntity.GetComponent<BoxCollider2D>().friction = bc2d["friction"].GetReal();
						newEntity.GetComponent<BoxCollider2D>().restitution = bc2d["restitution"].GetReal();
						newEntity.GetComponent<BoxCollider2D>().restitutionThreshold = bc2d["restitution threshold"].GetReal();
					}
				}
				else
					Logger::Warning("Loading scene does not have entity with id: " + std::to_string(i));
			}

			return newScene;
		}
		else {
			Logger::Error("Cannot read scene with path: " + (SOLUTION_DIR + (std::string)"assets\\scenes\\" + sceneName));
			return nullptr;
		}
	}

	void Scene::GetEntity(int index, Entity& hoveredEntity) {

		for (auto& entity : GetSceneEntities()) {
			if (entity.second.GetIndex() == index) {
				hoveredEntity = entity.second;
				return;
			}
		}
		Logger::Warning("There is no Entity with ID: " + std::to_string(index));
		SetDefaultEntity(hoveredEntity);
	}

	void Scene::OnRuntimeStart(const Ref<Scene>& scene) {

		_registry.Update();

		_registry.GetSystem<PhysicsSystem>().Start();
		_registry.GetSystem<RenderSystem>().Start();
		//_registry->GetSystem<UISystem>().Start(Engine::Get().GetWindow().GetNativeWindow());
		//_registry->GetSystem<MovementSystem>().Start(scene);


		// TEST SERIALIZATION
		//Entity newEntity = scene->CreateEntity();
		//newEntity.AddComponent<Sprite>();
		//newEntity.GetComponent<Sprite>().color = glm::vec4(1.0f, 0.0f, 0.0f, 1.0f);
		//newEntity.AddComponent<Rigidbody2D>();
		//newEntity.AddComponent<BoxCollider2D>();
		//Scene::Save(scene, "Scene1.txt");
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
