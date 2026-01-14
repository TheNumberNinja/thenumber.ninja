#!/bin/bash
#
# Netlify build ignore script
# Returns exit code 0 to SKIP the build, exit code 1 to PROCEED with the build
#
# Usage in netlify.toml:
#   ignore = "./scripts/should-build.sh"
#

set -euo pipefail

echo "=== Netlify Build Change Detection ==="
echo "COMMIT_REF: ${COMMIT_REF:-<not set>}"
echo "CACHED_COMMIT_REF: ${CACHED_COMMIT_REF:-<not set>}"

# If CACHED_COMMIT_REF is not set or empty, we should build
if [ -z "${CACHED_COMMIT_REF:-}" ]; then
    echo "No cached commit reference found (first build or cache cleared)"
    echo "Decision: BUILD"
    exit 1
fi

# If both refs are the same, no need to build
if [ "$CACHED_COMMIT_REF" = "$COMMIT_REF" ]; then
    echo "Commit refs are identical, no changes"
    echo "Decision: SKIP"
    exit 0
fi

# Check if the cached commit exists in the repo
if ! git cat-file -e "$CACHED_COMMIT_REF" 2>/dev/null; then
    echo "Cached commit $CACHED_COMMIT_REF not found in repo (shallow clone or force push?)"
    echo "Decision: BUILD"
    exit 1
fi

# Check for changes in the current directory (web/ due to base setting)
echo "Checking for changes between $CACHED_COMMIT_REF and $COMMIT_REF in current directory..."

if git diff --quiet "$CACHED_COMMIT_REF" "$COMMIT_REF" -- .; then
    echo "No changes detected in web directory"
    echo "Decision: SKIP"
    exit 0
else
    echo "Changes detected in web directory:"
    git diff --name-only "$CACHED_COMMIT_REF" "$COMMIT_REF" -- . | head -20
    TOTAL_CHANGES=$(git diff --name-only "$CACHED_COMMIT_REF" "$COMMIT_REF" -- . | wc -l | tr -d ' ')
    if [ "$TOTAL_CHANGES" -gt 20 ]; then
        echo "... and $((TOTAL_CHANGES - 20)) more files"
    fi
    echo "Decision: BUILD"
    exit 1
fi
