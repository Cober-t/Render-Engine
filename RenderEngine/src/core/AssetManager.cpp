#include "pch.h"

#include "core/AssetManager.h"
#include "core/Engine.h"

namespace Cober {

	AssetManager::AssetManager() {
		Logger::Log("AssetManager constructor called!");
	}

	AssetManager::~AssetManager() {
		ClearAssets();
		Logger::Log("AssetManager destructor called!");
	}

	void AssetManager::ClearAssets() {
		for (auto texture : textures)
			SDL_DestroyTexture(texture.second);
		textures.clear();
	}

	void AssetManager::AddTexture(const std::string& assetID, const std::string& filePath) {
		SDL_Surface* surface = IMG_Load(filePath.c_str());

		Engine& engine = Engine::Get();
		//SDL_Renderer* render = static_cast<SDL_Renderer*>(engine.GetWindow().GetRenderer());
		//SDL_Texture* texture = SDL_CreateTextureFromSurface(render, surface);

		SDL_FreeSurface(surface);

		//textures.emplace(assetID, texture);
		Logger::Log("New texture added to the Asset Store with ID = " + assetID);
	}
}