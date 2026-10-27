# Bundled fonts

`inter-latin-wght-normal.woff2` — Inter variable, Latin subset, weights 100–900.
Taken from the `@fontsource-variable/inter` npm package (v5) and committed here on
purpose: the build must not depend on reaching Google's servers.

Inter is licensed under the SIL Open Font License 1.1 — see `LICENSE`. The license
must ship with any site built from this kit that serves the font file.

Chinese is deliberately **not** bundled. It falls through to the platform system
font stack defined in `../tailwind-preset.ts`.
