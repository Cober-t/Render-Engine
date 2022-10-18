#include <Engine.h> 
#include <EntryPoint.h>

#include "EditorLayer.h"

namespace Cober {

	class Editor : public Engine {
	public:
		Editor() : Engine("Editor Layer")
		{
			PushLayer(new EditorLayer());
			Engine::Get().SetGameState(GameState::EDITOR);
		}

		~Editor() {

		}
	};

	Engine* CreateApplication()
	{
		return new Editor();
	}
}