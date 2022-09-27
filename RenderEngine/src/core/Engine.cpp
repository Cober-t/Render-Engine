#include "pch.h"
#include "Engine.h"

namespace Cober {

    Engine* Engine::_instance = nullptr;
    //static Window* window;

    Engine::Engine() : isRunning(false), enableGUI(true) {
        _instance = this;
        Logger::Log("2DEngine Constructor!");
        _timestep = CreateUnique<Timestep>();
        _registry = CreateUnique<Registry>();
        _assetManager = CreateUnique<AssetManager>();
    }

    Engine::~Engine() {
        Logger::Log("2DEngine Destructor!");
    }

    void Engine::Initialize() {

        if (SDL_Init(SDL_INIT_EVERYTHING) < 0) {
            Logger::Error("Error initializating SDL");
            return;
        }

        _window = Window::Create();

        if (_window->InitGlew())
            LOG("Something gone wrong on Initialice GLEW!!");

        GUI::Init(_window);

        isRunning = true;
        //_timestep->SetFPSLimit(60);
    }

    // ++++++++++++++++++++++++ RENDER TEST
    void CreateTriangle(const Ref<Shader>& shader) {

        GLfloat vertices[] = {
            -0.4f, -0.4f, 0.0f,
             0.4f, -0.4f, 0.0f,
             0.0f,  0.4f, 0.0f
        };

        GLuint VAO = shader->GetVAO();
        GLuint VBO = shader->GetVBO();

        glGenVertexArrays(1, &VAO);
        glBindVertexArray(VAO);

        glGenBuffers(1, &VBO);
        glBindBuffer(GL_ARRAY_BUFFER, VBO);
        glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

        glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, 0);
        glEnableVertexAttribArray(0);

        glBindBuffer(GL_ARRAY_BUFFER, 0);

        glBindVertexArray(0);

        shader->SetVAO(VAO);
        shader->SetVBO(VBO);
    }
    // [[-----------

    void Engine::Run() {

        Start();
        Ref<Framebuffer> framebuffer = Framebuffer::Create(_window->GetWidth(), _window->GetHeight());
        
        // ++++++++++++++++++++++++ RENDER TEST
        Ref<Shader> shader = Shader::Create();
        CreateTriangle(shader);
        shader->AddShader("vertexShader.glsl", GL_VERTEX_SHADER);
        shader->AddShader("fragmentShader.glsl", GL_FRAGMENT_SHADER);
        shader->CompileShader();
        // [[-----------

        while (isRunning) {

            ProcessInputs();
            Update();

            //_window->UpdateViewport(_window->GetWidth(), _window->GetHeight());
            //double aspectRatio = viewportWidth / viewportHeight;
            //framebuffer->SetSpecificationWidth(_window->GetWidth() / aspectRatio);
            //framebuffer->SetSpecificationHeight(_window->GetHeight() / aspectRatio);
            //framebuffer->Resize(_window->GetWidth(), _window->GetHeight());
            framebuffer->Bind();
            _window->ClearWindow(0.8f, 0.3f, 0.1f, 1.0f);

            // ++++++++++++++++++++++++ RENDER TEST
            glUseProgram(shader->GetShaderProgram());
            glBindVertexArray(shader->GetVAO());
            glDrawArrays(GL_TRIANGLES, 0, 3);
            glBindVertexArray(0);
            glUseProgram(0);
            // [[-----------

            framebuffer->Unbind();

            if (enableGUI) {
                GUI::Begin();
                GUI::Render(framebuffer);
                GUI::End();
            }
            _window->SwapBuffers();
        }
    }

    void Engine::ProcessInputs() {

        SDL_Event event;
        while (SDL_PollEvent(&event)) {

            ImGui_ImplSDL2_ProcessEvent(&event);

            switch (event.type) {
            case SDL_QUIT:
                isRunning = false;
                break;
            case SDL_KEYDOWN:
                if (event.key.keysym.sym == SDLK_ESCAPE)
                    isRunning = false;
                if (event.key.keysym.sym == SDLK_d)
                    enableGUI = enableGUI == true ? false : true;
                break;
            }
        }
    }

    void Engine::Start() {
        
        // Add the systems that need to be processed in our game
        _registry->AddSystem<MovementSystem>();
        _registry->AddSystem<RenderSystem>();

        // Add assets
        //SDL_Renderer* renderer = _window->GetRenderer();
        //_assetManager->AddTexture("cat", "../assets/images/tank-panther-right.png");
        
        //// Create som entities
        //Entity tank = _registry->CreateEntity();
        
        //// Add some components to the entity
        //tank.AddComponent<Transform>(Vec2(10.0, 10.0), 0, Vec2(1.0, 1.0));
        //tank.AddComponent<Rigidbody>(Vec2(45.0f, 0.0f));
        //tank.AddComponent<Sprite>("cat", 128 * 3, 128 * 3);
    }

    void Engine::Update() {

        _timestep->Update();  // Allow limit FPS

        // Update the registry to process the entities that are waiting to be created/deleted
        _registry->Update();

        // Ask all the "previous" frame time
        _registry->GetSystem<MovementSystem>().Update(_timestep->deltaTime);

        _window->ClearWindow();
        //_registry->GetSystem<RenderSystem>().Update(_window->GetRenderer(), _assetManager);
    }

    void Engine::Destroy() {
        GUI::Destroy();
        _window->CloseWindow();
    }
}