#!/bin/bash
BASE="http://localhost:3000"
PHONE="%2B15551234567"

# 1. Simple text with reply + URL action suggestions
curl -s -X POST "$BASE/v1/phones/$PHONE/agentMessages" \
  -H 'Content-Type: application/json' \
  -d '{
    "messageId": "test-text-1",
    "text": "Hello, welcome to RCStrap test.",
    "suggestions": [
      {"reply": {"text": "Thanks", "postbackData": "reply_thanks"}},
      {"action": {"text": "Visit Site", "postbackData": "action_url", "openUrlAction": {"url": "https://example.com"}}}
    ]
  }'
echo ""

# 2. Rich card standalone vertical with suggestions
curl -s -X POST "$BASE/v1/phones/$PHONE/agentMessages" \
  -H 'Content-Type: application/json' \
  -d '{
    "messageId": "test-richcard-1",
    "richCard": {
      "standaloneCard": {
        "cardOrientation": "VERTICAL",
        "cardContent": {
          "title": "Product Launch",
          "description": "Check out our amazing new product with great features.",
          "media": {"height": "MEDIUM", "contentInfo": {"fileUrl": "/demo.jpg", "forceRefresh": false}},
          "suggestions": [
            {"reply": {"text": "Buy Now", "postbackData": "buy"}},
            {"action": {"text": "Learn More", "postbackData": "learn", "openUrlAction": {"url": "https://example.com/product"}}}
          ]
        }
      }
    }
  }'
echo ""

# 3. Carousel with 3 cards
curl -s -X POST "$BASE/v1/phones/$PHONE/agentMessages" \
  -H 'Content-Type: application/json' \
  -d '{
    "messageId": "test-carousel-1",
    "richCard": {
      "carouselCard": {
        "cardWidth": "MEDIUM",
        "cardContents": [
          {
            "title": "Item A",
            "description": "First carousel item",
            "media": {"height": "SHORT", "contentInfo": {"fileUrl": "/demo.jpg", "forceRefresh": false}},
            "suggestions": [{"reply": {"text": "Select A", "postbackData": "sel_a"}}]
          },
          {
            "title": "Item B",
            "description": "Second carousel item",
            "media": {"height": "SHORT", "contentInfo": {"fileUrl": "/demo.jpg", "forceRefresh": false}},
            "suggestions": [{"reply": {"text": "Select B", "postbackData": "sel_b"}}]
          },
          {
            "title": "Item C",
            "description": "Third carousel item",
            "media": {"height": "SHORT", "contentInfo": {"fileUrl": "/demo.jpg", "forceRefresh": false}},
            "suggestions": [{"action": {"text": "View Map", "postbackData": "map_c", "viewLocationAction": {"latLong": {"latitude": 48.8566, "longitude": 2.3522}, "label": "Paris"}}}]
          }
        ]
      }
    }
  }'
echo ""

# 4. Text with all action types as suggestions
curl -s -X POST "$BASE/v1/phones/$PHONE/agentMessages" \
  -H 'Content-Type: application/json' \
  -d '{
    "messageId": "test-actions-1",
    "text": "Try all these actions:",
    "suggestions": [
      {"action": {"text": "Call Us", "postbackData": "dial", "dialAction": {"phoneNumber": "+15559876543"}}},
      {"action": {"text": "Find Us", "postbackData": "loc", "viewLocationAction": {"latLong": {"latitude": 40.7128, "longitude": -74.006}, "label": "NYC Office"}}},
      {"action": {"text": "Share Location", "postbackData": "share_loc", "shareLocationAction": {}}},
      {"action": {"text": "Add Event", "postbackData": "cal", "createCalendarEventAction": {"title": "Meeting", "description": "Team sync", "startTime": "2026-03-01T10:00:00.000Z", "endTime": "2026-03-01T11:00:00.000Z"}}}
    ]
  }'
echo ""

# 5. Auth traffic type
curl -s -X POST "$BASE/v1/phones/$PHONE/agentMessages" \
  -H 'Content-Type: application/json' \
  -d '{
    "messageId": "test-auth-1",
    "text": "Your verification code is 483291",
    "trafficType": "AUTHENTICATION"
  }'
echo ""

# 6. Transaction traffic type
curl -s -X POST "$BASE/v1/phones/$PHONE/agentMessages" \
  -H 'Content-Type: application/json' \
  -d '{
    "messageId": "test-txn-1",
    "text": "Payment of $49.99 confirmed. Order #12345.",
    "trafficType": "TRANSACTION"
  }'
echo ""

# 7. Promo traffic type
curl -s -X POST "$BASE/v1/phones/$PHONE/agentMessages" \
  -H 'Content-Type: application/json' \
  -d '{
    "messageId": "test-promo-1",
    "text": "Flash sale: 50% off everything today only.",
    "trafficType": "PROMOTION",
    "suggestions": [
      {"action": {"text": "Shop Now", "postbackData": "shop", "openUrlAction": {"url": "https://example.com/sale"}}}
    ]
  }'
echo ""

# 8. Horizontal rich card
curl -s -X POST "$BASE/v1/phones/$PHONE/agentMessages" \
  -H 'Content-Type: application/json' \
  -d '{
    "messageId": "test-hcard-1",
    "richCard": {
      "standaloneCard": {
        "cardOrientation": "HORIZONTAL",
        "cardContent": {
          "title": "Horizontal Layout",
          "description": "This card uses horizontal orientation with media on the side.",
          "media": {"height": "MEDIUM", "contentInfo": {"fileUrl": "/demo.jpg", "forceRefresh": false}},
          "suggestions": [
            {"reply": {"text": "Nice", "postbackData": "nice"}}
          ]
        }
      }
    }
  }'
echo ""

# 9. Media only (image)
curl -s -X POST "$BASE/v1/phones/$PHONE/agentMessages" \
  -H 'Content-Type: application/json' \
  -d '{
    "messageId": "test-media-img",
    "contentInfo": {"fileUrl": "/demo.jpg", "forceRefresh": false}
  }'
echo ""

# 10. Media only (video)
curl -s -X POST "$BASE/v1/phones/$PHONE/agentMessages" \
  -H 'Content-Type: application/json' \
  -d '{
    "messageId": "test-media-vid",
    "contentInfo": {"fileUrl": "/demo.mp4", "forceRefresh": false}
  }'
echo ""

# 11. TTL message
curl -s -X POST "$BASE/v1/phones/$PHONE/agentMessages" \
  -H 'Content-Type: application/json' \
  -d '{
    "messageId": "test-ttl-1",
    "text": "This message has a TTL of 60 seconds.",
    "ttl": "60s"
  }'
echo ""

# 12. Message to a second phone number
curl -s -X POST "$BASE/v1/phones/%2B15559999999/agentMessages" \
  -H 'Content-Type: application/json' \
  -d '{
    "messageId": "test-phone2-1",
    "text": "Hello second user, this is a separate conversation.",
    "suggestions": [
      {"reply": {"text": "Hi there", "postbackData": "hi"}}
    ]
  }'
echo ""

echo "All test messages sent."
