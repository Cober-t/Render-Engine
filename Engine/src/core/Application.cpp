#include "pch.h"
#include "Application.h"
#include "Render/RenderAPI.h"
#include "Render/RenderGlobals.h"

namespace Cober {

    Engine* Engine::_instance = nullptr;
    
    Engine::Engine(const std::string& name, uint32_t width, uint32_t height, bool vsync) 
    {
        LOG_INFO("Engine Constructor!");
        DEBUG = false;
        GAME_2D = false;
        PHYSICS_2D = false;

        _instance = this;


#ifdef __EMSCRIPTEN__

        unsigned int flags = SDL_INIT_VIDEO | SDL_INIT_EVENTS;
#else
        unsigned int flags = SDL_INIT_EVERYTHING;

        lua.open_libraries(sol::lib::base, sol::lib::math);

        { // Lua temporary
            /*
            std::string scriptName = "firstScript.lua";
            sol::load_result script = lua.load_file(SCRIPTS_PATH + scriptName);
            if (!script.valid()) {
                sol::error err = script;
                std::string errorMesage = err.what();
                Logger::Error("Error loading the lua script: " + errorMesage);
                return;
            }
            // Executes the script using the Sol state
            lua.script_file(SCRIPTS_PATH + scriptName);

            // Read the big table for the current level
            sol::table level = lua["Level"];
            // Rad the level assets
            sol::table assets = level["assets"];

            int i = 0;
            while (true) {
                sol::optional<sol::table> hasAsset = assets[i];
                if (hasAsset == sol::nullopt)
                    break;

                sol::table asset = assets[i];
                std::string assetType = asset["type"];
                // etc ...
                i++;
            }
            */
        }
#endif
        if (SDL_Init(flags))
            GET_SDL_ERROR();

        _window = Window::Create(name, width, height, vsync);

        _timestep = CreateUnique<Timestep>();
        //_assetManager = CreateUnique<AssetManager>();

        _gameState = GameState::PLAY;
        //_timestep->SetFPSLimit(60);
    }

    Engine::~Engine() {
        LOG_INFO("Engine Destructor!");
    }

    void Engine::PushLayer(Layer* layer) {

        _LayerStack.PushLayer(layer);
        layer->OnAttach();
    }

    void Engine::PushOverlay(Layer* layer) {

        _LayerStack.PushOverlay(layer);
        layer->OnAttach();
    }

    void Engine::Start() {

#ifdef __OPENGL__
        if (_gameState == GameState::EDITOR || _gameState == GameState::RUNTIME_EDITOR) {
            _GuiLayer = new GuiLayer("#version 460");
            PushOverlay(_GuiLayer);
        }
#endif
    }

    void Engine::Update() {
     
        while (_gameState == GameState::PLAY || _gameState == GameState::EDITOR || _gameState == GameState::RUNTIME_EDITOR)
            main_loop();
    }

    void Engine::main_loop() {

        // Allow limit FPS
        _timestep->Update();  

        // Reset Event Subscriptions
        EventHandler::Get()->Reset();
        
        // Test
        EventHandler::Get()->SubscribeToEvent<KeyDownEvent>(InputEvent::Get(), &InputEvent::OnKeyDown);


        // if(!_minimized) { UISystem::StartProcessInputs(); }
        ProcessEvents();
        // if(!_minimized) { UISystem::EndProcessInputs(); }

        if(!_minimized) {

            for (Layer* layer : _LayerStack)
                layer->OnUpdate(_timestep);

#ifdef __OPENGL__
            if (_gameState == GameState::EDITOR || _gameState == GameState::RUNTIME_EDITOR) {
                _GuiLayer->Begin();
                for (Layer* layer : _LayerStack)
                    layer->OnGuiRender();
                _GuiLayer->End();
            }
#endif
        }

        _window->SwapBuffers();
    }

    void Engine::ProcessEvents() {

        SDL_Event event;
        while (SDL_PollEvent(&event))
        {
            //UISystem::ProcessInputs(event);

            //Process Events from SDL
            EventHandler::Get()->ProcessEvents(event);

            for (Layer* layer : _LayerStack)
                layer->OnEvent(event);
        }
    }

    void Engine::Destroy() {
        
        for (Layer* layer : _LayerStack)
            layer->OnDetach();

        _window->CloseWindow();
    }
}