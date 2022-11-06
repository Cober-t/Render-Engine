#include "pch.h"
#include "Render2D.h"

#include "Render/RenderAPI.h"
#include "Render/RenderGlobals.h"

namespace Cober {

	// [+++++++++++++++++++++++++++]
	// [+++++ PRIMITIVES DATA +++++]
	struct QuadVertex
	{
		glm::vec3 Position;
		glm::vec4 Color;
		glm::vec2 TexCoord;
		float TexIndex;
		float TilingFactor;

		// Editor-only
		int EntityID;
	};

	struct CircleVertex
	{
		glm::vec3 WorldPosition;
		glm::vec3 LocalPosition;
		glm::vec4 Color;
		float Thickness;
		float Fade;

		// Editor-only
		int EntityID;
	};

	struct LineVertex
	{
		glm::vec3 Position;
		glm::vec4 Color;

		// Editor-only
		int EntityID;
	};

	struct RenderData
	{
		static const uint32_t MaxQuads = 20000;
		static const uint32_t MaxVertices = MaxQuads * 4;
		static const uint32_t MaxIndices = MaxQuads * 6;
		static const uint32_t MaxTextureSlots = 32; // TODO: RenderCaps

		Ref<VertexArray> QuadVertexArray;
		Ref<VertexBuffer> QuadVertexBuffer;
		Ref<Shader> QuadShader;
		Ref<Texture> WhiteTexture;

		Ref<VertexArray> CircleVertexArray;
		Ref<VertexBuffer> CircleVertexBuffer;
		Ref<Shader> CircleShader;

		Ref<VertexArray> LineVertexArray;
		Ref<VertexBuffer> LineVertexBuffer;
		Ref<Shader> LineShader;

		uint32_t QuadIndexCount = 0;
		QuadVertex* QuadVertexBufferBase = nullptr;
		QuadVertex* QuadVertexBufferPtr = nullptr;

		uint32_t CircleIndexCount = 0;
		CircleVertex* CircleVertexBufferBase = nullptr;
		CircleVertex* CircleVertexBufferPtr = nullptr;

		uint32_t LineVertexCount = 0;
		LineVertex* LineVertexBufferBase = nullptr;
		LineVertex* LineVertexBufferPtr = nullptr;

		float LineWidth = 2.0f;

		std::array<Ref<Texture>, MaxTextureSlots> TextureSlots;
		uint32_t TextureSlotIndex = 1; // 0 = white texture

		glm::vec4 QuadVertexPositions[4];

		Render2D::Statistics Stats;

		struct CameraData
		{
			glm::mat4 ViewProjection;
		};
		CameraData CameraBuffer;
		Ref<UniformBuffer> CameraUniformBuffer;
	};

	static RenderData data;

	void Render2D::Start() {

		data.QuadVertexArray = VertexArray::Create();

		data.QuadVertexBuffer = VertexBuffer::Create(data.MaxVertices * sizeof(QuadVertex));
		data.QuadVertexBuffer->SetLayout({
			{ ShaderDataType::Float3, "a_Position"     },
			{ ShaderDataType::Float4, "a_Color"        },
			{ ShaderDataType::Float2, "a_TexCoord"     },
			{ ShaderDataType::Float,  "a_TexIndex"     },
			{ ShaderDataType::Float,  "a_TilingFactor" },
			{ ShaderDataType::Int,    "a_EntityID"     }
			});
		data.QuadVertexArray->AddVertexBuffer(data.QuadVertexBuffer);

		data.QuadVertexBufferBase = new QuadVertex[data.MaxVertices];

		uint32_t* quadIndices = new uint32_t[data.MaxIndices];

		uint32_t offset = 0;
		for (uint32_t i = 0; i < data.MaxIndices; i += 6)
		{
			quadIndices[i + 0] = offset + 0;
			quadIndices[i + 1] = offset + 1;
			quadIndices[i + 2] = offset + 2;

			quadIndices[i + 3] = offset + 2;
			quadIndices[i + 4] = offset + 3;
			quadIndices[i + 5] = offset + 0;

			offset += 4;
		}

		Ref<IndexBuffer> quadIB = IndexBuffer::Create(quadIndices, data.MaxIndices);
		data.QuadVertexArray->SetIndexBuffer(quadIB);
		delete[] quadIndices;

		// Circles
		data.CircleVertexArray = VertexArray::Create();

		data.CircleVertexBuffer = VertexBuffer::Create(data.MaxVertices * sizeof(CircleVertex));
		data.CircleVertexBuffer->SetLayout({
			{ ShaderDataType::Float3, "a_WorldPosition" },
			{ ShaderDataType::Float3, "a_LocalPosition" },
			{ ShaderDataType::Float4, "a_Color"         },
			{ ShaderDataType::Float,  "a_Thickness"     },
			{ ShaderDataType::Float,  "a_Fade"          },
			{ ShaderDataType::Int,    "a_EntityID"      }
			});
		data.CircleVertexArray->AddVertexBuffer(data.CircleVertexBuffer);
		data.CircleVertexArray->SetIndexBuffer(quadIB); // Use quad IB
		data.CircleVertexBufferBase = new CircleVertex[data.MaxVertices];

		// Lines
		data.LineVertexArray = VertexArray::Create();

		data.LineVertexBuffer = VertexBuffer::Create(data.MaxVertices * sizeof(LineVertex));
		data.LineVertexBuffer->SetLayout({
			{ ShaderDataType::Float3, "a_Position" },
			{ ShaderDataType::Float4, "a_Color"    },
			{ ShaderDataType::Int,    "a_EntityID" }
			});
		data.LineVertexArray->AddVertexBuffer(data.LineVertexBuffer);
		data.LineVertexBufferBase = new LineVertex[data.MaxVertices];

		data.WhiteTexture = Texture::Create(1, 1);
		uint32_t whiteTextureData = 0xffffffff;
		data.WhiteTexture->SetData(&whiteTextureData, sizeof(uint32_t));

		int32_t samplers[data.MaxTextureSlots];
		for (uint32_t i = 0; i < data.MaxTextureSlots; i++)
			samplers[i] = i;

		data.QuadShader = Shader::Create("Render_Quad.glsl");
		data.CircleShader = Shader::Create("Render_Circle.glsl");
		data.LineShader = Shader::Create("Render_Line.glsl");

		// Set first texture slot to 0
		data.TextureSlots[0] = data.WhiteTexture;

		data.QuadVertexPositions[0] = { -0.5f, -0.5f, 0.0f, 1.0f };
		data.QuadVertexPositions[1] = {  0.5f, -0.5f, 0.0f, 1.0f };
		data.QuadVertexPositions[2] = {  0.5f,  0.5f, 0.0f, 1.0f };
		data.QuadVertexPositions[3] = { -0.5f,  0.5f, 0.0f, 1.0f };

		data.CameraUniformBuffer = UniformBuffer::Create(sizeof(RenderData::CameraData), 0);

	}

	void Render2D::BeginScene(const Ref<EditorCamera>& camera) {

		data.CameraBuffer.ViewProjection = camera->GetProjection() * camera->GetView();
		data.CameraUniformBuffer->SetData(&data.CameraBuffer, sizeof(RenderData::CameraData));

		Render2D::StartBatch();
	}

	void Render2D::Flush() {

		if (data.QuadIndexCount)
		{
			uint32_t dataSize = (uint32_t)((uint8_t*)data.QuadVertexBufferPtr - (uint8_t*)data.QuadVertexBufferBase);
			data.QuadVertexBuffer->SetData(data.QuadVertexBufferBase, dataSize);

			// Bind textures
			for (uint32_t i = 0; i < data.TextureSlotIndex; i++)
				data.TextureSlots[i]->Bind(i);

			data.QuadShader->Bind();
			RenderGlobals::DrawIndexed(data.QuadVertexArray, data.QuadIndexCount);
			data.Stats.DrawCalls++;
		}

		/*if (data.CircleIndexCount)
		{
			uint32_t dataSize = (uint32_t)((uint8_t*)data.CircleVertexBufferPtr - (uint8_t*)data.CircleVertexBufferBase);
			data.CircleVertexBuffer->SetData(data.CircleVertexBufferBase, dataSize);

			data.CircleShader->Bind();
			RenderGlobals::DrawIndexed(data.CircleVertexArray, data.CircleIndexCount);
			data.Stats.DrawCalls++;
		}

		if (data.LineVertexCount)
		{
			uint32_t dataSize = (uint32_t)((uint8_t*)data.LineVertexBufferPtr - (uint8_t*)data.LineVertexBufferBase);
			data.LineVertexBuffer->SetData(data.LineVertexBufferBase, dataSize);

			data.LineShader->Bind();
			RenderGlobals::SetLineWidth(data.LineWidth);
			RenderGlobals::DrawLines(data.LineVertexArray, data.LineVertexCount);
			data.Stats.DrawCalls++;
		}*/
	}

	void Render2D::StartBatch() {

		data.QuadIndexCount = 0;
		data.QuadVertexBufferPtr = data.QuadVertexBufferBase;

		data.CircleIndexCount = 0;
		data.CircleVertexBufferPtr = data.CircleVertexBufferBase;

		data.LineVertexCount = 0;
		data.LineVertexBufferPtr = data.LineVertexBufferBase;

		data.TextureSlotIndex = 1;
	}

	void Render2D::NextBatch() {

		Flush();
		StartBatch();
	}

	void Render2D::ResetStats() {
		memset(&data.Stats, 0, sizeof(Statistics));
	}

	Render2D::Statistics Render2D::GetStats() {
		return data.Stats;
	}

	void Render2D::EndScene() {

		Flush();
	}

	void Render2D::Shutdown() {

		delete[] data.QuadVertexBufferBase;
	}

	void Render2D::DrawSprite(Transform* transformComponent, Sprite* spriteComponent)
	{
		glm::mat4 transform = glm::translate(glm::mat4(1.0f), transformComponent->position) *
			glm::toMat4(glm::quat(transformComponent->rotation)) *
			glm::scale(glm::mat4(1.0f), { transformComponent->scale.x, transformComponent->scale.y, 1.0f });

		size_t quadVertexCount = 4;
		glm::vec2 textureCoords[] = { { 0.0f, 0.0f }, { 1.0f, 0.0f }, { 1.0f, 1.0f }, { 0.0f, 1.0f } };
		float textureIndex = 0.0f;
		float tilingFactor = 1.0f;

		if (data.QuadIndexCount >= RenderData::MaxIndices)
			Render2D::NextBatch();

		if (spriteComponent->texture) {

			for (uint32_t i = 1; i < data.TextureSlotIndex; i++) {
				if (*data.TextureSlots[i] == *spriteComponent->texture) {
					textureIndex = (float)i;
					break;
				}
			}

			if (textureIndex == 0.0f) {
				if (data.TextureSlotIndex >= RenderData::MaxTextureSlots)
					Render2D::NextBatch();

				textureIndex = (float)data.TextureSlotIndex;
				data.TextureSlots[data.TextureSlotIndex] = spriteComponent->texture;
				data.TextureSlotIndex++;
			}
		}

		for (size_t i = 0; i < quadVertexCount; i++)
		{
			data.QuadVertexBufferPtr->Position = transform * data.QuadVertexPositions[i];
			data.QuadVertexBufferPtr->Color = spriteComponent->color;
			data.QuadVertexBufferPtr->TexCoord = textureCoords[i];
			data.QuadVertexBufferPtr->TexIndex = textureIndex;
			data.QuadVertexBufferPtr->TilingFactor = tilingFactor;
			data.QuadVertexBufferPtr->EntityID = 1;//entityID;
			data.QuadVertexBufferPtr++;
		}

		data.QuadIndexCount += 6;
		data.Stats.QuadCount++;
	}

	void Render2D::DrawSolidPolygon(Entity& entity) {

		if (entity.HasComponent<BoxCollider2D>()) {

			auto& bc2d = entity.GetComponent<BoxCollider2D>();
			auto& enttTrans = entity.GetComponent<Transform>();

			glm::vec3 position{ enttTrans.position.x + bc2d.offset.x, enttTrans.position.y + bc2d.offset.y, enttTrans.position.z };
			glm::vec3 scale{ (bc2d.size.x + enttTrans.scale.x), (bc2d.size.y + enttTrans.scale.y), 1.0f };

			glm::mat4 transform = glm::translate(glm::mat4(1.0f), position)
				* glm::toMat4(glm::quat(enttTrans.rotation))
				* glm::scale(glm::mat4(1.0f), scale);

			size_t quadVertexCount = 4;
			float textureIndex = 0.0f; // White Texture
			glm::vec2 textureCoords[] = { { 0.0f, 0.0f }, { 1.0f, 0.0f }, { 1.0f, 1.0f }, { 0.0f, 1.0f } };
			float tilingFactor = 1.0f;

			if (data.QuadIndexCount >= data.MaxIndices)
				Render2D::NextBatch();

			glm::vec3 color = glm::vec3(1, 0, 0);	// Change color in settings
			for (size_t i = 0; i < quadVertexCount; i++)
			{
				data.QuadVertexBufferPtr->Position = transform * data.QuadVertexPositions[i];
				data.QuadVertexBufferPtr->Color = glm::vec4(color, 1);
				data.QuadVertexBufferPtr->TexCoord = glm::vec2((float)bc2d.shape.m_vertices->x, (float)bc2d.shape.m_vertices->y);
				data.QuadVertexBufferPtr->TexIndex = textureIndex;
				data.QuadVertexBufferPtr->TilingFactor = tilingFactor;
				data.QuadVertexBufferPtr->EntityID = 1;// entityID;
				data.QuadVertexBufferPtr++;
			}

			data.QuadIndexCount += 6;
			data.Stats.QuadCount++;
		}
	}
}