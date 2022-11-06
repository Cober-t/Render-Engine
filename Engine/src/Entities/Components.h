#pragma once

#ifndef __EMSCRIPTEN__
	#include <xhash> // For generating Universal Unique Identifiers
#endif
#include <random>
#include <box2D/b2_polygon_shape.h>
#include <glm/glm.hpp>

#include "core/Core.h"
#include "core/UUID.h"
#include "Render/Texture.h"

namespace Cober {
	
	// ++++++++++++++++++++++++++++++++++++++++++++++++
	// ID's for componentes
	struct IComponent {
	protected:
		static int nextIndex;
	};

	// Used to assign an index(ID) to a component type
	template <typename T>
	class Component : public IComponent {
	public:
		static int GetComponentIndex() {
			static int index = nextIndex++;
			return index;
		}
	};

	// ++++++++++++++++++++
	// Universal Unique Identifier for entities
	struct IDComponent {
		UUID ID;

		IDComponent() = default;
		IDComponent(const IDComponent&) = default;
		IDComponent(const UUID& id) : ID(id) {}
	};


	// ++++++++++++++++++++
	// Components for entities
	struct Transform {
		glm::vec3 position	= { 0.0f, 0.0f, 0.0f };
		glm::vec3 rotation	= { 0.0f, 0.0f, 0.0f };
		glm::vec3 scale		= { 1.0f, 1.0f, 1.0f };

		Transform() = default;
		Transform(const Transform&) = default;
		Transform(glm::vec3 pos, glm::vec3 rot = glm::vec3(0.0f), glm::vec3 sc = glm::vec3(1.0f))
			: position(pos), rotation(rot), scale(sc) {};
	};

	struct Tag {
		std::string tag;

		Tag() = default;
		Tag(const Tag&) = default;;
		Tag(const std::string& tag) : tag(tag) {};
	};

	struct Sprite {
		int w, h;
		std::string assetID;
		glm::vec4 color{ 1.0f };
		Ref<Texture> texture = nullptr;

		Sprite() = default;
		Sprite(const Sprite&) = default;
		Sprite(const std::string& ID, int width, int height, glm::vec4 tintColor = glm::vec4(1.0f))
			: assetID(ID), w(width), h(height), color(tintColor) {}
	};

	enum class BodyType { Static = 0, Kinematic, Dynamic };
	struct Rigidbody2D {
		glm::vec2 velocity;
		bool fixedRotation = false;

		BodyType type = BodyType::Static;

		void* runtimeBody;

		Rigidbody2D() = default;
		Rigidbody2D(const Rigidbody2D&) = default;
	};

	//class b2Shape;
	struct BoxCollider2D {
		glm::vec2 offset = { 0.0f, 0.0f };
		glm::vec2 size =   { 0.0f, 0.0f };

		b2Shape* body;
		b2PolygonShape shape;

		// Make a physics material maybe
		float density = 1.0f;
		float friction = 0.5f;
		float restitution = 0.0f;
		float restitutionThreshold = 0.5f;

		// Storage for runtime
		void* runtimeFixture = nullptr;

		BoxCollider2D() = default;
		BoxCollider2D(const BoxCollider2D&) = default;
	};
}
