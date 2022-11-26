#pragma once

#include <array>

#include "Entities/ECS.h"
#include "Entities/Components.h"

#include "Render/VertexArray.h"
#include "Render/Texture.h"
#include "Render/Shader.h"
#include "Render/Camera/EditorCamera.h"

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

		static void SetGridData(int gridSizes[], int gridNumber, float opacity);
		static void DrawGrid(glm::vec3 cameraPosition);
		static void DrawSprite(Transform* transformComponent, Sprite* spriteComponent, int entityIndex);

		// EXPORT TO DEBUG RENDERER
		static void DrawSolidPolygon(Entity& entity);

	public:
		struct Statistics
		{
			uint32_t DrawCalls = 0;
			uint32_t QuadCount = 0;

			uint32_t GetTotalVertexCount() { return QuadCount * 4; }
			uint32_t GetTotalIndexCount()  { return QuadCount * 6; }
		};
		static void ResetStats();
		static Statistics GetStats();

		// Grid data. Must be always float because WebGL dont work with ints
		// Later in the shader we can convert to ints
	};
}
