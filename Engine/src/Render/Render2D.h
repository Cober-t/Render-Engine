#pragma once

#include <array>

#include "Entities/ECS.h"
#include "Entities/Components.h"

#include "Render/VertexArray.h"
#include "Render/Texture.h"
#include "Render/Shader.h"
#include "Render/Camera/EditorCamera.h"

#include "core/Scene.h"

#include <glm/gtc/matrix_transform.hpp>

#define GLM_ENABLE_EXPERIMENTAL
#include <glm/gtx/quaternion.hpp>

namespace Cober {

	class Render2D {
	public:
		static void Start();

		static void BeginScene(const Ref<EditorCamera>& camera);
		static void EndScene();

		static void Shutdown();

		// [++++++ BATCH +++++++]
		static void Flush();
		static void StartBatch();
		static void NextBatch();

		static void DrawSprite(Transform* transformComponent, Sprite* spriteComponent);

		// EXPORT TO DEBUG RENDERER
		static void DrawSolidPolygon(Entity& entity);

	public:
		static struct Statistics
		{
			uint32_t DrawCalls = 0;
			uint32_t QuadCount = 0;

			uint32_t GetTotalVertexCount() { return QuadCount * 4; }
			uint32_t GetTotalIndexCount() { return QuadCount * 6; }
		};
		static void ResetStats();
		static Statistics GetStats();
	};
}
