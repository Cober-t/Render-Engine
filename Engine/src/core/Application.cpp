#include "pch.h"
#include "Application.h"

namespace Cober {

    Engine* Engine::_instance = nullptr;
    //static Window* window;
    
    Engine::Engine(const std::string& name, uint32_t width, uint32_t height, bool vsync) {

        Logger::Log("2DEngine Constructor!");

        _instance = this;
        _timestep     = CreateUnique<Timestep>();
        _registry     = CreateUnique<Registry>();
        _assetManager = CreateUnique<AssetManager>();

        if (SDL_Init(SDL_INIT_EVERYTHING) < 0) {
            Logger::Error("Error initializating SDL");
            return;
        }

        _window = Window::Create(name, width, height);

        if (_window->InitGlew())
            LOG("Something gone wrong on Initialice GLEW!!");

        _GuiLayer = new GuiLayer();
        PushOverlay(_GuiLayer);

        _gameState = GameState::EDITOR;
        //_timestep->SetFPSLimit(60);
    }

    Engine::~Engine() {
        Logger::Log("2DEngine Destructor!");
    }

    void Engine::PushLayer(Layer* layer) {

        _LayerStack.PushLayer(layer);
        layer->OnAttach();
    }

    void Engine::PushOverlay(Layer* layer) {

        _LayerStack.PushOverlay(layer);
        layer->OnAttach();
    }

    void Engine::Run() {

        while (_gameState == GameState::PLAY || _gameState == GameState::EDITOR) {

            ProcessInputs();

            _window->ClearWindow(200, 80, 20, 255);

            Update();

            //if(!_minimized) { ...
            {
                for (Layer* layer : _LayerStack)
                    layer->OnUpdate(_timestep);
            }
            
            {
                _GuiLayer->Begin();
                for (Layer* layer : _LayerStack)
                    layer->OnGuiRender();
                _GuiLayer->End();
            }
            // ... }
         
            _window->SwapBuffers();
        }
    }

    void Engine::ProcessInputs() {

        SDL_Event event;
        while (SDL_PollEvent(&event)) {

            ImGui_ImplSDL2_ProcessEvent(&event);

            switch (event.type) {
            case SDL_KEYDOWN:
                auto key = event.key.keysym.sym;
                if (key == SDLK_ESCAPE)
                    Close();
                break;
            }
        }
    }

    void Engine::Start() {
        
        // Add the systems that need to be processed in our game
        _registry->AddSystem<MovementSystem>();
        _registry->AddSystem<RenderSystem>();

        // [++++++++++++++++++++++++++++++++++++++++++++++++]
        // [++++++++++++++++++++ ESCENA ++++++++++++++++++++]
        // [++++++++++++++++++++++++++++++++++++++++++++++++]
        // Add assets
        /*
        _assetManager->AddTexture("cat", SHADERS_PATH + "woodenContainer.png");
        
        // Create som entities
        Entity tank = _registry->CreateEntity();
        
        // Add some components to the entity
        tank.AddComponent<Transform>(Vec2(100.0, 100.0), 0, Vec2(1.0, 1.0));
        tank.AddComponent<Rigidbody>(Vec2(45.0f, 0.0f));
        tank.AddComponent<Sprite>("cat", 128 * 3, 128 * 3);
        */
    }

    void Engine::Update() {

        _timestep->Update();  // Allow limit FPS

        // Update the registry to process the entities that are waiting to be created/deleted
        _registry->Update();

        // Ask all the "previous" frame time
        _registry->GetSystem<MovementSystem>().Update(_timestep->deltaTime);
        _registry->GetSystem<RenderSystem>().Update(_assetManager);
    }

    void Engine::Destroy() {
        
        //for (Layer* layer : _LayerStack)
            //layer->OnDetach();
        _window->CloseWindow();
    }
}