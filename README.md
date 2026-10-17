# FoodTrack

Seguimiento de calorías y macros, con una sección de "Nevera" que sugiere
combinaciones de comida saciantes a partir de lo que tienes en casa, ajustadas
a las calorías y macros que te quedan en el día.

App 100% estática (React + TypeScript + Vite), sin backend: todos los datos se
guardan en el propio navegador (`localStorage`). Publicada en GitHub Pages.

🔗 **App en producción:** https://amarchanh.github.io/food-track/

## Funcionalidades

- **Registro diario**: añade alimentos por desayuno/comida/cena/snack,
  buscando en la base de datos pública de [Open Food Facts](https://world.openfoodfacts.org/)
  (como MyFitnessPal, sin necesidad de API key) o creándolos manualmente.
- **Objetivos**: define tus calorías diarias y el reparto de macros (%
  proteína/carbohidratos/grasas), con presets habituales (equilibrado, alta
  proteína, low carb...).
- **Nevera**: añade los alimentos que tienes disponibles y genera una
  propuesta de combinación que maximiza la saciedad (prioriza proteína y
  fibra) ajustándose a lo que te queda de calorías y macros ese día.
- **Historial**: consulta los días anteriores registrados.
- **Instalable como app en iPhone**: es una PWA, se añade a la pantalla de
  inicio desde Safari y funciona a pantalla completa, sin barra de navegador.

## Instalar en iPhone

1. Abre https://amarchanh.github.io/food-track/ en **Safari** (no en Chrome).
2. Pulsa el botón de **Compartir** (el cuadrado con la flecha hacia arriba).
3. Elige **"Añadir a pantalla de inicio"**.
4. Listo: queda instalada como una app normal, con su icono, a pantalla
   completa.

## Desarrollo

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # build de producción en dist/
npm run preview   # sirve el build de producción localmente
```

## Despliegue

El push a `main` dispara `.github/workflows/deploy.yml`, que compila el
proyecto y lo publica en GitHub Pages automáticamente. La primera vez hay que
activar Pages en el repo: **Settings → Pages → Source → GitHub Actions**.

El proyecto se sirve desde `/food-track/` (ver `base` en `vite.config.ts`); si
cambias el nombre del repositorio, actualiza esa constante.

## Notas técnicas

- Estado persistido con `zustand` + `localStorage` (sin servidor).
- Búsqueda de alimentos contra la API pública de Open Food Facts.
- PWA (manifest + service worker) vía `vite-plugin-pwa`.
- Los iconos de la app se generan con `scripts/generate-icons.cjs` (PNG puro,
  sin dependencias nativas) — ejecútalo de nuevo si quieres cambiar el diseño.
