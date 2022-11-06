#include <Engine.h>
#include <EntryPoint.h>

#include "Game2D.h"

namespace Cober {

	class Game : public Engine {
	public:
		Game() {
			PushLayer(new Game2D());
			Engine::Get().SetGameState(GameState::PLAY);
		}
		~Game() {
		}
	};

	Engine* CreateApplication() {
		return new Game();
	}
}

