#!/bin/bash
# ResearchForge / NicheForge - Easy GitHub Push Script
# This script helps you push the project to GitHub with proper authentication.

echo "=== ResearchForge GitHub Push Helper ==="
echo ""

# Ask for GitHub username if not provided
if [ -z "$1" ]; then
  read -p "Enter your GitHub username: " USERNAME
else
  USERNAME=$1
fi

if [ -z "$USERNAME" ]; then
  echo "Error: GitHub username is required."
  exit 1
fi

REPO_URL="https://github.com/${USERNAME}/nicheforge.git"

echo ""
echo "Target repository: $REPO_URL"
echo ""

# Remove any existing origin remote (clean slate)
git remote remove origin 2>/dev/null || true

# Add the correct remote
git remote add origin "$REPO_URL"

# Ensure we're on main branch
git branch -M main

echo "Remote configured successfully."
echo ""
echo "You will now be asked for your GitHub credentials."
echo "Username: $USERNAME"
echo "Password: Paste your Personal Access Token (it will not be visible)"
echo ""

# Perform the push
git push -u origin main

echo ""
echo "=== Push completed ==="
echo "If successful, your code is now on GitHub."
echo "Next: Go to Netlify → NicheForgeDemo → Site configuration → Build & deploy → Link the repository."
