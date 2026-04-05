#!/bin/bash

# Stack - Quick API Test Script
# Run this after starting the backend to verify it works

echo "🧪 Testing Stack API..."

API_URL="http://localhost:3001"

# Test 1: Health check
echo ""
echo "1️⃣ Health Check:"
curl -s "$API_URL/api/health" | python3 -m json.tool

# Test 2: Get all players
echo ""
echo "2️⃣ Get All Players:"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$API_URL/api/players")
BODY=$(echo "$RESPONSE" | sed -e 's/HTTP_STATUS:.*//g')
STATUS=$(echo "$RESPONSE" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')
echo "HTTP Status: $STATUS"
echo "$BODY" | python3 -m json.tool | head -20
echo "... ($(echo "$BODY" | python3 -c 'import sys, json; data=json.load(sys.stdin); print(len(data))' 2>/dev/null || echo "error parsing") players total)"

# Test 3: Filter players
echo ""
echo "3️⃣ Filter by Language (RU):"
curl -s "$API_URL/api/players?language=RU" | python3 -c 'import sys, json; data=json.load(sys.stdin); print(f"Found {len(data)} RU players")' 2>/dev/null || echo "Filter test skipped"

# Test 4: Create a player
echo ""
echo "4️⃣ Create Test Player:"
CREATE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL/api/players" \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "TestPlayer123",
    "level": 5,
    "age": 20,
    "language": "EN",
    "role": "Support",
    "style": "Chill",
    "playtime": "18:00-22:00",
    "discord": "@testplayer",
    "bio": "Testing the API"
  }')
CREATE_BODY=$(echo "$CREATE_RESPONSE" | sed -e 's/HTTP_STATUS:.*//g')
CREATE_STATUS=$(echo "$CREATE_RESPONSE" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')
echo "HTTP Status: $CREATE_STATUS"
echo "$CREATE_BODY" | python3 -m json.tool

# Extract the created player ID
PLAYER_ID=$(echo "$CREATE_BODY" | python3 -c 'import sys, json; print(json.load(sys.stdin)["id"])' 2>/dev/null)

if [ -n "$PLAYER_ID" ]; then
  # Test 5: Get single player
  echo ""
  echo "5️⃣ Get Single Player ($PLAYER_ID):"
  curl -s "$API_URL/api/players/$PLAYER_ID" | python3 -m json.tool

  # Test 6: Update player
  echo ""
  echo "6️⃣ Update Player:"
  curl -s -X PUT "$API_URL/api/players/$PLAYER_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "nickname": "UpdatedPlayer",
      "level": 6,
      "age": 21,
      "language": "EN",
      "role": "Support",
      "style": "Tryhard",
      "playtime": "19:00-23:00",
      "discord": "@updatedplayer",
      "bio": "Updated bio"
    }' | python3 -m json.tool

  # Test 7: Delete player
  echo ""
  echo "7️⃣ Delete Player:"
  curl -s -X DELETE "$API_URL/api/players/$PLAYER_ID" | python3 -m json.tool
else
  echo "⚠️  Could not extract player ID, skipping update/delete tests"
fi

echo ""
echo "✅ All tests completed!"
