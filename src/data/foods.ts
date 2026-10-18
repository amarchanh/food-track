import type { FoodItem } from '../types'

/**
 * Curated local food database (per 100 g / 100 ml). Open Food Facts' search
 * endpoints (cgi/search.pl, api/v2/search) started returning 503s site-wide
 * and their replacement (search.openfoodfacts.org) ships no CORS headers, so
 * neither can be called from a static site's browser JS. This bundled list
 * covers common everyday foods instead — reliable, instant, works offline.
 * Anything missing can still be added via "Añadir alimento manualmente".
 */
function food(name: string, kcal: number, protein: number, carbs: number, fat: number, fiber: number): FoodItem {
  const id = 'local-' + name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return { id, name, source: 'local', per100: { kcal, protein, carbs, fat, fiber } }
}

export const FOOD_DATABASE: FoodItem[] = [
  // Proteína animal
  food('Pechuga de pollo', 165, 31, 0, 3.6, 0),
  food('Muslo de pollo sin piel', 172, 20, 0, 10, 0),
  food('Pavo (pechuga)', 135, 30, 0, 1, 0),
  food('Ternera magra', 172, 21, 0, 9, 0),
  food('Lomo de cerdo', 143, 21, 0, 6, 0),
  food('Atún en conserva al natural', 116, 26, 0, 1, 0),
  food('Atún fresco', 144, 23, 0, 5, 0),
  food('Salmón', 208, 20, 0, 13, 0),
  food('Merluza', 86, 17, 0, 1.3, 0),
  food('Gambas / langostinos', 85, 20, 0.2, 0.5, 0),
  food('Huevo entero', 143, 13, 1.1, 10, 0),
  food('Clara de huevo', 52, 11, 0.7, 0.2, 0),
  food('Jamón cocido', 107, 18, 1, 3.4, 0),
  food('Jamón serrano', 241, 31, 0, 13, 0),
  food('Jamón ibérico', 290, 24, 0, 21, 0),
  food('Pechuga de pavo (fiambre)', 95, 20, 1.5, 1, 0),

  // Lácteos y quesos
  food('Queso fresco tipo Burgos', 174, 13, 3.5, 12, 0),
  food('Queso curado (manchego)', 400, 26, 0.5, 33, 0),
  food('Requesón', 98, 11, 3.4, 4.3, 0),
  food('Leche entera', 61, 3.2, 4.8, 3.3, 0),
  food('Leche semidesnatada', 46, 3.3, 4.9, 1.6, 0),
  food('Leche desnatada', 35, 3.4, 5, 0.1, 0),
  food('Yogur natural', 61, 3.5, 4.7, 3.3, 0),
  food('Yogur natural desnatado', 41, 4, 5.5, 0.2, 0),
  food('Yogur griego', 97, 9, 4, 5, 0),
  food('Yogur griego 0%', 59, 10, 3.6, 0.4, 0),
  food('Kéfir', 55, 3.3, 4.5, 2.5, 0),
  food('Queso fresco batido 0%', 49, 8, 3.9, 0.2, 0),
  food('Nata para cocinar', 300, 2.2, 3.5, 30, 0),

  // Proteína vegetal / legumbres
  food('Tofu', 76, 8, 1.9, 4.8, 0.3),
  food('Tempeh', 192, 20, 7.6, 11, 0),
  food('Seitán cocido', 120, 21, 4, 1.5, 0.6),
  food('Lentejas cocidas', 116, 9, 20, 0.4, 7.9),
  food('Garbanzos cocidos', 164, 8.9, 27, 2.6, 7.6),
  food('Judías blancas cocidas', 127, 8.7, 23, 0.5, 6.3),
  food('Judías negras cocidas', 132, 8.9, 24, 0.5, 8.7),
  food('Soja texturizada (seca)', 345, 52, 30, 1, 14),
  food('Edamame cocido', 121, 11, 9.9, 5.2, 5.2),
  food('Hummus', 166, 7.9, 14, 9.6, 6),
  food('Proteína de suero en polvo (whey)', 380, 75, 8, 6, 1),

  // Cereales, pan y féculas
  food('Arroz blanco cocido', 130, 2.7, 28, 0.3, 0.4),
  food('Arroz integral cocido', 123, 2.7, 26, 1, 1.8),
  food('Pasta cocida', 131, 5, 25, 1.1, 1.8),
  food('Pasta integral cocida', 124, 5.3, 25, 1.1, 3.2),
  food('Pan blanco', 265, 9, 49, 3.2, 2.7),
  food('Pan integral', 247, 13, 41, 3.4, 7),
  food('Pan de molde', 250, 8, 47, 3, 2.5),
  food('Pan de pita', 275, 9, 56, 1.2, 2.2),
  food('Tortilla de trigo (wrap)', 310, 8.5, 50, 8, 2.8),
  food('Patata cocida', 87, 1.9, 20, 0.1, 1.8),
  food('Patata asada con piel', 93, 2.5, 21, 0.1, 2.2),
  food('Boniato cocido', 90, 2, 21, 0.1, 3.3),
  food('Avena en copos', 389, 17, 66, 7, 10),
  food('Quinoa cocida', 120, 4.4, 21, 1.9, 2.8),
  food('Cuscús cocido', 112, 3.8, 23, 0.2, 1.4),
  food('Maíz dulce', 86, 3.2, 19, 1.2, 2.7),
  food('Tortita de arroz', 387, 8, 81, 2.8, 2.5),
  food('Tortita de maíz', 365, 8.5, 76, 3, 5),
  food('Granola', 471, 10, 64, 20, 7),
  food('Barrita de cereales', 400, 6, 68, 12, 4),

  // Grasas y frutos secos
  food('Aceite de oliva', 884, 0, 0, 100, 0),
  food('Aceite de girasol', 884, 0, 0, 100, 0),
  food('Mantequilla', 717, 0.9, 0.1, 81, 0),
  food('Aguacate', 160, 2, 8.5, 14.7, 6.7),
  food('Almendras', 579, 21, 22, 50, 12.5),
  food('Nueces', 654, 15, 14, 65, 6.7),
  food('Cacahuetes', 567, 26, 16, 49, 8.5),
  food('Anacardos', 553, 18, 30, 44, 3.3),
  food('Pistachos', 560, 20, 28, 45, 10),
  food('Semillas de chía', 486, 17, 42, 31, 34),
  food('Semillas de lino', 534, 18, 29, 42, 27),
  food('Mantequilla de cacahuete', 588, 25, 20, 50, 6),

  // Frutas
  food('Manzana', 52, 0.3, 14, 0.2, 2.4),
  food('Plátano', 89, 1.1, 23, 0.3, 2.6),
  food('Naranja', 47, 0.9, 12, 0.1, 2.4),
  food('Mandarina', 53, 0.8, 13, 0.3, 1.8),
  food('Pera', 57, 0.4, 15, 0.1, 3.1),
  food('Fresas', 32, 0.7, 7.7, 0.3, 2),
  food('Uvas', 69, 0.7, 18, 0.2, 0.9),
  food('Sandía', 30, 0.6, 7.6, 0.2, 0.4),
  food('Melón', 34, 0.8, 8.2, 0.2, 0.9),
  food('Piña', 50, 0.5, 13, 0.1, 1.4),
  food('Kiwi', 61, 1.1, 15, 0.5, 3),
  food('Mango', 60, 0.8, 15, 0.4, 1.6),
  food('Arándanos', 57, 0.7, 14, 0.3, 2.4),

  // Verduras y hortalizas
  food('Brócoli', 34, 2.8, 7, 0.4, 2.6),
  food('Espinacas', 23, 2.9, 3.6, 0.4, 2.2),
  food('Lechuga', 15, 1.4, 2.9, 0.2, 1.3),
  food('Tomate', 18, 0.9, 3.9, 0.2, 1.2),
  food('Pepino', 15, 0.7, 3.6, 0.1, 0.5),
  food('Zanahoria', 41, 0.9, 10, 0.2, 2.8),
  food('Pimiento rojo', 31, 1, 6, 0.3, 2.1),
  food('Calabacín', 17, 1.2, 3.1, 0.3, 1),
  food('Cebolla', 40, 1.1, 9.3, 0.1, 1.7),
  food('Champiñones', 22, 3.1, 3.3, 0.3, 1),
  food('Coliflor', 25, 1.9, 5, 0.3, 2),
  food('Calabaza', 26, 1, 6.5, 0.1, 0.5),
  food('Judías verdes', 31, 1.8, 7, 0.1, 3.4),
  food('Berenjena', 25, 1, 6, 0.2, 3),
  food('Espárragos', 20, 2.2, 3.9, 0.1, 2.1),
  food('Repollo / col', 25, 1.3, 5.8, 0.1, 2.5),
  food('Guisantes', 81, 5.4, 14, 0.4, 5.1),
  food('Rúcula', 25, 2.6, 3.7, 0.7, 1.6),

  // Bebidas vegetales y otros
  food('Leche de almendra sin azúcar', 15, 0.5, 0.3, 1.2, 0.3),
  food('Leche de soja', 54, 3.3, 6, 1.8, 0.6),
  food('Leche de avena', 48, 1, 6.7, 1.5, 0.8),

  // Dulces y varios
  food('Chocolate negro 70%', 598, 7.8, 46, 43, 11),
  food('Chocolate con leche', 535, 7.6, 59, 30, 3.4),
  food('Miel', 304, 0.3, 82, 0, 0.2),
  food('Azúcar blanco', 387, 0, 100, 0, 0),
  food('Palomitas de maíz naturales', 387, 13, 78, 4.5, 15),
  food('Tortilla de patata', 180, 6, 14, 11, 1),
]
