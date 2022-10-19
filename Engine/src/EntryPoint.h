#include "core/Core.h"

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif


extern Cober::Engine* Cober::CreateApplication();

int main(int argc, char* argv[]) {

	auto app = Cober::CreateApplication();

	app->Start();

#ifdef __EMSCRIPTEN__
	int fps = 0; // Use browser's requestAnimationFrame
	emscripten_set_main_loop_arg(app->Update(), NULL, 0, true);
#else
	app->Update();
#endif
	
	app->Destroy();

	delete app;
	return 1;
}
