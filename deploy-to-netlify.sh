#!/bin/bash
# ResearchForge - One-command prep for Netlify deploy
# Run this locally on your machine (not in this sandbox)

echo "=== ResearchForge Netlify Deploy Prep ==="

# 1. Ensure dependencies
npm install

# 2. Production build test (must succeed)
npm run build

if [ $? -ne 0 ]; then
  echo "Build failed. Fix errors before deploying."
  exit 1
fi

echo "Build successful."

# 3. Deploy using Netlify CLI (install if needed: npm i -g netlify-cli)
# You must be logged in: netlify login

echo "To deploy:"
echo "1. netlify login"
echo "2. netlify deploy --prod   # or netlify init first time"

echo "Or connect via Git in Netlify dashboard and push this branch."

echo "=== Done ==="
echo "See DEPLOY.md for full step-by-step with env vars."
