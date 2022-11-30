#include "pch.h"

#include "JoystickEvent.h"

namespace Cober {

	JoystickEvent* JoystickEvent::_instance = nullptr;

	JoystickEvent::JoystickEvent() {

		_instance = this;
	}

	JoystickEvent::~JoystickEvent() {

		_instance = nullptr;
	}

	JoystickEvent* JoystickEvent::Get() {

		if (_instance == nullptr)
			_instance = new JoystickEvent();
		return _instance;
	}

	void JoystickEvent::OnButtonDown(ButtonDown& event) {


	}
}