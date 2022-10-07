#pragma once

#include <glm/glm.hpp>
#include <core/Core.h>

namespace Cober {

	struct IComponent {
	protected:
		static int nextID;
	};

	// Used to assign a unique IDs to a component type
	template <typename T>
	class Component : public IComponent {
	public:
		static int GetID() {
			static auto id = nextID++;
			return id;
		}
	};

	struct Transform {
		Vec2 position = { 0.0f, 0.0f };
		double rotation = 0;
		Vec2 scale = { 0.0f, 0.0f };

		Transform() = default;
		Transform(const Transform&) = default;
		Transform(Vec2 pos, float rot, Vec2 sc)
			: position(pos), rotation(rot), scale(sc) {};
	};

	struct Tag {
		std::string tag;

		Tag() = default;
		Tag(const Tag&) = default;;
		Tag(const std::string& tag) : tag(tag) {};
	};

	struct Rigidbody {
		Vec2 velocity;

		Rigidbody() = default;
		Rigidbody(const Rigidbody&) = default;
		Rigidbody(Vec2 vel) : velocity(vel) {}
	};

	struct Sprite {
		int w, h;
		std::string assetID;
		Vec2 srcRect;

		Sprite() = default;
		Sprite(const Sprite&) = default;
		Sprite(const std::string& ID, int width, int height, Vec2 rect = Vec2(0.0, 0.0))
			: assetID(ID), w(width), h(height), srcRect(rect) {}
	};
}
