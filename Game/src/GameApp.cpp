#include <Engine.h>
#include <EntryPoint.h>

#include "Game2D.h"

namespace Cober {

	class Game : public Engine {
	public:
		Game() {
			PushLayer(new Game2D());
			Engine::Get().SetGameState(GameState::PLAY);
			Logger::Log("Game Constructor Called!");
		}
		~Game() {
			Logger::Log("Game Destructor Called!");
		}
	};

	Engine* CreateApplication() {
		return new Game();
	}
}

