#pragma once

#include <core/Core.h>

#include "Window.h"
#include "Timestep.h"
#include "Layer.h"

//#include "Entities/ECS.h"
//#include "AssetManager.h"
//#include "Entities/Components.h"
//#include "Render/Shader.h"
//#include "Render/Framebuffer.h"
#include "Systems/MovementSystem.h"
#include "Systems/RenderSystem.h"

#include "GUISystem/GuiLayer.h"

namespace Cober {

	enum class GameState { PLAY, EDITOR, EXIT };

	class GuiLayer;

	class Engine {
	public:
		Engine(const std::string& name = "", uint32_t width = 1280, uint32_t height = 720, bool vsync = true);
		virtual ~Engine();

		static Engine& Get() { return *_instance; }

		void Start();
		void Run();

		void PushLayer(Layer* layer);
		void PushOverlay(Layer* layer);

		void ProcessInputs();

		void Update();
		void Destroy();

		void Close() { _gameState = GameState::EXIT; }
		Window& GetWindow() { return *_window; }
		GameState GetGameState() { return _gameState; }
		void SetGameState(GameState state) { _gameState = state; }
		uint32_t GetFrames() { return _timestep->frames; }
	public:
		uint32_t viewportWidth, viewportHeight;
		uint32_t _frameRate;
		uint32_t _countedFrames;
	private:
		GameState _gameState;
		GuiLayer* _GuiLayer;
		Layer _LayerStack;
		Ref<Timestep> _timestep;
		Unique<Window> _window;
		Unique<Registry> _registry;
		Unique<AssetManager> _assetManager;
	private:
		static Engine* _instance;
		friend int ::main(int argc, char* argv[]);
	};

	Engine* CreateApplication();
}