#include "core/Core.h"
#include "core/Application.h"

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif

extern Cober::Engine* Cober::CreateApplication();

auto app = Cober::CreateApplication();

#ifdef __EMSCRIPTEN__
static void main_loop() { app->Update(); }
#endif

int main(int argc, char** argv) {


	LOG("Coming START");
	app->Start();

	LOG("Coming UPDATE");
#ifdef __EMSCRIPTEN__
	emscripten_set_main_loop(main_loop, 0, true);
#else
	app->Update();
#endif
	
	LOG("Coming DESTROY");
	app->Destroy();

	delete app;
	return 1;
}