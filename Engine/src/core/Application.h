#pragma once

#include "Core.h"

#include "Window.h"
#include "Timestep.h"
#include "Layer.h"

#include "AssetManager.h"
#include "Systems/UISystem.h"

#include "GUISystem/GuiLayer.h"

#include "Events/EventHandler.h"
#include "Events/InputEvent.h"

int main(int argc, char** argv);

namespace Cober {

	enum class GameState { PLAY, EDITOR, RUNTIME_EDITOR, EXIT };

	class GuiLayer;

	class Engine {
	public:
		Engine(const std::string& name = "", uint32_t width = 1280, uint32_t height = 720, bool vsync = true);
		virtual ~Engine();

		static Engine& Get() { return *_instance; }

		void Start();
		void Update();
		void main_loop();	// For EMSCRIPTEN

		void PushLayer(Layer* layer);
		void PushOverlay(Layer* layer);

		void ProcessEvents();

		void Destroy();
		void Close() { _gameState = GameState::EXIT; }

		void  SetMinimized(bool min) { _minimized = min; }
		void  SetGameState(GameState state)  { _gameState = state; }
		void  SetDebugMode(bool debugMode)  { DEBUG = debugMode; }
		bool& GetDebugMode() { return DEBUG; }
		bool& GetGameMode()  { return GAME_2D; }

		//Unique<AssetManager> GetAssetManager() { return _assetManager; }
		GuiLayer* GetImGuiLayer() { return _GuiLayer; }
		Window&   GetWindow()	  { return *_window; }
		GameState GetGameState()  { return _gameState; }
		uint32_t  GetFrames()	  { return _timestep->frames; }
	private:
		GameState _gameState;
		GuiLayer* _GuiLayer;
		Layer _LayerStack;
		Ref<Timestep> _timestep;
		Unique<Window> _window;
		//Unique<AssetManager> _assetManager;
		bool _minimized = false;
	private:
		bool DEBUG;
		bool GAME_2D;
		bool PHYSICS_2D;
	private:
		static Engine* _instance;
		friend int ::main(int argc, char** argv);
	};

	Engine* CreateApplication();
}