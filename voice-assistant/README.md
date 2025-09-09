## Voice Command Shopping Assistant

Voice-based shopping list with NLP, multilingual voice input, and smart suggestions.

Getting started:

```bash
npm install
npm run dev
```

Features:
- Voice commands to add/remove/update items
- NLP parsing of quantities and searches (e.g., "find apples under $5")
- Multilingual detection baseline via `franc` (SR uses browser language)
- Smart suggestions from history, seasonal items, and substitutes
- Minimal mobile-friendly UI with visual feedback

Deployment:
- Static deploy: `npm run build` and host `dist/` (Vercel/Netlify/AWS S3 + CloudFront).

Approach (≤200 words):
The app uses the Web Speech API for voice input and `compromise` for simple intent parsing into add, remove, update-quantity, and search actions. A reducer store persists the list and a lightweight categorizer groups items. `franc` detects language from utterances to support multilingual scenarios (browsers still gate SR by supported locales). Smart suggestions combine recent history, seasonal heuristics, and simple substitution maps. The UI is minimal with clear feedback of recognized speech and actions. Everything runs client-side for simplicity and deploys as static assets.
