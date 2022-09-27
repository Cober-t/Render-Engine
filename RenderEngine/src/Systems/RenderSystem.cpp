#include "pch.h"
#include "RenderSystem.h"

namespace Cober {

	RenderSystem::RenderSystem() {

		RequireComponent<Transform>();
		RequireComponent<Sprite>();
	}

	void RenderSystem::Update(SDL_Renderer* renderer, Unique<AssetManager>& assets) {

		for (auto entity : GetSystemEntities()) {
			auto& transform = entity.GetComponent<Transform>();
			const auto& sprite = entity.GetComponent<Sprite>();

			// Set the source rectangle of our original sprite texture
			const SDL_Rect srcRect = { sprite.srcRect.y, sprite.srcRect.x, sprite.w, sprite.h };
			// Set the destination rectangle with the x, y position to be rendered
			const SDL_Rect dstRect = {
				static_cast<int>(transform.position.x),
				static_cast<int>(transform.position.y),
				static_cast<int>(sprite.w * transform.scale.x),
				static_cast<int>(sprite.h * transform.scale.y)
			};

			SDL_RenderCopyEx(
				renderer, assets->GetTexture(sprite.assetID),
				&srcRect, &dstRect,
				transform.rotation,
				NULL, SDL_FLIP_NONE
			);
		}
	}
}