export type SyncStatus =
  | "LOCAL_ONLY" // Solo existe localmente (ej: venta mostrador aún no enviada)
  | "SYNC_PENDING" // Debe sincronizarse con la nube
  | "SYNCED" // La nube confirmó recepción
  | "SYNC_ERROR"; // Hubo un error y requiere reintento o intervención
