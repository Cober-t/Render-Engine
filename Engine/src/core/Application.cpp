#include "pch.h"
#include "Application.h"
#include "Render/RenderAPI.h"
#include "Render/RenderGlobals.h"

namespace Cober {

    Engine* Engine::_instance = nullptr;
    
    Engine::Engine(const std::string& name, uint32_t width, uint32_t height, bool vsync) 
    {
        LOG("Engine Constructor!");
        DEBUG = false;
        GAME_2D = false;
        PHYSICS_2D = false;

        _instance = this;
        RenderGlobals::Create();

#ifdef __EMSCRIPTEN__
        unsigned int flags = SDL_INIT_VIDEO | SDL_INIT_EVENTS;
#else
        unsigned int flags = SDL_INIT_EVERYTHING;
#endif
        if (SDL_Init(flags))
            GET_SDL_ERROR();

        _window = Window::Create(name, width, height, vsync);

        _timestep = CreateUnique<Timestep>();
        _events = CreateUnique<Events>();
        //_assetManager = CreateUnique<AssetManager>();

        _gameState = GameState::PLAY;
        //_timestep->SetFPSLimit(60);
    }

    Engine::~Engine() {
        LOG("Engine Destructor!");
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

#ifndef __OPENGLES3__
#ifndef __EMSCRIPTEN__
        if (_gameState == GameState::EDITOR || _gameState == GameState::RUNTIME_EDITOR) {
            _GuiLayer = new GuiLayer("#version 430");
            PushOverlay(_GuiLayer);
        }
#endif
#endif
    }

    void Engine::Update() {
     
        while (_gameState == GameState::PLAY || _gameState == GameState::EDITOR || _gameState == GameState::RUNTIME_EDITOR)
            main_loop();
    }

    void Engine::main_loop() {
        _timestep->Update();  // Allow limit FPS

        //UISystem::StartProcessInputs();
        ProcessInputs();
        //UISystem::EndProcessInputs();

        //if(!_minimized) { ...
        {
            for (Layer* layer : _LayerStack)
                layer->OnUpdate(_timestep);

#ifndef __EMSCRIPTEN__
            if (_gameState == GameState::EDITOR || _gameState == GameState::RUNTIME_EDITOR) {
                _GuiLayer->Begin();
                for (Layer* layer : _LayerStack)
                    layer->OnGuiRender();
                _GuiLayer->End();
            }
#endif
        }
        // ... }

        _window->SwapBuffers();
    }

    void Engine::ProcessInputs() {

        SDL_Event event;
        while (SDL_PollEvent(&event))
        {
            //UISystem::ProcessInputs(event);

            _events->ProcessEvents(event);

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