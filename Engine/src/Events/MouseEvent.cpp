#include "pch.h"

#include "MouseEvent.h"


namespace Cober {

	MouseEvent* MouseEvent::_instance = nullptr;

	MouseEvent::MouseEvent() {

		_instance = this;
	}

	MouseEvent::~MouseEvent() {

		_instance = nullptr;
	}

	MouseEvent* MouseEvent::Get() {

		if (_instance == nullptr)
			_instance = new MouseEvent();
		return _instance;
	}

	void MouseEvent::OnMouseDown(MouseDownEvent& event) {

	}
}