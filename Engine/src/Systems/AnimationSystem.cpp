#include "pch.h"

#include "AnimationSystem.h"
#include "Render/Texture.h"

namespace Cober {

	AnimationSystem::AnimationSystem() {
		
		RequireComponent<Sprite>();
		RequireComponent<Animation>();

		Logger::Log("Animation System Added to Registry!!");
	}

	AnimationSystem::~AnimationSystem() {

		Logger::Log("Animation System removed from Registry");
	}


	void AnimationSystem::Start() {

	}

	void AnimationSystem::Update() {

		for (auto& entity : GetSystemEntities()) {

			Sprite& sprite  = entity.GetComponent<Sprite>();
			Animation& anim = entity.GetComponent<Animation>();

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