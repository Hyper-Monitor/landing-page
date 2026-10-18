# Hypermonitor landing page

The site at [hypermonitor.net](https://hypermonitor.net): plain HTML, CSS and JavaScript, no build step, in English, Spanish and Portuguese.

## Run locally

```bash
python3 -m http.server 4321
```

Then open http://localhost:4321. Add `?lang=pt-BR` or `?lang=es` to switch the language.

## Files

| File | What it is |
|---|---|
| `index.html` | The page. English text ships in the HTML |
| `i18n.js` | Strings in English, Portuguese (Brazil) and Spanish; picks `?lang=`, then the saved choice, then the browser language |
| `main.js` | Language switch, logo messages, video toggle, carousel, diagnosis demo and the early access form |
| `styles.css` | Design tokens and sections |
| `404.html` | Not found page |
| `assets/` | Video, poster, screenshot, favicon and social card |
| `netlify.toml`, `build.sh` | Netlify build: copies the site files into `_site` and sets security and cache headers |

The early access form is handled by Netlify Forms. Running locally, the form shows its error message because the local server does not accept the POST.

## Deploy

Every push to `main` deploys to Netlify.
