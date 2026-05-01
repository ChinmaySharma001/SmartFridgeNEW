# Contributing to SmartFridge

Thanks for helping improve SmartFridge.

## Before you start
- Read the root `README.md`, `Frontend/README.md`, and `backend/README.md`.
- Keep changes focused and avoid unrelated refactors.
- Do not commit secrets, uploads, build artifacts, or model weights.

## Recommended workflow
1. Create a branch from `main`.
2. Make your changes in the smallest useful commit.
3. Run the relevant checks:
   - Frontend: `cd Frontend && npm run build`
   - Backend: start the backend and verify the affected endpoint
4. Update docs if behavior changes.
5. Open a pull request with a short summary and validation notes.

## Code style
- Match the existing code style in each folder.
- Prefer explicit names and small helpers.
- Keep API contracts aligned between frontend and backend.

## Reporting issues
Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Any error output or screenshots
