export interface StreetSuggestion {
  id: string;
  name: string;
  normalized: string;
  tokens: string[];
  aliases?: string[];
}


export const STREET_SUGGESTIONS: StreetSuggestion[] = [
  // --- CALLES NORTE (Columna Izquierda) ---
  { id: "st_n_9", name: "Padre Rolando", normalized: "padre rolando", tokens: ["rolando"], aliases: ["9 del norte", "oeste norte"] },
  { id: "st_n_10", name: "Daniel Elías", normalized: "daniel elias", tokens: ["elias"], aliases: ["10 del norte"] },
  { id: "st_n_11", name: "Suboficial Lacava", normalized: "suboficial lacava", tokens: ["lacava", "la cava"], aliases: ["11 del norte"] },
  { id: "st_n_12", name: "Labalta", normalized: "labalta", tokens: ["labalta"], aliases: ["12 del norte"] },
  { id: "st_n_13", name: "J. A. Marcó", normalized: "j a marco", tokens: ["marco"], aliases: ["13 del norte"] },
  { id: "st_n_14", name: "Ana U. de Victorica", normalized: "ana u de victorica", tokens: ["victorica", "ana"], aliases: ["14 del norte"] },
  { id: "st_n_15", name: "Cecilia Grierson", normalized: "cecilia grierson", tokens: ["grierson"], aliases: ["15 del norte"] },
  { id: "st_n_16", name: "Oscar Smith", normalized: "oscar smith", tokens: ["smith"], aliases: ["16 del norte"] },
  { id: "st_n_17", name: "Ravena", normalized: "ravena", tokens: ["ravena"], aliases: ["17 del norte"] },
  { id: "st_n_18", name: "Hugo Baldoni", normalized: "hugo baldoni", tokens: ["baldoni"], aliases: ["18 del norte"] },
  { id: "st_n_19", name: "Bv. Uncal", normalized: "bv uncal", tokens: ["uncal"], aliases: ["19 del norte"] },
  { id: "st_n_20", name: "Arturo Jardón", normalized: "arturo jardon", tokens: ["jardon"], aliases: ["20 del norte"] },
  { id: "st_n_21", name: "Luis Grianta", normalized: "luis grianta", tokens: ["grianta"], aliases: ["21 del norte"] },
  { id: "st_n_22", name: "Azucena Villaflor", normalized: "azucena villaflor", tokens: ["villaflor"], aliases: ["22 del norte"] },
  { id: "st_n_23", name: "Florencio López", normalized: "florencio lopez", tokens: ["lopez"], aliases: ["23 del norte"] },
  { id: "st_n_24", name: "Madre Teresa de Calcuta", normalized: "madre teresa", tokens: ["teresa", "calcuta"], aliases: ["24 del norte"] },
  { id: "st_n_26", name: "Pedro Duten", normalized: "pedro duten", tokens: ["duten"], aliases: ["26 del norte"] },
  { id: "st_n_28", name: "Juana Azurduy", normalized: "juana azurduy", tokens: ["azurduy"], aliases: ["28 del norte"] },
  { id: "st_n_29", name: "Intendente Bermúdez", normalized: "intendente bermudez", tokens: ["bermudez"], aliases: ["29 del norte"] },
  { id: "st_n_30", name: "Urquiza Almandoz", normalized: "urquiza almandoz", tokens: ["almandoz"], aliases: ["30 del norte"] },
  { id: "st_n_31", name: "Doctora Paolazzi", normalized: "doctora paolazzi", tokens: ["paolazzi"], aliases: ["31 del norte"] },
  { id: "st_n_33", name: "Gaucho Antonio Rivero", normalized: "gaucho antonio rivero", tokens: ["rivero", "gaucho"], aliases: ["33 del norte"] },
  { id: "st_n_34", name: "Salomón", normalized: "salomon", tokens: ["salomon"], aliases: ["34 del norte"] },

  // --- CALLES SUR (Columna Derecha) ---
  { id: "st_s_9", name: "Nadal Sagastume", normalized: "nadal sagastume", tokens: ["sagastume"], aliases: ["9 del sur", "oeste sur"] },
  { id: "st_s_10", name: "P. Metz", normalized: "p metz", tokens: ["metz"], aliases: ["10 del sur"] },
  { id: "st_s_11", name: "Cabo Pereyra", normalized: "cabo pereyra", tokens: ["pereyra"], aliases: ["11 del sur"] },
  { id: "st_s_12", name: "Linares Cardozo", normalized: "linares cardozo", tokens: ["linares", "cardozo"], aliases: ["12 del sur"] },
  { id: "st_s_13", name: "Blanchet", normalized: "blanchet", tokens: ["blanchet"], aliases: ["13 del sur"] },
  { id: "st_s_14", name: "Tofalo", normalized: "tofalo", tokens: ["tofalo"], aliases: ["14 del sur"] },
  { id: "st_s_15", name: "Cazzulino", normalized: "cazzulino", tokens: ["cazzulino"], aliases: ["15 del sur"] },
  { id: "st_s_16", name: "Diez Figueras", normalized: "diez figueras", tokens: ["figueras"], aliases: ["16 del sur"] },
  { id: "st_s_17", name: "Sabin", normalized: "sabin", tokens: ["sabin"], aliases: ["17 del sur"] },
  { id: "st_s_18", name: "Stilman", normalized: "stilman", tokens: ["stilman"], aliases: ["18 del sur"] },
  { id: "st_s_19", name: "Lauria", normalized: "lauria", tokens: ["lauria"], aliases: ["19 del sur"] },
  { id: "st_s_20", name: "Alicia Moreau de Justo", normalized: "alicia moreau de justo", tokens: ["moreau", "justo"], aliases: ["20 del sur"] },
  { id: "st_s_21", name: "T. Marcó", normalized: "t marco", tokens: ["marco"], aliases: ["21 del sur"] },
  { id: "st_s_22", name: "María Elena Walsh", normalized: "maria elena walsh", tokens: ["walsh", "elena"], aliases: ["22 del sur"] },
  { id: "st_s_23", name: "María Esther de Miguel", normalized: "maria esther de miguel", tokens: ["miguel", "esther"], aliases: ["23 del sur"] },
  { id: "st_s_24", name: "Dina Nardone Irigoyen", normalized: "dina nardone irigoyen", tokens: ["nardone", "irigoyen"], aliases: ["24 del sur"] },
  { id: "st_s_25", name: "Diana Beatriz Almada", normalized: "diana beatriz almada", tokens: ["almada"], aliases: ["25 del sur"] },
  { id: "st_s_26", name: "Clementina Comte de Alió", normalized: "clementina comte de alio", tokens: ["comte", "alio"], aliases: ["26 del sur"] },
  { id: "st_s_27", name: "Lorenza Mallea", normalized: "lorenza mallea", tokens: ["mallea"], aliases: ["27 del sur"] },
  { id: "st_s_28", name: "María Angélica Miró", normalized: "maria angelica miro", tokens: ["miro"], aliases: ["28 del sur"] },
  { id: "st_s_29", name: "Rosa Alul de Eguillor", normalized: "rosa alul de eguillor", tokens: ["eguillor", "alul"], aliases: ["29 del sur"] },
  { id: "st_s_30", name: "Ana Teresa Fabani", normalized: "ana teresa fabani", tokens: ["fabani"], aliases: ["30 del sur"] },
  { id: "st_s_32", name: "El Despertar del Obrero", normalized: "el despertar del obrero", tokens: ["obrero", "despertar"], aliases: ["32 del sur"] },
  { id: "st_s_33", name: "José Luis Cabezas", normalized: "jose luis cabezas", tokens: ["cabezas"], aliases: ["33 del sur"] },
  { id: "st_s_34", name: "Convención", normalized: "convencion", tokens: ["convencion"], aliases: ["34 del sur"] },
  { id: "st_s_35", name: "Carlos Granillo Posse", normalized: "carlos granillo posse", tokens: ["posse", "granillo"], aliases: ["35 del sur"] },

  // --- EXTRAS DE ABAJO (Norte Adicionales) ---
  { id: "st_n_7", name: "Don Bosco", normalized: "don bosco", tokens: ["bosco"], aliases: ["7 del norte"] },
  { id: "st_n_8", name: "Pbro. Jorge Allais", normalized: "pbro jorge allais", tokens: ["allais", "jorge"], aliases: ["8 del norte"] },
  { id: "st_n_9_alt", name: "Concejal Moreno", normalized: "concejal moreno", tokens: ["moreno"], aliases: ["9 del norte bis"] },
  { id: "st_n_10_alt", name: "Contador Rubinsky", normalized: "contador rubinsky", tokens: ["rubinsky"], aliases: ["10 del norte bis"] },
  { id: "st_n_11_alt", name: "Pedro Goytía", normalized: "pedro goytia", tokens: ["goytia"], aliases: ["11 del norte bis"] },
];