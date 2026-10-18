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
| `CNAME`, `.nojekyll` | GitHub Pages: custom domain and plain static serving (no Jekyll) |

The early access form posts to Formspree (the endpoint is the form's `action`).

## Deploy

GitHub Pages serves the `main` branch at hypermonitor.net; every push to `main` goes live in a minute or two.
