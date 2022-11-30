#include "pch.h"

#include "core/Logger.h"

#include "InputEvent.h"

namespace Cober {

	InputEvent* InputEvent::_instance = nullptr;

	InputEvent::InputEvent() {

		_instance = this;
	}

	InputEvent::~InputEvent() {

		_instance = nullptr;
	}

	InputEvent* InputEvent::Get() {

		if (_instance == nullptr)
			_instance = new InputEvent();
		return _instance;
	}

	void InputEvent::OnKeyDown(KeyDownEvent& event) {

		std::string keyCode = std::to_string(event.symbol);
		std::string keySymbol(1, event.symbol);
		Logger::Log("Key Pressed event emitted: [" + keyCode + "] " + keySymbol);
	}

}