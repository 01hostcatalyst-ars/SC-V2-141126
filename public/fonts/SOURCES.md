# Bundled web fonts

The root layout uses `next/font/local` so builds do not depend on Google Fonts network responses.

- **Inter**: existing variable `Inter.woff2`, weight range 100–900. See `Inter-LICENSE.txt`.
- **Plus Jakarta Sans**: normal variable font, weight range 200–800, from the [official Google Fonts repository](https://github.com/google/fonts/tree/main/ofl/plusjakartasans). See `PlusJakartaSans-LICENSE.txt`.
- **JetBrains Mono**: normal variable font, weight range 100–800, from the [official Google Fonts repository](https://github.com/google/fonts/tree/main/ofl/jetbrainsmono). See `JetBrainsMono-LICENSE.txt`.

The font families, CSS variables, and display roles are preserved. Fonts are bundled with the application and served from the deployment's own domain.
