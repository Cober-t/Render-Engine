#include "pch.h"
#include "core/AssetManager.h"

namespace Cober {

	AssetManager::AssetManager() {
		Logger::Log("AssetManager constructor called!");
		glEnable(GL_TEXTURE_2D);
		glEnable(GL_DEPTH_TEST);
	}

	AssetManager::~AssetManager() {
		ClearAssets();
		Logger::Log("AssetManager destructor called!");
	}

	void AssetManager::ClearAssets() {
		for (auto texture : textures)
			glDeleteTextures(1, (const GLuint*)texture.second);
		textures.clear();
	}

	void AssetManager::AddTexture(const std::string& assetID, const std::string& filePath) {

		/*
		GLuint TextureID = 0;
		//IMG_Init(IMG_INIT_PNG);
		SDL_Surface* surface = IMG_Load(filePath.c_str());
		if (!surface) {
			LOG(SDL_GetError());
			return;
		}
		
		glGenTextures(1, &TextureID);
		glBindTexture(GL_TEXTURE_2D, TextureID);

		int Mode = GL_RGB;
		if (surface->format->BytesPerPixel = 4)
			Mode = GL_RGBA;
		
		glTexImage2D(GL_TEXTURE_2D, 0, Mode, surface->w, surface->h, 0, Mode, GL_UNSIGNED_BYTE, surface->pixels);

		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

		textures.emplace(assetID, TextureID);
		//SDL_FreeSurface(surface);
		glBindTexture(GL_TEXTURE_2D, 0);

		Logger::Log("New texture added to the Asset Store with ID = " + assetID);
		*/
	}
}