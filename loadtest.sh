#!/bin/bash
set -euo pipefail

BASE="${1:-http://localhost:3000}"
TOTAL=10000
CONCURRENCY=50
COUNT=0
ERRORS=0
START=$(date +%s)

PHONES=(
  "%2B15551000001" "%2B15551000002" "%2B15551000003" "%2B15551000004" "%2B15551000005"
  "%2B15551000006" "%2B15551000007" "%2B15551000008" "%2B15551000009" "%2B15551000010"
)

TRAFFIC_TYPES=("AUTHENTICATION" "TRANSACTION" "PROMOTION" "SERVICEREQUEST" "ACKNOWLEDGEMENT")

send_message() {
  local i=$1
  local phone=${PHONES[$((RANDOM % ${#PHONES[@]}))]}
  local type=$((RANDOM % 5))

  case $type in
  0) # text
    BODY="{\"messageId\":\"lt-$i\",\"text\":\"Load test message $i with random data ${RANDOM}${RANDOM}\"}"
    ;;
  1) # text with suggestions
    BODY="{\"messageId\":\"lt-$i\",\"text\":\"Message $i\",\"suggestions\":[{\"reply\":{\"text\":\"OK\",\"postbackData\":\"ok-$i\"}}]}"
    ;;
  2) # text with traffic type
    local tt=${TRAFFIC_TYPES[$((RANDOM % ${#TRAFFIC_TYPES[@]}))]}
    BODY="{\"messageId\":\"lt-$i\",\"text\":\"Message $i code ${RANDOM}\",\"trafficType\":\"$tt\"}"
    ;;
  3) # rich card
    BODY="{\"messageId\":\"lt-$i\",\"richCard\":{\"standaloneCard\":{\"cardOrientation\":\"VERTICAL\",\"cardContent\":{\"title\":\"Card $i\",\"description\":\"Load test card ${RANDOM}\",\"media\":{\"height\":\"SHORT\",\"contentInfo\":{\"fileUrl\":\"/demo.jpg\",\"forceRefresh\":false}}}}}}"
    ;;
  4) # carousel
    BODY="{\"messageId\":\"lt-$i\",\"richCard\":{\"carouselCard\":{\"cardWidth\":\"MEDIUM\",\"cardContents\":[{\"title\":\"A-$i\",\"description\":\"First\",\"media\":{\"height\":\"SHORT\",\"contentInfo\":{\"fileUrl\":\"/demo.jpg\",\"forceRefresh\":false}}},{\"title\":\"B-$i\",\"description\":\"Second\",\"media\":{\"height\":\"SHORT\",\"contentInfo\":{\"fileUrl\":\"/demo.jpg\",\"forceRefresh\":false}}}]}}}"
    ;;
  esac

  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/v1/phones/$phone/agentMessages" \
    -H 'Content-Type: application/json' \
    -d "$BODY" --max-time 10 2>/dev/null) || status="000"

  if [ "$status" != "201" ] && [ "$status" != "200" ]; then
    echo "$status" # signal error
  fi
}

echo "Load test: $TOTAL messages @ concurrency $CONCURRENCY -> $BASE"
echo "---"

BATCH=$CONCURRENCY
TMPDIR_LT=$(mktemp -d)
trap "rm -rf $TMPDIR_LT" EXIT

while [ $COUNT -lt $TOTAL ]; do
  REMAINING=$((TOTAL - COUNT))
  [ $BATCH -gt $REMAINING ] && BATCH=$REMAINING

  pids=()
  for ((j = 0; j < BATCH; j++)); do
    IDX=$((COUNT + j))
    send_message $IDX >"$TMPDIR_LT/$IDX" 2>/dev/null &
    pids+=($!)
  done

  for pid in "${pids[@]}"; do
    wait "$pid" || true
  done

  for ((j = 0; j < BATCH; j++)); do
    IDX=$((COUNT + j))
    if [ -s "$TMPDIR_LT/$IDX" ]; then
      ERRORS=$((ERRORS + 1))
    fi
    rm -f "$TMPDIR_LT/$IDX"
  done

  COUNT=$((COUNT + BATCH))

  if ((COUNT % 1000 == 0)); then
    NOW=$(date +%s)
    ELAPSED=$((NOW - START))
    [ $ELAPSED -eq 0 ] && ELAPSED=1
    RPS=$((COUNT / ELAPSED))
    echo "  $COUNT / $TOTAL  (${RPS} msg/s, ${ERRORS} errors)"
  fi
done

END=$(date +%s)
ELAPSED=$((END - START))
[ $ELAPSED -eq 0 ] && ELAPSED=1
RPS=$((TOTAL / ELAPSED))

echo "---"
echo "Done: $TOTAL messages in ${ELAPSED}s (${RPS} msg/s, ${ERRORS} errors)"
