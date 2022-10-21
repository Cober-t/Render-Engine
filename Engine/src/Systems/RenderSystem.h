#pragma once

#include "Entities/ECS.h"
#include "Entities/Components.h"

//#include "core/AssetManager.h"
#include "core/Scene.h"
#include "core/Core.h"

#include "Render/Camera/EditorCamera.h"
#include "Render/VertexArray.h"
#include "Render/Texture.h"
#include "Render/Shader.h"

namespace Cober {

	class RenderSystem : public System {
	public:
		RenderSystem();
		~RenderSystem();
		
		void Start(const Ref<Scene>& _sceneContext);
		void Update(const Ref<EditorCamera>& camera);
		//void Update(const Ref<CameraComponent>& camera);

		void Shutdown();

		void BeginScene(const Ref<EditorCamera>& camera);
		void EndScene();
		void Flush();

		// Primitives
		void DrawQuad(Transform& transformComponent, Sprite& spriteComponent);
		//void DrawQuad(Transform& transformComponent, Sprite& spriteComponent, Material shader);

		void Submit(const Ref<Shader>& shader, const Ref<VertexArray>& vertexArray, const glm::mat4& transform);
		// Stats
		struct Statistics
		{
			uint32_t DrawCalls = 0;
			uint32_t QuadCount = 0;

			uint32_t GetTotalVertexCount() { return QuadCount * 4; }
			uint32_t GetTotalIndexCount() { return QuadCount * 6; }
		};
		void ResetStats();
		Statistics GetStats();
	private:
		Ref<Registry> _registry;
	private:
		//struct SceneData {
		//	glm::mat4 ViewProjectionMatrix;
		//};
		//static Unique<SceneData> _sceneData;
		void FlushAndReset();
	};
}
