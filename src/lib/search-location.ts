// src/utils/search-location.ts

import {
  BarrioSuggestion,
  CalleSuggestion,
  LocationSuggestion,
} from "@/data/location-search";
import { LOCATION_DATA } from "@/data/location-search-data";

/* ============================================================================
 * NORMALIZER
 * ========================================================================== */

export function normalizeAddress(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\./g, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ============================================================================
 * HELPERS
 * ========================================================================== */

function tokenize(text: string) {
  return normalizeAddress(text).split(" ").filter(Boolean);
}

function removeStreetNumber(text: string) {
  const tokens = tokenize(text);
  if (tokens.length === 0) return "";

  const last = tokens[tokens.length - 1];
  // Si el último token es puramente numérico, es la altura
  if (/^\d+$/.test(last)) {
    tokens.pop();
  }
  return tokens.join(" ").trim();
}

/**
 * SCORE INTELIGENTE REVISADO
 * Devuelve un puntaje de coincidencia. A mayor puntaje, más relevancia.
 */
function scoreTextMatch(text: string, query: string): number {
  if (!text || !query) return 0;

  const textNorm = normalizeAddress(text);
  const queryNorm = normalizeAddress(query);

  // 1. Coincidencia Exacta (Máxima prioridad)
  if (textNorm === queryNorm) return 1000;

  // 2. Empieza exactamente con el query completo
  if (textNorm.startsWith(queryNorm)) return 500;

  const textTokens = tokenize(textNorm);
  const queryTokens = tokenize(queryNorm);

  let matchCount = 0;
  let prefixCount = 0;

  // Evaluamos token por token del query
  for (const qToken of queryTokens) {
    if (textTokens.includes(qToken)) {
      matchCount++;
    } else if (textTokens.some(tToken => tToken.startsWith(qToken))) {
      prefixCount++;
    }
  }

  const totalMatches = matchCount + prefixCount;
  
  // Si no matcheó absolutamente ningún token del query, el score es 0
  if (totalMatches === 0) return 0;

  // Cálculo base basado en qué tanto del query se completó
  let score = (matchCount * 150) + (prefixCount * 70);

  // Bonus por porcentaje de cobertura de la búsqueda
  const coverageRatio = totalMatches / queryTokens.length;
  score += coverageRatio * 200;

  // Penalización suave por longitud sobrante (para dar prioridad a nombres más cortos y exactos)
  score -= (textTokens.length - matchCount) * 10;

  return Math.max(score, 0);
}

/* ============================================================================
 * DETECTORES
 * ========================================================================== */

function detectBarrio(
  query: string,
  barrios: BarrioSuggestion[]
): BarrioSuggestion | null {
  const qNorm = normalizeAddress(query);
  
  // Primero ordenamos los barrios por longitud de texto para priorizar específicos
  const sortedBarrios = [...barrios].sort((a, b) => b.normalized.length - a.normalized.length);

  // Intento 1: Coincidencia directa por inicio de texto
  const directMatch = sortedBarrios.find((barrio) => qNorm.startsWith(barrio.normalized));
  if (directMatch) return directMatch;

  // Intento 2: Si el usuario escribió tokens que representan fuertemente a un barrio
  for (const barrio of sortedBarrios) {
    const barrioTokens = tokenize(barrio.normalized);
    // Si todos los tokens del barrio están incluidos al principio del query
    const matchTodos = barrioTokens.every(token => qNorm.includes(token));
    if (matchTodos && qNorm.startsWith(barrioTokens[0])) {
      return barrio;
    }
  }

  return null;
}

function isInteriorBarrio(text: string) {
  // Patrones internos de loteos/barrios complejos
  const regexInteriorBarrio =
    /\b(mza|mz|m|casa|csa|c|mod|modulo|sec|seccion|s|block|b|lote|l)\b/i;

  return regexInteriorBarrio.test(text);
}

/* ============================================================================
 * SEARCHERS
 * ========================================================================== */

function searchDirect(query: string): LocationSuggestion[] {
  return LOCATION_DATA
    .map((item) => {
      // Calculamos de forma independiente cada propiedad y nos quedamos con la mejor
      let bestScore = scoreTextMatch(item.normalized, query);

      if (item.aliases?.length) {
        for (const alias of item.aliases) {
          const aliasScore = scoreTextMatch(alias, query) * 0.9;
          if (aliasScore > bestScore) bestScore = aliasScore;
        }
      }

      if (item.tokens?.length) {
        for (const token of item.tokens) {
          const tokenScore = scoreTextMatch(token, query) * 0.8;
          if (tokenScore > bestScore) bestScore = tokenScore;
        }
      }

      return {
        item,
        score: bestScore,
      };
    })
    .filter((r) => r.score > 0) // Eliminamos el filtro estricto de 15 para capturar búsquedas parciales
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.item.name.length - b.item.name.length;
    })
    .slice(0, 6)
    .map((r) => r.item);
}

function searchStreetInsideBarrio(
  barrio: BarrioSuggestion,
  restoQuery: string,
  originalQuery: string,
  calles: CalleSuggestion[]
): LocationSuggestion[] {
  const calleQuery = removeStreetNumber(restoQuery);

  if (!calleQuery) return [];

  const callesFiltradas = calles
    .map((calle) => {
      let bestScore = scoreTextMatch(calle.normalized, calleQuery);

      if (calle.aliases?.length) {
        for (const alias of calle.aliases) {
          const aliasScore = scoreTextMatch(alias, calleQuery) * 0.9;
          if (aliasScore > bestScore) bestScore = aliasScore;
        }
      }

      return {
        item: calle,
        score: bestScore,
      };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.item.name.length - b.item.name.length;
    })
    .slice(0, 6)
    .map((r) => ({
      ...r.item,
      name: `${barrio.name} - ${r.item.name}`,
      zoneId: barrio.zoneId,
      type: "CALLE" as const,
    }));

  if (callesFiltradas.length > 0) {
    return callesFiltradas;
  }

  // --- MANEJO DE CALLE NUEVA DENTRO DEL BARRIO ---
  // Extraemos lo que escribió el usuario después del nombre del barrio respetando el formato original
  const originalTokens = originalQuery.split(" ");
  const barrioTokensLength = barrio.name.split(" ").length;
  const originalResto = originalTokens.slice(barrioTokensLength).join(" ").trim();

  return [
    {
      id: `dynamic-calle-${barrio.id}`,
      name: `${barrio.name} - ${originalResto}`,
      normalized: normalizeAddress(`${barrio.name} ${originalResto}`),
      type: "CALLE",
      // zoneId: barrio.zoneId,
    },
  ];
}

/* ============================================================================
 * MAIN SEARCH
 * ========================================================================== */

export function searchLocation(query: string): LocationSuggestion[] {
  const q = normalizeAddress(query);
  if (!q) return [];

  const barrios = LOCATION_DATA.filter(
    (item): item is BarrioSuggestion => item.type === "BARRIO"
  );

  const calles = LOCATION_DATA.filter(
    (item): item is CalleSuggestion => item.type === "CALLE"
  );

  // 1. Obtener listado base por búsqueda directa
  const directResults = searchDirect(q);

  // Si es una sola palabra muy corta, evitamos procesamiento mixto de barrios
  if (!query.includes(" ") && query.length < 4) {
    return directResults;
  }

  // 2. Intentar detectar si la búsqueda incluye un Barrio conocido
  const barrioDetectado = detectBarrio(q, barrios);

  if (!barrioDetectado) {
    return directResults;
  }

  // 3. Extraer el remanente de la consulta (lo que viene después del barrio)
  const barrioTokens = tokenize(barrioDetectado.normalized);
  const queryTokens = tokenize(q);

  // Cortamos dinámicamente los tokens pertenecientes al barrio
  const restoQuery = queryTokens.slice(barrioTokens.length).join(" ").trim();

  // Si puso solo el nombre del barrio (ej: "San isidro"), lo priorizamos arriba de la lista
  if (!restoQuery) {
    return [
      barrioDetectado,
      ...directResults.filter((r) => r.id !== barrioDetectado.id),
    ].slice(0, 6);
  }

  // 4. Analizar si es una ubicación interna (Manzana, Casa, Lote, etc.)
  if (isInteriorBarrio(restoQuery)) {
    return [
      {
        id: `dynamic-barrio-${barrioDetectado.id}`,
        name: query.trim(),
        normalized: q,
        type: "BARRIO",
        zoneId: barrioDetectado.zoneId,
      },
    ];
  }

  // 5. Contexto Mixto: Buscar la calle ingresada dentro del Barrio detectado
  const contextualResults = searchStreetInsideBarrio(
    barrioDetectado,
    restoQuery,
    query,
    calles
  );

  if (contextualResults.length > 0) {
    return contextualResults;
  }

  // 6. Si falló todo, devolvemos el motor directo balanceado
  return directResults;
}