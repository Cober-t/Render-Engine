#include "pch.h"
#include "EditorCamera.h"

#include "core/Application.h"

#define GLM_ENABLE_EXPERIMENTAL
#include <glm/gtx/quaternion.hpp>

namespace Cober {

	EditorCamera::EditorCamera(float fov, float aspectRatio, float nearClip, float farClip)
		: _fov(fov), _aspectRatio(aspectRatio), _nearClip(nearClip), _farClip(farClip) 
	{
		UpdateView();
	}

	EditorCamera::~EditorCamera() {

		LOG("Editor Camera Destroyed!!");
	}

	void EditorCamera::UpdateProjection(bool& ortho) {

		orthoProjection = ortho;
		_aspectRatio = _viewportWidth / _viewportHeight;

		if (ortho)
			_projection = glm::ortho(-_aspectRatio * _distance, _aspectRatio * _distance, -_distance, _distance, 0.1f, 1000.0f);
		else
			_projection = glm::perspective(glm::radians(_fov), _aspectRatio, _nearClip, _farClip);
	}

	void EditorCamera::UpdateView() {

		// _yaw = _pitch = 0.0f;	// Lock the camera's rotation
		_position = CalculatePosition();

		if (orthoProjection) {
			glm::mat4 transform = glm::translate(glm::mat4(1.0f), _position) * glm::rotate(glm::mat4(1.0f), 0.0f, glm::vec3(0, 0, 1));
			_viewMatrix = glm::inverse(transform);
		}
		else {
			glm::quat orientation = GetOrientation();
			_viewMatrix = glm::translate(glm::mat4(1.0f), _position) * glm::toMat4(orientation);
			_viewMatrix = glm::inverse(_viewMatrix);
		}
	}
	
	std::pair<float, float> EditorCamera::PanSpeed() const {

		float x = std::min(_viewportWidth / 1000.0f, 2.4f); // max = 2.4f
		float xFactor = 0.05f * (x * x) - 0.1778f * x + 0.3021f;

		float y = std::min(_viewportHeight / 1000.0f, 2.4f); // max = 2.4f
		float yFactor = 0.05f * (y * y) - 0.1778f * y + 0.3021f;

		return { xFactor, yFactor };
	}

	float EditorCamera::RotationSpeed() const {

		return 0.8f;
	}

	float EditorCamera::ZoomSpeed() const 
	{
		float distance = _distance * 0.2f;
		distance = std::max(distance, 0.0f);
		float speed = distance * distance;
		speed = std::min(speed, 100.0f);	// max speed = 100

		return speed;
	}

	void EditorCamera::OnUpdate(Ref<Timestep> ts) {

		UpdateView();
	}
	
	void EditorCamera::OnEvent(SDL_Event& event) {
	
		const Uint8* keyStateArray   = SDL_GetKeyboardState(NULL);

		if (event.type == SDL_MOUSEBUTTONUP)
			mouseButtonHeld = false;
		if (_viewportFocused && keyStateArray[SDL_SCANCODE_LALT] && (event.type == SDL_MOUSEBUTTONDOWN || event.type == SDL_MOUSEMOTION)) {
			mouseButtonHeld = true;
			int mouseX, mouseY;
			SDL_GetMouseState(&mouseX, &mouseY);
			const glm::vec2& mouse{ mouseX, mouseY};
			glm::vec2 delta = (mouse - _initialMousePos) * 0.003f;
			_initialMousePos = mouse;
			SDL_MouseButtonEvent* m = (SDL_MouseButtonEvent*)&event;
			if (event.button.button == SDL_BUTTON(SDL_BUTTON_MIDDLE))
				MousePan(delta);
			else if (orthoProjection == false && m->button == SDL_BUTTON(SDL_BUTTON_LEFT))
				MouseRotate(delta);
			else if (orthoProjection == false && m->button == SDL_BUTTON(SDL_BUTTON_RIGHT))
				MouseZoom(delta.y);
		}

		if (_viewportFocused && event.type == SDL_MOUSEWHEEL)
			OnMouseScroll(event.wheel);
	}

	float EditorCamera::OnMouseScroll(SDL_MouseWheelEvent& event)
	{
		float delta = event.preciseY * 0.1f;
		MouseZoom(delta);
		UpdateView();
		return false;
	}

	void EditorCamera::MousePan(const glm::vec2& delta)
	{
		auto [xSpeed, ySpeed] = PanSpeed();
		_focalPoint += -GetRightDirection() * delta.x * xSpeed * _distance;
		_focalPoint += GetUpDirection() * delta.y * ySpeed * _distance;
	}

	void EditorCamera::MouseRotate(const glm::vec2& delta)
	{
		float yawSign = GetUpDirection().y < 0 ? -1.0f : 1.0f;
		_yaw += yawSign * delta.x * RotationSpeed();
		_pitch += delta.y * RotationSpeed();
	}

	void EditorCamera::MouseZoom(float delta)
	{
		_distance -= delta * ZoomSpeed();
		if (_distance < 1.0f) {
			_focalPoint += GetForwardDirection();
			_distance = 1.0f;
		}
	}

	glm::vec3 EditorCamera::GetUpDirection() const {

		return glm::rotate(GetOrientation(), glm::vec3(0.0f, 1.0f, 0.0f));
	}

	glm::vec3 EditorCamera::GetRightDirection() const {

		return glm::rotate(GetOrientation(), glm::vec3(1.0f, 0.0f, 0.0f));
	}

	glm::vec3 EditorCamera::GetForwardDirection() const {
		
		return glm::rotate(GetOrientation(), glm::vec3(0.0f, 0.0f, -1.0f));
	}

	glm::vec3 EditorCamera::CalculatePosition() const {

		return _focalPoint - GetForwardDirection() * _distance;
	}

	glm::quat EditorCamera::GetOrientation() const {

		return glm::quat(glm::vec3(-_pitch, -_yaw, 0.0f));
	}
}