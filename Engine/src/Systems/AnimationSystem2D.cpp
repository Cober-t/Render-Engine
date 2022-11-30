#include "pch.h"

#include "AnimationSystem2D.h"
#include "Render/Texture.h"

namespace Cober {

	AnimationSystem2D::AnimationSystem2D() {
		
		RequireComponent<Sprite>();
		RequireComponent<Animation2D>();

		Logger::Log("Animation System Added to Registry!!");
	}

	AnimationSystem2D::~AnimationSystem2D() {

		Logger::Log("Animation System removed from Registry");
	}


	void AnimationSystem2D::Start() {

	}

	void AnimationSystem2D::Update() {

		for (auto& entity : GetSystemEntities()) {

			Sprite& sprite  = entity.GetComponent<Sprite>();
			Animation2D& anim = entity.GetComponent<Animation2D>();

			if (sprite.texture) {

				anim.currentFrame = ((SDL_GetTicks() - anim.startTime) * anim.frameRateSpeed / 1000) % anim.numFrames;

				// Export Index Coords to Editor
				Ref<SubTexture2D> subTexture = SubTexture2D::CreateFromCoords(sprite.texture, {anim.currentFrame, 0}, {32, 32});
				sprite.texture = subTexture->GetTexture();
				sprite.texture->SetSubTextureIndex(subTexture->GetTexCoords());

				anim.currentFrame++;
			}
		}
	}
}