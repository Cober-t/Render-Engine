#pragma once

#include <xhash> // For generating Universal Unique Identifiers
#include <random>
namespace Cober {

	static std::random_device _randomDevice;
	static std::mt19937_64	  _engine(_randomDevice());
	static std::uniform_int_distribution<uint64_t> _uniformDistribution;

	class UUID {
	public:
		UUID() { _UUID = _uniformDistribution(_engine); }
		UUID(uint64_t uuid)		{ _UUID = uuid;			}
		UUID(const UUID& other) { _UUID = other._UUID;	}

		operator uint64_t() { return _UUID; }
		operator const uint64_t() { return _UUID; }
	private:
		uint64_t _UUID;
	};
}
//
//namespace std {
//	
//	// Specialization
//	template<>
//	struct hash<Cober::UUID> {
//		std::size_t operator()(const Cober::UUID& uuid) const {
//			return hash<uint64_t>()((uint64_t)uuid);
//		}
//	};
//}

#include <glm/glm.hpp>
#include <core/Core.h>

namespace Cober {
	
	// ++++++++++++++++++++++++++++++++++++++++++++++++
	// ID's for componentes
	struct IComponent {
	protected:
		static int nextID;
	};

	// Used to assign an index(ID) to a component type
	template <typename T>
	class Component : public IComponent {
	public:
		static int GetID() {
			static auto id = nextID++;
			return id;
		}
	};

	// ++++++++++++++++++++
	// Universal Unique Identifier for entities
	struct IDComponent {
		UUID ID;

		IDComponent() = default;
		IDComponent(const IDComponent&) = default;
	};


	// ++++++++++++++++++++
	// Components for entities
	struct Transform {
		glm::vec2 position = { 0.0f, 0.0f };
		double rotation = 0;
		glm::vec2 scale = { 0.0f, 0.0f };

		Transform() = default;
		Transform(const Transform&) = default;
		Transform(glm::vec2 pos, float rot, glm::vec2 sc)
			: position(pos), rotation(rot), scale(sc) {};
	};

	struct Tag {
		std::string tag;

		Tag() = default;
		Tag(const Tag&) = default;;
		Tag(const std::string& tag) : tag(tag) {};
	};

	struct Rigidbody {
		glm::vec2 velocity;

		Rigidbody() = default;
		Rigidbody(const Rigidbody&) = default;
		Rigidbody(glm::vec2 vel) : velocity(vel) {}
	};

	struct Sprite {
		int w, h;
		std::string assetID;
		glm::vec2 srcRect;

		Sprite() = default;
		Sprite(const Sprite&) = default;
		Sprite(const std::string& ID, int width, int height, glm::vec2 rect = glm::vec2(0.0, 0.0))
			: assetID(ID), w(width), h(height), srcRect(rect) {}
	};
}
