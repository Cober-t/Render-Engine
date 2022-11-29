#pragma once

#include "core/Core.h"

#include "Render/CubeMap.h"
#include "Render/Buffer.h"
#include "Render/RenderGlobals.h"
#include "Render/VertexArray.h"

namespace Cober {

	class OpenGLCubeMap : public CubeMap {
	public:
		OpenGLCubeMap(std::vector<std::string> faces);

		void LoadCubeMap(std::vector<std::string> faces);

		Ref<Shader> GetCubeMapShader() const override { return cubeMapShader; }
		Ref<Shader> GetSkyboxShader()  const override { return skyboxShader; }

		void DrawSkybox(const glm::mat4& projection, const glm::mat4& view) const override;
		
		uint32_t GetCubeMap() const override { return _cubeMapID; }

		void Bind() const override;
	private:
		Ref<Shader> cubeMapShader;
		Ref<Shader> skyboxShader;

		Ref<VertexArray> cubeVAO, skyboxVAO;
		Ref<VertexBuffer> cubeVBO, skyboxVBO;

		uint32_t _cubeMapID;
	};
}