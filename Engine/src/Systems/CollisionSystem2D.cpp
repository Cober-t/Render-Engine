#include "pch.h"

#include "CollisionSystem2D.h"

#include "Events/Events.h"
#include "Events/EventHandler.h"

namespace Cober {

	CollisionSystem2D::CollisionSystem2D() {

		RequireComponent<Transform>();
		RequireComponent<BoxCollider2D>();  // Make a generic collision system

	}

	CollisionSystem2D::~CollisionSystem2D() {

	}

    struct EntitiesOnCollision {
        Entity a;
        Entity b;
    };

    void CollisionSystem2D::Update() {

        auto entities = GetSystemEntities();

        for (auto i = entities.begin(); i != entities.end(); i++) {
            Entity a = *i;

            auto& a_trans = a.GetComponent<Transform>();
            auto& a_coll = a.GetComponent<BoxCollider2D>();
            
            // Loop all the entities that still need to be checked (to the right of i)
            for (auto j = i; j != entities.end(); j++) {
                Entity b = *j;
            
                if (a == b)
                    continue;
            
                auto b_trans = b.GetComponent<Transform>();
                auto b_coll = b.GetComponent<BoxCollider2D>();
            
                // Perform the AABB collision check between entities a and b
                bool collisionHappened = CheckAABBCollision(
                    a_trans.position, a_trans.scale, a_coll.offset, a_coll.size,
                    b_trans.position, b_trans.scale, b_coll.offset, b_coll.size
                );

                if (collisionHappened)
                    EventHandler::Get().DispatchEvent<CollisionEvent>(a, b);
            }
        }
    }

    // Review the calculation of the BoxCollider2D size
    bool CollisionSystem2D::CheckAABBCollision(glm::vec3 A_pos, glm::vec3 A_size, glm::vec2 A_CollOffset, glm::vec2 A_CollSize,
                                               glm::vec3 B_pos, glm::vec3 B_size, glm::vec2 B_CollOffset, glm::vec2 B_CollSize) {

        // For calculate position of the Axis Aligned from center
        float A_halfSizeX = (A_size.x * A_CollSize.x) / 2.0f;
        float A_halfSizeY = (A_size.y * A_CollSize.y) / 2.0f;
        float B_halfSizeX = (B_size.x * B_CollSize.x) / 2.0f;
        float B_halfSizeY = (B_size.y * B_CollSize.y) / 2.0f;
        return (
            (A_pos.x + A_CollOffset.x) - A_halfSizeX < (B_pos.x  + B_CollOffset.x) + B_halfSizeX &&
            (A_pos.x + A_CollOffset.x) + A_halfSizeX > (B_pos.x  + B_CollOffset.x) - B_halfSizeX &&
            (A_pos.y + A_CollOffset.y) - A_halfSizeY < (B_pos.y  + B_CollOffset.y) + B_halfSizeY &&
            (A_pos.y + A_CollOffset.y) + A_halfSizeY > (B_pos.y  + B_CollOffset.y) - B_halfSizeY
        );
    }
}