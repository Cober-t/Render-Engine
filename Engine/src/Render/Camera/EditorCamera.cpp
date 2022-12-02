#include "pch.h"
#include "EditorCamera.h"

#include "core/Application.h"
#include "Render/RenderGlobals.h"

#define GLM_ENABLE_EXPERIMENTAL
#include <glm/gtx/quaternion.hpp>

namespace Cober {

	EditorCamera::EditorCamera(float fov, float aspectRatio, float nearClip, float farClip)
	{
		_orthoCamera.SetValues(fov, aspectRatio, nearClip, farClip);
		_perspCamera.SetValues(fov, aspectRatio, nearClip, farClip);
		UpdateView();
	}

	EditorCamera::~EditorCamera() {

		LOG_INFO("Editor Camera Destroyed!!");
	}

	void EditorCamera::UpdateProjection(bool& ortho) {

		orthoProjection = ortho;

		if (ortho) {
			_orthoCamera.aspectRatio = _viewportWidth / _viewportHeight;
			_projection = glm::ortho(-_orthoCamera.aspectRatio * _orthoCamera.distance, // Left
									  _orthoCamera.aspectRatio * _orthoCamera.distance,	// Right
									 -_orthoCamera.distance, _orthoCamera.distance, 	// Bottom & Top
									  _orthoCamera.nearClip, _orthoCamera.farClip);		// Near & Far
		}
		else {
			_perspCamera.aspectRatio = _viewportWidth / _viewportHeight;
			_projection = glm::perspective(glm::radians(_perspCamera.fov),
										   _perspCamera.aspectRatio, 
										   _perspCamera.nearClip, 
										   _perspCamera.farClip);
		}
	}

	void EditorCamera::UpdateView() {


		if (orthoProjection) {
			_orthoCamera.position = CalculatePosition();
			glm::mat4 transform = glm::translate(glm::mat4(1.0f), _orthoCamera.position) * glm::rotate(glm::mat4(1.0f), 0.0f, glm::vec3(0, 0, 1));
			_viewMatrix = glm::inverse(transform);
		}
		else {
			// _yaw = _pitch = 0.0f;	// Lock the camera's rotation
			_perspCamera.position = CalculatePosition();
			glm::quat orientation = GetOrientation();
			_viewMatrix = glm::translate(glm::mat4(1.0f), _perspCamera.position) * glm::toMat4(orientation);
			_viewMatrix = glm::inverse(_viewMatrix);
		}
	}

	void EditorCamera::RenderSkybox(glm::vec4 color) {

		RenderGlobals::SetClearColor(color.x, color.y, color.z, color.w);
		RenderGlobals::Clear();
	}
	
	std::pair<float, float> EditorCamera::PanSpeed() const {

		float x = std::min(_viewportWidth  / 1000.0f, 2.4f); // max = 2.4f
		float y = std::min(_viewportHeight / 1000.0f, 2.4f); // max = 2.4f

		float xFactor = 0.05f * (x * x) - 0.1778f * x + 0.3021f;
		float yFactor = 0.05f * (y * y) - 0.1778f * y + 0.3021f;

		return { xFactor, yFactor };
	}

	float EditorCamera::RotationSpeed() const {

		return 0.8f;
	}

	float EditorCamera::ZoomSpeed() const 
	{
		float currentDistance = orthoProjection == true ? _orthoCamera.distance : _perspCamera.distance;
		float distance = currentDistance * 0.2f;
		distance = std::max(distance, 0.0f);
		float speed = distance * distance;
		speed = std::min(speed, 100.0f);	// max speed = 100

		return speed;
	}

	void EditorCamera::OnUpdate(Ref<Timestep> ts) {

		//std::cout << "FocalPoint: " << _focalPoint.x << " " << _focalPoint.y << " " << _focalPoint.z << std::endl;
		//std::cout << "Position: " << _position.x << " " << _position.y << " " << _position.z << std::endl;
		//std::cout << "Pitch : " << _pitch << std::endl;
		//std::cout << "Yaw : " << _yaw << std::endl;
		UpdateView();
	}
	
	void EditorCamera::OnEvent(SDL_Event& event) {
	
		const Uint8* keyStateArray   = SDL_GetKeyboardState(NULL);

#ifdef __EMSCRIPTEN__ 	// Provisional till make a Camera System
		_viewportFocused = true;
#endif
#ifdef __OPENGLES3__ 	// Provisional till make a Camera System
		_viewportFocused = true;
#endif

		_viewportFocused = true;
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
			else if (!orthoProjection && m->button == SDL_BUTTON(SDL_BUTTON_LEFT))
				MouseRotate(delta);
			else if (m->button == SDL_BUTTON(SDL_BUTTON_RIGHT))
				MouseZoom(delta.y);
		}
		if (!orthoProjection && _viewportFocused && event.type == SDL_MOUSEWHEEL)
			OnMouseScroll(event.wheel);
	}

	void EditorCamera::OnMouseScroll(SDL_MouseWheelEvent& event)
	{
		float delta = event.preciseY * 0.1f;
		MouseZoom(delta);
		UpdateView();
	}

	void EditorCamera::MousePan(const glm::vec2& delta)
	{
		auto [xSpeed, ySpeed] = PanSpeed();

		if (orthoProjection) {
			_orthoCamera.focalPoint += -GetRightDirection() * delta.x * xSpeed * 3.0f * _orthoCamera.distance;
			_orthoCamera.focalPoint += GetUpDirection() * delta.y * ySpeed * 3.0f * _orthoCamera.distance;
		}
		else {
			_perspCamera.focalPoint += -GetRightDirection() * delta.x * xSpeed * _perspCamera.distance;
			_perspCamera.focalPoint += GetUpDirection() * delta.y * ySpeed * _perspCamera.distance;
		}
#ifdef __EMSCRITEN__	// Emscripten Test
		int mouseX, mouseY;
		SDL_GetMouseState(&mouseX, &mouseY);
		std::cout << "MouxeX: " << mouseX << "\t MouseY: " << mouseY << std::endl;
#endif
	}

	void EditorCamera::MouseRotate(const glm::vec2& delta)
	{
		float yawSign = GetUpDirection().y < 0 ? -1.0f : 1.0f;

		if (orthoProjection) {
			_orthoCamera.yaw += yawSign * delta.x * RotationSpeed();
			_orthoCamera.pitch += delta.y * RotationSpeed();
		}
		else {
			_perspCamera.yaw += yawSign * delta.x * RotationSpeed();
			_perspCamera.pitch += delta.y * RotationSpeed();
		}
	}

	void EditorCamera::MouseZoom(float delta)
	{
		if (orthoProjection) {
			_orthoCamera.distance -= delta * ZoomSpeed();
			if (_orthoCamera.distance < 1.0f) {
				_orthoCamera.focalPoint += GetForwardDirection();
				_orthoCamera.distance = 1.0f;
			}
		} else {
			_perspCamera.distance -= delta * ZoomSpeed();
			if (_perspCamera.distance < 1.0f) {
				_perspCamera.focalPoint += GetForwardDirection();
				_perspCamera.distance = 1.0f;
			}
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

		return orthoProjection == true ? _orthoCamera.focalPoint - GetForwardDirection() * _orthoCamera.distance
									   : _perspCamera.focalPoint - GetForwardDirection() * _perspCamera.distance;
	}

	glm::quat EditorCamera::GetOrientation() const {

		float newPitch = orthoProjection == true ? _orthoCamera.pitch : _perspCamera.pitch;
		float newYaw   = orthoProjection == true ? _orthoCamera.yaw   : _perspCamera.yaw;
		float newRoll  = orthoProjection == true ? _orthoCamera.roll  : _perspCamera.roll;

		return glm::quat(glm::vec3(-newPitch, -newYaw, newRoll));
	}

	const glm::vec3& EditorCamera::GetPosition() const {

		return orthoProjection == true ? _orthoCamera.position : _perspCamera.position;
	}

	float EditorCamera::GetDistance() const {

		return orthoProjection == true ? _orthoCamera.distance : _perspCamera.distance;
	}

	void EditorCamera::SetDistance(float distance) { 

		if (orthoProjection)
			_orthoCamera.distance = distance; 
		else
			_perspCamera.distance = distance;
	}

	float EditorCamera::GetPitch() const {

		return orthoProjection == true ? _orthoCamera.pitch : _perspCamera.pitch;
	}

	float EditorCamera::GetYaw() const { 

		return orthoProjection == true ? _orthoCamera.yaw : _perspCamera.yaw;
	}

	float EditorCamera::GetRoll() const {

		return orthoProjection == true ? _orthoCamera.roll : _perspCamera.roll;
	}
}