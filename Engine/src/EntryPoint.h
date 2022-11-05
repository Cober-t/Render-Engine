#include "core/Core.h"
#include "core/Application.h"


extern Cober::Engine* Cober::CreateApplication();

int main(int argc, char** argv) {

	auto app = Cober::CreateApplication();

	app->Start();

	app->Update();
	
	app->Destroy();

	delete app;
	return 1;
}
