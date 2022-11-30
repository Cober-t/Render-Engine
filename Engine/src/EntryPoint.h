#include "core/Core.h"
#include "core/Application.h"

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif

extern Cober::Engine* Cober::CreateApplication();

#ifdef __EMSCRIPTEN__
	void main_loop() { Cober::Engine::Get().main_loop(); }
#endif

int main(int argc, char** argv) {

	auto app = Cober::CreateApplication();

	app->Start();

#ifdef __EMSCRIPTEN__
	emscripten_set_main_loop(main_loop, 0, true);
#else
	app->Update();
#endif
	
	app->Destroy();

	delete app;
	return 1;
}