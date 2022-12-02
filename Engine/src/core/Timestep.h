#pragma once

#include <iostream>

#include <SDL/SDL.h>

namespace Cober {

	class Timestep {
	public:
		Timestep(float time = 0.0f)
			: FPS_Limit(60), lastFrameTime(0), frames(0), _countedFrames(0), limit(false), deltaTime(0) { }

		inline void Update(uint32_t framesLimit = 0) {
			// Limit FrameRate
			if (framesLimit != 0) {
				SetFPSLimit(framesLimit);
				int timeToWait = 1000 / FPS_Limit - (SDL_GetTicks() - lastFrameTime);
				if (timeToWait > 0 && timeToWait <= 1000 / FPS_Limit)
					SDL_Delay(timeToWait);
			}

			deltaTime = (SDL_GetTicks() - lastFrameTime) / 1000.0;
			_countedFrames++;

			if (lastFrameTime / 1000 - auxTime >= 1) {
				auxTime = lastFrameTime / 1000;
#ifdef __EMSCRIPTEN__
				//std::cout << frames << std::endl;
				//std::cout << deltaTime << std::endl;
#endif
				frames = _countedFrames;
				_countedFrames = 0;
			}

			lastFrameTime = SDL_GetTicks();
		}
		void SetFPSLimit(uint32_t frames) {
			if (frames > 60)
				frames = 60;
			FPS_Limit = frames;
			limit = true;
		}
		void UnlockFPSLimit() { limit = false; }
		double DeltaTime() { return deltaTime; }
	private:
		int auxTime = 0;
		uint32_t _countedFrames;
	public:
		uint32_t lastFrameTime;
		uint32_t FPS_Limit;
		uint32_t frames;
		bool	 limit;
		double	 deltaTime;
	};
}