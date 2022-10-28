#pragma once

#include "Entities/ECS.h"
#include "Entities/Components.h"

//#include "core/AssetManager.h"
#include "core/Scene.h"
#include "core/Core.h"

#include "Systems/DebugSystem.h"
#include "Systems/PhysicsSystem.h"

#include "Render/Camera/EditorCamera.h"
#include "Render/VertexArray.h"
#include "Render/Texture.h"
#include "Render/Shader.h"

namespace Cober {

	class RenderSystem : public System {
	public:
		RenderSystem();
		~RenderSystem();
		
		// [+++++++++++++++++++++++++++]
		// [+++++++++ RENDER ++++++++++]
		// [+++++++++++++++++++++++++++]
		void Start(const Ref<Scene>& _sceneContext, DebugSystem* debug, b2World* pWorld);
		void Update(const Ref<EditorCamera>& camera);
		//void Update(const Ref<CameraComponent>& camera);

		void BeginScene(const Ref<EditorCamera>& camera);

		void Shutdown();

		// [+++++++++++++++++++++++++++]
		// [++++++++++ BATCH ++++++++++]
		// [+++++++++++++++++++++++++++]
		void EndScene();
		void Flush();

		// [+++++++++++++++++++++++++++]
		// [++++++++++ DEBUG ++++++++++]
		// [+++++++++++++++++++++++++++]
		void SetupDebug();

		void DebugDrawSolidPoligon( Entity& entity, b2Color color = b2Color(1, 0, 0));
		//void DebugDrawPolygon(		Entity& entity, b2Color color = b2Color(1, 0, 0));
		//void DebugDrawCircle(		Entity& entity, b2Color color = b2Color(1, 0, 0));
		//void DebugDrawSolidCircle(	Entity& entity, b2Color color = b2Color(1, 0, 0));
		//void DebugDrawPoint(		Entity& entity, b2Color color = b2Color(1, 0, 0));
		//void DebugDrawSegment(		Entity& entity, b2Color color = b2Color(1, 0, 0));
		//void DebugDrawTransform(	Entity& entity, b2Color color = b2Color(1, 0, 0));
		//void DebugDrawString(		Entity& entity, b2Color color = b2Color(1, 0, 0));
		//void DebugDrawAABB(			Entity& entity, b2Color color = b2Color(1, 0, 0));

		
		// [+++++++++++++++++++++++++++]
		// [+++++++ PRIMITIVES ++++++++]
		// [+++++++++++++++++++++++++++]
		void DrawQuad(Transform* transformComponent, Sprite* spriteComponent);
		//void DrawQuad(Transform& transformComponent, Sprite& spriteComponent, Material shader);

	public:
		// Stats
		struct Statistics
		{
			uint32_t DrawCalls = 0;
			uint32_t QuadCount = 0;

			uint32_t GetTotalVertexCount() { return QuadCount * 4; }
			uint32_t GetTotalIndexCount()  { return QuadCount * 6; }
		};
		void ResetStats();
		Statistics GetStats();

	private:
		/*struct SceneData {
			glm::mat4 ViewProjectionMatrix;
		};
		static Unique<SceneData> _sceneData;*/
		Ref<Registry> _registry;
		DebugSystem* debugSystem;
		b2World* physicsWorld;
	};
}
