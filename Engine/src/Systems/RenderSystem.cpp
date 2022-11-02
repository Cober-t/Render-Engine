#include "pch.h"

#include "RenderSystem.h"
#include "PhysicsSystem.h"

#include "core/Logger.h"

#include "Render/VertexArray.h"
#include "Render/Shader.h"
#include "Render/RenderGlobals.h"


#include <glm/gtc/matrix_transform.hpp>

#define GLM_ENABLE_EXPERIMENTAL
#include <glm/gtx/quaternion.hpp>

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

	void RenderSystem::Start(const Ref<Scene>& scene, DebugSystem* debug, b2World* pWorld)
	{
		RenderGlobals::Init();

		// For debuggin Physics
			if (Engine::Get().GetDebugMode())
				SetupDebug();
			debugSystem  = debug;
			physicsWorld = pWorld;

		_registry = scene->GetRegistry();

		data = new RendererData();
		data->QuadVertexArray = VertexArray::Create();

		float squareVertices[5 * 4] = {
				-0.5f, -0.5f, 0.0f, 0.0f, 0.0f,
				 0.5f, -0.5f, 0.0f, 0.1f, 0.0f,
				 0.5f,  0.5f, 0.0f, 0.1f, 0.1f,
				-0.5f,  0.5f, 0.0f, 0.0f, 0.1f
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
		//RenderGlobals::SetClearColor(10, 0, 10, 255);
		RenderGlobals::SetClearColor(225, 225, 255, 255);
		RenderGlobals::Clear();
		// RenderGlobals::SetClearColor(camera->GetSkyboxColor());
		//	or just
		// camera->RenderSkybox();

		BeginScene(camera);

		for (auto entity : GetSystemEntities()) {
			Sprite sprite = entity.GetComponent<Sprite>();
			Transform transform= entity.GetComponent<Transform>();

			if (Engine::Get().GetDebugMode()) {
				DebugDrawSolidPoligon(entity);
				// ...
			}

			DrawQuad(&transform, &sprite);
		}

		EndScene();
	}

	void RenderSystem::SetupDebug() {
	
		physicsWorld->SetDebugDraw(debugSystem);
		uint32 flags = 0;
		flags += b2Draw::e_shapeBit;
		flags += b2Draw::e_jointBit;
		flags += b2Draw::e_aabbBit;
		flags += b2Draw::e_pairBit;
		flags += b2Draw::e_centerOfMassBit;
		debugSystem->SetFlags(flags);
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
		glm::mat4 transform = glm::translate(glm::mat4(1.0f), transformComponent->position) * 
							  glm::toMat4(glm::quat(transformComponent->rotation)) * 
							  glm::scale(glm::mat4(1.0f), { transformComponent->scale.x, transformComponent->scale.y, 1.0f });

		data->TextureShader->SetFloat4("u_Color", spriteComponent->color);
		
		if (spriteComponent->texture) {
			spriteComponent->texture->Bind();
			data->TextureShader->SetMat4("u_Transform", transform);
		}
		else {
			data->WhiteTexture->Bind();
			data->TextureShader->SetMat4("u_Transform", transform);
		}

		data->QuadVertexArray->Bind();
		RenderGlobals::DrawIndexed(data->QuadVertexArray);
	}

	void RenderSystem::DebugDrawSolidPoligon(Entity& entity, b2Color color) {

		if (entity.HasComponent<BoxCollider2D>()) {
			auto& shape = entity.GetComponent<BoxCollider2D>().shape;
			debugSystem->DrawSolidPolygon(shape.m_vertices, shape.m_count, color);
		}
		else
			Logger::Warning("Cannot get Collider Component!!");
	}
}