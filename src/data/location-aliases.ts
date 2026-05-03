// src/data/location-aliases.ts

export interface LocationAlias {
  id: string;
  name: string;
  normalized: string;
  zoneId: string;
  tokens: string[];
  rules?: LocationRule[];
  active: boolean;
}

export interface LocationRule {
  id: string;
  tokens: string[];
  priority: number;
  zoneId: string;
}

export const LOCATION_ALIASES: LocationAlias[] = [
  // --- BARRIOS PRIVADOS Y SEMIPRIVADOS ---
  {
    id: "barrio_ss",
    name: "Barrio SS (Privado)",
    normalized: "barrio ss privado",
    zoneId: "", 
    tokens: ["ss", "privado"],
    active: true,
  },
  {
    id: "rincon_urquiza",
    name: "Rincón de Urquiza",
    normalized: "rincon de urquiza",
    zoneId: "",
    tokens: ["rincon", "urquiza"],
    active: true,
  },
  {
    id: "los_bretes",
    name: "Los Bretes",
    normalized: "los bretes",
    zoneId: "",
    tokens: ["bretes"],
    active: true,
  },
  {
    id: "pueblo_duffard",
    name: "Pueblo Duffard",
    normalized: "pueblo duffard",
    zoneId: "",
    tokens: ["duffard"],
    active: true,
  },

  // --- TRADICIONALES Y CÉNTRICOS ---
  {
    id: "san_isidro",
    name: "San Isidro",
    normalized: "san isidro",
    zoneId: "",
    tokens: ["san", "isidro"],
    active: true,
  },
  {
    id: "la_quilmes",
    name: "La Quilmes",
    normalized: "la quilmes",
    zoneId: "",
    tokens: ["quilmes"],
    active: true,
  },
  {
    id: "la_concepcion",
    name: "La Concepción",
    normalized: "la concepcion",
    zoneId: "",
    tokens: ["concepcion"],
    active: true,
  },
  {
    id: "puerto_viejo",
    name: "Puerto Viejo",
    normalized: "puerto viejo",
    zoneId: "",
    tokens: ["puerto", "viejo"],
    active: true,
  },
  {
    id: "rocamora",
    name: "Rocamora",
    normalized: "rocamora",
    zoneId: "",
    tokens: ["rocamora"],
    active: true,
  },

  // --- VIVIENDAS E IAPV ---
  {
    id: "192_viviendas",
    name: "192 Viviendas",
    normalized: "192 viviendas",
    zoneId: "",
    tokens: ["192", "viviendas"],
    active: true,
  },
  {
    id: "150_viviendas",
    name: "150 Viviendas",
    normalized: "150 viviendas",
    zoneId: "",
    tokens: ["150", "viviendas"],
    active: true,
  },
  {
    id: "80_viviendas",
    name: "80 Viviendas",
    normalized: "80 viviendas",
    zoneId: "",
    tokens: ["80", "viviendas"],
    active: true,
  },
  {
    id: "100_viviendas",
    name: "100 Viviendas",
    normalized: "100 viviendas",
    zoneId: "",
    tokens: ["100", "viviendas"],
    active: true,
  },

  // --- ZONAS PERIFÉRICAS ---
  {
    id: "villa_las_lomas_norte",
    name: "Villa Las Lomas Norte",
    normalized: "villa las lomas norte",
    zoneId: "",
    tokens: ["lomas", "norte"],
    active: true,
  },
  {
    id: "villa_las_lomas_sur",
    name: "Villa Las Lomas Sur",
    normalized: "villa las lomas sur",
    zoneId: "",
    tokens: ["lomas", "sur"],
    active: true,
  },
  {
    id: "santa_teresita",
    name: "Santa Teresita",
    normalized: "santa teresita",
    zoneId: "",
    tokens: ["santa", "teresita"],
    active: true,
  },
  {
    id: "la_higuera",
    name: "La Higuera",
    normalized: "la higuera",
    zoneId: "",
    tokens: ["higuera"],
    active: true,
  },
  {
    id: "la_rural",
    name: "La Rural",
    normalized: "la rural",
    zoneId: "",
    tokens: ["rural"],
    active: true,
  },
  {
    id: "cantera_25",
    name: "Cantera 25",
    normalized: "cantera 25",
    zoneId: "",
    tokens: ["cantera", "25"],
    active: true,
  },
  {
    id: "barrio_obrero",
    name: "Barrio Obrero",
    normalized: "barrio obrero",
    zoneId: "",
    tokens: ["obrero"],
    active: true,
  },
  {
    id: "ex_circuito_mena",
    name: "Ex Circuito Mena",
    normalized: "ex circuito mena",
    zoneId: "",
    tokens: ["mena"],
    active: true,
  },
  {
    id: "balneario_itape",
    name: "Balneario Itapé",
    normalized: "balneario itape",
    zoneId: "",
    tokens: ["itape"],
    active: true,
  },
  {
    id: "barrio_vicoer",
    name: "Barrio Vicoer",
    normalized: "barrio vicoer",
    zoneId: "",
    tokens: ["vicoer"],
    active: true,
  },
  {
    id: "barrio_cgt",
    name: "Barrio CGT",
    normalized: "barrio cgt",
    zoneId: "",
    tokens: ["cgt"],
    active: true,
  }
];