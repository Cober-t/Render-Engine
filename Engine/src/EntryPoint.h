#include "core/Core.h"

extern Cober::Engine* Cober::CreateApplication();

int main(int argc, char* args[]) {

	auto app = Cober::CreateApplication();

	app->Start();
	app->Run();
	app->Destroy();

	delete app;
	return 1;
}
