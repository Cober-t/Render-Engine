#include <Engine.h> 
#include <EntryPoint.h>

#include "EditorLayer.h"

namespace Cober {

	class Editor : public Engine {
	public:
		Editor() : Engine("Engine Editor")
		{
			PushLayer(new EditorLayer());
			Engine::Get().SetGameState(GameState::EDITOR);
		}

		~Editor() {
			LOG("Editor Destructor Called!");
		}
	};

	Engine* CreateApplication()
	{
		return new Editor();
	}
}