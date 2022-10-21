#include "pch.h"

#include "RenderSystem.h"

#include "core/Logger.h"

#include "Render/VertexArray.h"
#include "Render/Shader.h"

#include "Render/RenderGlobals.h"

#include <glm/gtc/type_ptr.hpp>
#include <glm/gtc/matrix_transform.hpp>

namespace Cober {

	struct QuadVertex
	{
		glm::vec3 Position;
		glm::vec4 Color;
		glm::vec2 TexCoord;
		float TexIndex;
	};

	struct RendererData
	{
		static const uint32_t MaxQuads = 20000;
		static const uint32_t MaxVertices = MaxQuads * 4;
		static const uint32_t MaxIndices = MaxQuads * 6;
		static const uint32_t MaxTextureSlots = 32; // TODO: RenderCaps

		Ref<VertexArray> QuadVertexArray;
		Ref<VertexBuffer> QuadVertexBuffer;
		Ref<Shader> TextureShader;
		Ref<Texture> WhiteTexture;

		uint32_t QuadIndexCount = 0;
		QuadVertex* QuadVertexBufferBase = nullptr;
		QuadVertex* QuadVertexBufferPtr = nullptr;

		std::array<Ref<Texture>, MaxTextureSlots> TextureSlots;
		uint32_t TextureSlotIndex = 1; // 0 = white texture

		glm::vec4 QuadVertexPositions[4];

		RenderSystem::Statistics Stats;
	};

	static RendererData data;

	RenderSystem::RenderSystem() {

		RequireComponent<Transform>();
		RequireComponent<Sprite>();

		if(Engine::Get().GetGameState() == GameState::PLAY)
			//RequireComponent<CameraSystem>();

		Logger::Log("Render SYSTEM Added!!");
	}

	RenderSystem::~RenderSystem() {

		Logger::Log("Render System removed from Registry");
	}

	void RenderSystem::Start(const Ref<Scene>& scene) {

		_registry = scene->GetRegistry();

		data.QuadVertexArray = VertexArray::Create();

		data.QuadVertexBuffer = VertexBuffer::Create(data.MaxVertices * sizeof(QuadVertex));
		data.QuadVertexBuffer->SetLayout({
			{ ShaderDataType::Float3, "a_Position" },
			{ ShaderDataType::Float4, "a_Color" },
			{ ShaderDataType::Float2, "a_TexCoord" },
			{ ShaderDataType::Float,  "a_TexIndex" },
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

		data.WhiteTexture = Texture::Create(1, 1);
		uint32_t whiteTextureData = 0xffffffff;
		data.WhiteTexture->SetData(&whiteTextureData, sizeof(uint32_t));

		int32_t samplers[data.MaxTextureSlots];
		for (uint32_t i = 0; i < data.MaxTextureSlots; i++)
			samplers[i] = i;

		data.TextureShader = Shader::Create("texture.glsl");
		data.TextureShader->Bind();
		data.TextureShader->SetIntArray("u_Textures", samplers, data.MaxTextureSlots);

		// Set all texture slots to 0
		data.TextureSlots[0] = data.WhiteTexture;

		data.QuadVertexPositions[0] = { -0.5f, -0.5f, 0.0f, 1.0f };
		data.QuadVertexPositions[1] = {  0.5f, -0.5f, 0.0f, 1.0f };
		data.QuadVertexPositions[2] = {  0.5f,  0.5f, 0.0f, 1.0f };
		data.QuadVertexPositions[3] = { -0.5f,  0.5f, 0.0f, 1.0f };
	}

	void RenderSystem::Update(const Ref<EditorCamera>& camera) 
	{
		RenderGlobals::SetClearColor(4, 0, 8, 255);
		RenderGlobals::Clear();
		//RenderGlobals::SetClearColor(camera->GetSkyboxColor());
		// or just
		// camera->RenderSkybox();

		std::set<Entity> entities = _registry->GetAllEntities();
		//for (auto entity : GetSystemEntities())
		for (auto entity : entities) {

			if(entity.HasComponent<Sprite>()) {
				BeginScene(camera);

				Sprite sprite = entity.GetComponent<Sprite>();
				Transform transform= entity.GetComponent<Transform>();
				DrawQuad(transform, sprite);

				// SUBMIT
				data.TextureShader->Bind();
				data.TextureShader->SetMat4("u_ViewProjection", camera->GetView() * camera->GetProjection());
				//data.TextureShader->SetMat4("u_Transform", transform);

				data.QuadVertexArray->Bind();
				RenderGlobals::DrawIndexed(data.QuadVertexArray);
				// END SUBMIT

				EndScene();
			}
		}
	}

	void RenderSystem::BeginScene(const Ref<EditorCamera>& camera) {
	
		data.TextureShader->Bind();
		data.TextureShader->SetMat4("u_ViewProjection", camera->GetView() * camera->GetProjection());

		data.QuadIndexCount = 0;
		data.QuadVertexBufferPtr = data.QuadVertexBufferBase;

		data.TextureSlotIndex = 0;
	}

	void RenderSystem::DrawQuad(Transform& transformComponent, Sprite& spriteComponent)
	{

		/*if (data.QuadIndexCount >= RendererData::MaxIndices)
			FlushAndReset();*/

		constexpr glm::vec4 color = { 1.0f, 1.0f, 1.0f, 1.0f };

		float textureIndex = 0.0f;
		/*
		for (uint32_t i = 1; i < data.TextureSlotIndex; i++)
		{
			if (*data.TextureSlots[i].get() == *spriteComponent.texture.get())
			{
				textureIndex = (float)i;
				break;
			}
		}

		if (textureIndex == 0.0f)
		{
			textureIndex = (float)data.TextureSlotIndex;
			data.TextureSlots[data.TextureSlotIndex] = spriteComponent.texture;
			data.TextureSlotIndex++;
		}*/

		glm::mat4 transform = glm::translate(glm::mat4(1.0f), transformComponent.position)
			* glm::scale(glm::mat4(1.0f), { transformComponent.scale.x, transformComponent.scale.y, 1.0f });

		data.QuadVertexBufferPtr->Position = transform * data.QuadVertexPositions[0];
		data.QuadVertexBufferPtr->Color = color;
		data.QuadVertexBufferPtr->TexCoord = { 0.0f, 0.0f };
		data.QuadVertexBufferPtr->TexIndex = textureIndex;
		data.QuadVertexBufferPtr++;

		data.QuadVertexBufferPtr->Position = transform * data.QuadVertexPositions[1];
		data.QuadVertexBufferPtr->Color = color;
		data.QuadVertexBufferPtr->TexCoord = { 1.0f, 0.0f };
		data.QuadVertexBufferPtr->TexIndex = textureIndex;
		data.QuadVertexBufferPtr++;

		data.QuadVertexBufferPtr->Position = transform * data.QuadVertexPositions[2];
		data.QuadVertexBufferPtr->Color = color;
		data.QuadVertexBufferPtr->TexCoord = { 1.0f, 1.0f };
		data.QuadVertexBufferPtr->TexIndex = textureIndex;
		data.QuadVertexBufferPtr++;

		data.QuadVertexBufferPtr->Position = transform * data.QuadVertexPositions[3];
		data.QuadVertexBufferPtr->Color = color;
		data.QuadVertexBufferPtr->TexCoord = { 0.0f, 1.0f };
		data.QuadVertexBufferPtr->TexIndex = textureIndex;
		data.QuadVertexBufferPtr++;

		data.QuadIndexCount += 6;

		data.Stats.QuadCount++;
	}

	void RenderSystem::Submit(const Ref<Shader>& shader, const Ref<VertexArray>& vertexArray, const glm::mat4& transform)
	{
		/*shader->Bind();
		shader->SetMat4("u_ViewProjection", s_SceneData->ViewProjectionMatrix);
		shader->SetMat4("u_Transform", transform);

		vertexArray->Bind();
		RenderGlobals::DrawIndexed(vertexArray);*/
	}


	// [+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++]
	// [+++++++++++++++++++++ BATCH SYSTEM ++++++++++++++++++++++++]
	// [+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++]
	void RenderSystem::EndScene()
	{
	/*	uint32_t dataSize = (uint8_t*)data.QuadVertexBufferPtr - (uint8_t*)data.QuadVertexBufferBase;
		data.QuadVertexBuffer->SetData(data.QuadVertexBufferBase, dataSize);*/

		//Flush();
	}

	void RenderSystem::Flush()
	{
		// Bind textures
		for (uint32_t i = 0; i < data.TextureSlotIndex; i++)
			data.TextureSlots[i]->Bind(i);

		RenderGlobals::DrawIndexed(data.QuadVertexArray, data.QuadIndexCount);
		data.Stats.DrawCalls++;
	}

	void RenderSystem::FlushAndReset()
	{
		//EndScene();

		data.QuadIndexCount = 0;
		data.QuadVertexBufferPtr = data.QuadVertexBufferBase;

		data.TextureSlotIndex = 1;
	}
}