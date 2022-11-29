#include "pch.h"

#include "OpenGLCubeMap.h"
#include "Render/Texture.h"
#include "core/Logger.h"

#include <SDL/SDL_image.h>
#include <GL/glew.h>

namespace Cober {

    struct CubeMapVertex {

        glm::vec3 Position;
        glm::vec2 TexCoord;
    };

    struct SkyboxVertex {

        glm::vec3 Position;
    };

    struct CameraData
    {
        glm::mat4 Projection;
        glm::mat4 View;
        glm::mat4 Model;
    };
    CameraData CameraBuffer;
#ifdef __OPENGL__
    Ref<UniformBuffer> CameraUniformBuffer;
#endif

	OpenGLCubeMap::OpenGLCubeMap(std::vector<std::string> faces) {

        cubeMapShader = Shader::Create("CubeMap.glsl");
        skyboxShader  = Shader::Create("Skybox.glsl");


        cubeVAO = VertexArray::Create();
        cubeVBO = VertexBuffer::Create(_cubeMapVertex, sizeof(_cubeMapVertex));
        cubeVBO->SetLayout({
            { ShaderDataType::Float3, "a_Position"     },
            { ShaderDataType::Float2, "a_TexCoord"     }
            });
        cubeVAO->AddVertexBuffer(cubeVBO);


        skyboxVAO = VertexArray::Create();
        skyboxVBO = VertexBuffer::Create(_skyboxVertex, sizeof(_skyboxVertex));
        skyboxVBO->SetLayout({
            { ShaderDataType::Float3, "a_Position"     },
            { ShaderDataType::Float2, "a_TexCoord"     }
            });
        skyboxVAO->AddVertexBuffer(skyboxVBO);

        LoadCubeMap(faces);
	}

    void OpenGLCubeMap::LoadCubeMap(std::vector<std::string> faces) {

        GLCallV(glCreateTextures(GL_TEXTURE_CUBE_MAP, 1, &_cubeMapID));

        for (int i = 0; i < faces.size(); i++) {

            SDL_Surface* texSurface = IMG_Load(faces[i].c_str());

            if (!texSurface)
                Logger::Error("Failed to load image with path: " + faces[i]);

            int width = texSurface->w;
            int height = texSurface->h;

            if (texSurface) {
                //GLCallV(glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, texSurface->pixels));
                glTextureSubImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, 0, 0, width, height, GL_RGB, GL_UNSIGNED_BYTE, texSurface->pixels);
            }
    
            SDL_FreeSurface(texSurface);
        }
        GLCallV(glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, GL_LINEAR));
        GLCallV(glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAG_FILTER, GL_LINEAR));
        GLCallV(glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE));
        GLCallV(glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE));
        GLCallV(glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_R, GL_CLAMP_TO_EDGE));
    }

    void OpenGLCubeMap::Bind() const
    {
        cubeMapShader->Bind();
        cubeMapShader->SetInt("texture1", 0);

        skyboxShader->Bind();
        skyboxShader->SetInt("skybox", 0);
    }

    void OpenGLCubeMap::DrawSkybox(const glm::mat4& projection, const glm::mat4& view) const {

        CameraUniformBuffer = UniformBuffer::Create(sizeof(CameraData), 0);
        CameraBuffer.View = view;
        CameraBuffer.Projection = projection;
        CameraBuffer.Model = glm::mat4(glm::mat3(view));
        CameraUniformBuffer->SetData(&CameraBuffer, sizeof(CameraData));

        Ref<Texture> basicCubeTexture = Texture::Create(1, 1);
        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_CUBE_MAP, basicCubeTexture->GetID());
        RenderGlobals::DrawIndexed(cubeVAO, (uint32_t)36);
        //glBindVertexArray(0);

        // draw skybox as last
        glDepthFunc(GL_LEQUAL);  // change depth function so depth test passes when values are equal to depth buffer's content
        skyboxShader->Bind();
        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_CUBE_MAP, _cubeMapID);
        RenderGlobals::DrawIndexed(skyboxVAO, (uint32_t)36);
        //glBindVertexArray(0);
        glDepthFunc(GL_LESS); // set depth function back to default
    }
}