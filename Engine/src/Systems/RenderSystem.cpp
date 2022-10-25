#include "pch.h"

#include "RenderSystem.h"

#include "core/Logger.h"

#include "Render/VertexArray.h"
#include "Render/Shader.h"
#include "Render/RenderGlobals.h"


#include <glm/gtc/matrix_transform.hpp>

namespace Cober {

	struct RendererData
	{
		Ref<VertexArray> QuadVertexArray;
		Ref<Shader> TextureShader;
		Ref<Texture> WhiteTexture;
	};

	static RendererData* data;

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

	void RenderSystem::Start(const Ref<Scene>& scene) 
	{
		RenderGlobals::Init();

		_registry = scene->GetRegistry();

		data = new RendererData();
		data->QuadVertexArray = VertexArray::Create();

		float squareVertices[5 * 4] = {
				-0.5f, -0.5f, 0.0f, 0.0f, 0.0f,
				 0.5f, -0.5f, 0.0f, 1.0f, 0.0f,
				 0.5f,  0.5f, 0.0f, 1.0f, 1.0f,
				-0.5f,  0.5f, 0.0f, 0.0f, 1.0f
		};

		// [+++++++++++ VERTEX BUFFER +++++++++++++]
		Ref<VertexBuffer> squareVB;
		squareVB.reset(VertexBuffer::Create(squareVertices, sizeof(squareVertices)));
		squareVB->SetLayout({
			{ ShaderDataType::Float3, "a_Position" },
			{ ShaderDataType::Float2, "a_TexCoord" }
			});
		data->QuadVertexArray->AddVertexBuffer(squareVB);

		// [+++++++++++ INDEX BUFFER ++++++++++++++]
		uint32_t squareIndices[6] = { 0, 1, 2, 2, 3, 0 };
		Ref<IndexBuffer> squareIB;
		squareIB.reset(IndexBuffer::Create(squareIndices, sizeof(squareIndices) / sizeof(uint32_t)));
		data->QuadVertexArray->SetIndexBuffer(squareIB);

		data->WhiteTexture = Texture::Create(1, 1);
		uint32_t whiteTextureData = 0xffffffff;
		data->WhiteTexture->SetData(&whiteTextureData, sizeof(uint32_t));

		data->TextureShader = Shader::Create("texture.glsl");
		data->TextureShader->Bind();
		data->TextureShader->SetInt("u_Texture", 0); 
	}

	void RenderSystem::BeginScene(const Ref<EditorCamera>& camera) {

		data->TextureShader->Bind();
		data->TextureShader->SetMat4("u_ViewProjection", camera->GetProjection() * camera->GetView());
	}

	void RenderSystem::Update(const Ref<EditorCamera>& camera) 
	{
		RenderGlobals::SetClearColor(10, 0, 10, 255);
		RenderGlobals::Clear();

		// RenderGlobals::SetClearColor(camera->GetSkyboxColor());
		//	or just
		// camera->RenderSkybox();

		std::set<Entity> entities = _registry->GetAllEntities();
		for (auto entity : entities) {
		//for (auto entity : GetSystemEntities()) {

			if(entity.HasComponent<Sprite>()) {

				BeginScene(camera);
				std::cout << camera->GetDistance() << std::endl;
					
				Sprite sprite = entity.GetComponent<Sprite>();
				//sprite.texture = data->WhiteTexture;
				Transform transform= entity.GetComponent<Transform>();

				//DrawQuad(&transform, &sprite);

				data->TextureShader->SetFloat4("u_Color", sprite.color);
				data->WhiteTexture->Bind();

				glm::mat4 trans = glm::translate(glm::mat4(1.0f), transform.position) * glm::scale(glm::mat4(1.0f), { transform.scale.x, transform.scale.y, 1.0f });
				data->TextureShader->SetMat4("u_Transform", trans);
				data->QuadVertexArray->Bind();
				RenderGlobals::DrawIndexed(data->QuadVertexArray);


				// Begin Submit
				//glm::mat4 trans = glm::translate(glm::mat4(1.0f), transform.position) * glm::scale(glm::mat4(1.0f), { transform.scale.x, transform.scale.y, 1.0f });
				//data->TextureShader->Bind();
				//data->TextureShader->SetMat4("u_ViewProjection", camera->GetView() * camera->GetProjection());
				//data->TextureShader->SetMat4("u_Transform", trans);
				//
				//data->QuadVertexArray->Bind();
				//RenderGlobals::DrawIndexed(data->QuadVertexArray);
				// End Submit
				
				EndScene();
			}
		}
	}

	void RenderSystem::EndScene()
	{
	}

	void RenderSystem::Shutdown() {

		delete data;
		data = nullptr;
	}


	void RenderSystem::DrawQuad(Transform* transformComponent, Sprite* spriteComponent)
	{
		glm::mat4 transform = glm::translate(glm::mat4(1.0f), transformComponent->position) * glm::scale(glm::mat4(1.0f), { transformComponent->scale.x, transformComponent->scale.y, 1.0f });

		if (spriteComponent->texture) {
			data->TextureShader->SetFloat4("u_Color", spriteComponent->color);
			spriteComponent->texture->Bind();
			data->TextureShader->SetMat4("u_Transform", transform);
		}
		else {
			data->TextureShader->SetFloat4("u_Color", glm::vec4(1.0f));
			data->WhiteTexture->Bind();
			data->TextureShader->SetMat4("u_Transform", transform);
		}

		data->QuadVertexArray->Bind();
		RenderGlobals::DrawIndexed(data->QuadVertexArray);
	}

	void RenderSystem::Submit(const Ref<Shader>& shader, const Ref<VertexArray>& vertexArray, const glm::mat4& transform)
	{
		//shader->Bind();
		//shader->SetMat4("u_ViewProjection", _sceneData->ViewProjectionMatrix);
		//shader->SetMat4("u_Transform", transform);
		//
		//vertexArray->Bind();
		//RenderGlobals::DrawIndexed(vertexArray);
	}
}