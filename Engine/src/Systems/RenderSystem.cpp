#include "pch.h"

#include "RenderSystem.h"

#include "core/Logger.h"
#include "Render/RenderGlobals.h"

#include <glm/gtc/type_ptr.hpp>
#include <glm/gtc/matrix_transform.hpp>

// ABSTRACT API
#include <GL/glew.h>

namespace Cober {

	// ++++++++++++++++++++++++ RENDER TEST
	void CreateTriangle(const Ref<Shader>& shader) {

		GLfloat vertices[] = {
			-0.4f, -0.4f, 0.0f,
			 0.4f, -0.4f, 0.0f,
			 0.0f,  0.4f, 0.0f
		};

		GLuint VAO = shader->GetVAO();
		GLuint VBO = shader->GetVBO();

		glGenVertexArrays(1, &VAO);
		glBindVertexArray(VAO);

		glGenBuffers(1, &VBO);
		glBindBuffer(GL_ARRAY_BUFFER, VBO);
		glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

		glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, 0);
		glEnableVertexAttribArray(0);

		glBindBuffer(GL_ARRAY_BUFFER, 0);

		glBindVertexArray(0);

		shader->SetVAO(VAO);
		shader->SetVBO(VBO);
	}

	RenderSystem::RenderSystem() {

		RequireComponent<Transform>();
		RequireComponent<Sprite>();
	}

	RenderSystem::~RenderSystem() {
		Logger::Log("Render System removed from Registry");
	}

	void RenderSystem::Start(Ref<AssetManager> assets) {
		// ++++++++++++++++++++++++ RENDER TEST
		shaderTriangle = Shader::Create();
		CreateTriangle(shaderTriangle);
		shaderTriangle->AddShader("vertexShader.glsl", GL_VERTEX_SHADER);
		shaderTriangle->AddShader("fragmentShader.glsl", GL_FRAGMENT_SHADER);
		shaderTriangle->CompileShader();

		// ++++++++++++++++++++++++ GRID
		//shaderGrid = Shader::Create();
		//shaderGrid->AddShader("gridVertex.glsl", GL_VERTEX_SHADER);
		//shaderGrid->AddShader("gridFragment.glsl", GL_FRAGMENT_SHADER);
		//shaderGrid->CompileShader();
	}

	void RenderSystem::Update(Ref<EditorCamera> camera) {

		RenderGlobals::SetClearColor(4, 0, 8, 255);
		RenderGlobals::Clear();


		// Run Scene Editor or Scene Play
		// ++++++++++++++++++++++++ RENDER TEST
		glUseProgram(shaderTriangle->GetShaderProgram());

		// [+++++++++++++++++++++++++++++++++++++++++++]
		// [+++++++++++++++ Camera Test +++++++++++++++]
		// [+++++++++++++++++++++++++++++++++++++++++++]
		const glm::mat4& projectionMatrix = camera->GetProjection();
		const glm::mat4& viewMatrix = camera->GetView();

		GLint location = glGetUniformLocation(shaderTriangle->GetShaderProgram(), "_projection");
		GLCallV(glUniformMatrix4fv(location, 1, GL_FALSE, glm::value_ptr(projectionMatrix)));
		location = glGetUniformLocation(shaderTriangle->GetShaderProgram(), "_view");
		GLCallV(glUniformMatrix4fv(location, 1, GL_FALSE, glm::value_ptr(viewMatrix)));

		glBindVertexArray(shaderTriangle->GetVAO());
		glDrawArrays(GL_TRIANGLES, 0, 3);
		glBindVertexArray(0);
		glUseProgram(0);

		// [++++++++++++++++++ GRID +++++++++++++++++++]
		// [+++++++++++++++++++++++++++++++++++++++++++]
		//glm::vec3 nearPoint{ 1.0, 0.0, 1.0 };
		//glm::vec3 farPoint{ 5.0, 0.0, 5.0 };
		//glm::vec4 color{ 1.0, 0.0, 0.0, 1.0 };
		//glUseProgram(shaderGrid->GetShaderProgram());
		//location = glGetUniformLocation(shaderGrid->GetShaderProgram(), "proj");
		//glUniformMatrix4fv(location, 1, GL_FALSE, glm::value_ptr(projectionMatrix));
		//location = glGetUniformLocation(shaderGrid->GetShaderProgram(), "view");
		//glUniformMatrix4fv(location, 1, GL_FALSE, glm::value_ptr(viewMatrix));
		//
		//glBindVertexArray(shaderGrid->GetVAO());
		//glDrawArrays(GL_TRIANGLES, 0, 3);
		//glBindVertexArray(0);
		//glUseProgram(0);

		
		for (auto entity : GetSystemEntities()) {
			auto& transform = entity.GetComponent<Transform>();
			const auto& sprite = entity.GetComponent<Sprite>();

			int x = sprite.srcRect.x, y = sprite.srcRect.y;
			int width  = sprite.w, height = sprite.h;

			//glBegin(GL_QUADS);
			//	glTexCoord2f(0, 0); glVertex3f(x, y, 0);
			//	glTexCoord2f(1, 0); glVertex3f(x + width, y, 0);
			//	glTexCoord2f(1, 1); glVertex3f(x + width, y + height, 0);
			//	glTexCoord2f(0, 1); glVertex3f(x, y + height, 0);
			//glEnd();
			//glBindTexture(GL_TEXTURE_2D, assets->GetTexture(sprite.assetID));
		}
	}
}