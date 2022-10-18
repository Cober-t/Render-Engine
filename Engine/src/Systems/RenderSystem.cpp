#include "pch.h"
#include "RenderSystem.h"

namespace Cober {

	RenderSystem::RenderSystem() {

		RequireComponent<Transform>();
		RequireComponent<Sprite>();
	}

	void RenderSystem::Update(Unique<AssetManager>& assets) {

		for (auto entity : GetSystemEntities()) {
			auto& transform = entity.GetComponent<Transform>();
			const auto& sprite = entity.GetComponent<Sprite>();

			int x = sprite.srcRect.x, y = sprite.srcRect.y;
			int width  = sprite.w, height = sprite.h;

			glBegin(GL_QUADS);
				glTexCoord2f(0, 0); glVertex3f(x, y, 0);
				glTexCoord2f(1, 0); glVertex3f(x + width, y, 0);
				glTexCoord2f(1, 1); glVertex3f(x + width, y + height, 0);
				glTexCoord2f(0, 1); glVertex3f(x, y + height, 0);
			glEnd();
			glBindTexture(GL_TEXTURE_2D, assets->GetTexture(sprite.assetID));
		}
	}
}