#include "pch.h"
#include "Application.h"

namespace Cober {

    Engine* Engine::_instance = nullptr;
    //static Window* window;
    
    Engine::Engine(const std::string& name, uint32_t width, uint32_t height, bool vsync) 
    {
        Logger::Log("2DEngine Constructor!");

        _instance = this;

        _timestep = CreateUnique<Timestep>();
        _registry = CreateUnique<Registry>();
        _assetManager = CreateUnique<AssetManager>();
        _events = CreateUnique<Events>();

        if (SDL_Init(SDL_INIT_EVERYTHING) < 0) {
            Logger::Error("Error initializating SDL");
            return;
        }

        _window = Window::Create(name, width, height, vsync);
        if (_window->GetVSync())
            SDL_GL_SetSwapInterval(1);

        //_timestep->SetFPSLimit(60);
        _gameState = GameState::PLAY;
    }

    Engine::~Engine() {
        Logger::Log("Engine Destructor!");
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

#ifndef __EMSCRIPTEN__
        if (_gameState == GameState::EDITOR) {
            _GuiLayer = new GuiLayer("#version 430");
            PushOverlay(_GuiLayer);
        }
#endif
    }

    void Engine::Update() {

        while (_gameState == GameState::PLAY || _gameState == GameState::EDITOR) {

            _timestep->Update();  // Allow limit FPS

            UISystem::StartProcessInputs();
            ProcessInputs();
            UISystem::EndProcessInputs();

            //if(!_minimized) { ...
            {
                for (Layer* layer : _LayerStack)
                    layer->OnUpdate(_timestep);

#ifndef __EMSCRIPTEN__
                if (_gameState == GameState::EDITOR) {
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
    }

    void Engine::ProcessInputs() {

        SDL_Event event;
        while (SDL_PollEvent(&event))
        {
            UISystem::ProcessInputs(event);

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