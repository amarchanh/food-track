# FoodTrack

Seguimiento de calorías y macros, con una sección de "Nevera" que sugiere
combinaciones de comida saciantes a partir de lo que tienes en casa, ajustadas
a las calorías y macros que te quedan en el día.

App 100% estática (React + TypeScript + Vite), sin backend: todos los datos se
guardan en el propio navegador (`localStorage`). Publicada en GitHub Pages.

🔗 **App en producción:** https://amarchanh.github.io/food-track/

## Acceso

La app pide usuario y contraseña antes de mostrar nada (ver `src/auth/`).
**No es seguridad real**: al ser una SPA estática en GitHub Pages público, el
código de comprobación lo puede leer o sortear cualquiera con las
herramientas de desarrollador del navegador. Solo sirve para que no entre
cualquiera que encuentre el enlace por casualidad (buscadores, etc.).

La contraseña no se guarda en texto plano en el repo, solo su hash SHA-256
con sal. Para cambiarla, genera un nuevo hash y sustitúyelo en
`src/auth/credentials.ts`:

```bash
node -e "
const c = require('crypto')
const salt = 'ft_' + c.randomBytes(4).toString('hex')
const hash = c.createHash('sha256').update(salt + 'TU_NUEVA_CONTRASEÑA').digest('hex')
console.log({ salt, hash })
"
```

## Funcionalidades

- **Registro diario**: añade alimentos por desayuno/comida/cena/snack,
  buscando en una base de datos local de alimentos comunes (`src/data/foods.ts`),
  **escaneando el código de barras** de un producto envasado (cámara del
  móvil + búsqueda en Open Food Facts, incluye muchos productos Hacendado,
  Mercadona, Lidl...) o creándolos manualmente.
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
- Búsqueda de alimentos: base de datos local embebida (`src/search/foodSearch.ts`
  + `src/data/foods.ts`), no una API externa. Se intentó usar la API pública de
  Open Food Facts, pero sus endpoints de búsqueda (`cgi/search.pl`,
  `api/v2/search`) empezaron a devolver 503 de forma generalizada, y su
  sustituto (`search.openfoodfacts.org`) no envía cabeceras CORS, así que no
  se puede llamar desde el navegador de una web estática sin un backend/proxy
  propio. Si falta algún alimento, se añade con "Añadir alimento manualmente"
  o ampliando `src/data/foods.ts`.
- **Escáner de código de barras** (`src/components/BarcodeScanner.tsx` +
  `src/search/barcodeLookup.ts`): usa la cámara vía `@zxing/browser` (no el
  `BarcodeDetector` nativo, que Safari no soporta) y consulta el producto por
  su código exacto en `GET /api/v2/product/{barcode}.json` de Open Food
  Facts — ese endpoint concreto sí sigue funcionando con CORS correcto,
  aunque sus endpoints de *búsqueda* no. No es una integración con las webs
  de Lidl/Mercadona (no tienen API pública y no sería legítimo acceder a sus
  APIs internas sin autorización); es una base de datos colaborativa que da
  cobertura amplia a sus marcas propias (Hacendado, etc.). El componente del
  escáner se carga de forma diferida (`React.lazy`) para no engordar la carga
  inicial de la app.
- PWA (manifest + service worker) vía `vite-plugin-pwa`.
- Los iconos de la app se generan con `scripts/generate-icons.cjs` (PNG puro,
  sin dependencias nativas) — ejecútalo de nuevo si quieres cambiar el diseño.
