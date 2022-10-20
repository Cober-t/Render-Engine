#pragma once

#include <string>
#include <map>

// Export to macros
#include <GL/glew.h> 
//#include <SDL/SDL_image.h>
//#include <SDL/SDL_audio.h>

namespace Cober {

	class AssetManager {
	public:
		AssetManager();
		~AssetManager();

		void ClearAssets();
		void AddTexture(const std::string& assetID, const std::string& filePath);

		GLuint GetTexture(const std::string& assetID) { return textures[assetID]; };
		//SDL_Texture* GetFont(const std::string& assetID) { return textures[assetID]; };
		//SDL_Texture* GetAudio(const std::string& assetID) { return textures[assetID]; };
	private:
		std::map<std::string, GLuint> textures;
		//std::map<std::string, SDL_ttf*> fonts;
		//std::map<std::string, SDL_audio*> textures;
	};
}