#include "pch.h"

#include "WindowEvent.h"

namespace Cober {

	WindowEvent* WindowEvent::_instance = nullptr;

	WindowEvent::WindowEvent() {

		_instance = this;
	}

	WindowEvent::~WindowEvent() {

		_instance = nullptr;
	}

	WindowEvent* WindowEvent::Get() {

		if (_instance == nullptr)
			_instance = new WindowEvent();
		return _instance;
	}

	void WindowEvent::OnWindowResize(WindowResizeEvent& event) {

	}
}