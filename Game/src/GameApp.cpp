#include <Engine.h>
#include <EntryPoint.h>

#include "Game2D.h"

namespace Cober {

	class Game : public Engine {
	public:
		Game() {
			PushLayer(new Game2D());
		}
		~Game() {

		}
	};

	Engine* CreateApplication() {
		return new Game();
	}
}

