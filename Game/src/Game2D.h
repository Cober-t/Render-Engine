#pragma once
#include <Engine.h>

using namespace Cober;

class Game2D : public Layer {
public:
	Game2D();
	virtual ~Game2D() = default;
	
	virtual void OnAttach() override;
	virtual void OnDetach() override;

	void OnUpdate(Ref<Timestep> ts) override;
	void OnEvent(SDL_Event& event) override;
private:
	Ref<Scene> _activeScene;
	Ref<EditorCamera> _camera;
};