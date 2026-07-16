// connectivity-manager.ts
type ConnectionState = "ONLINE" | "OFFLINE" | "CHECKING";

type ConnectivityListener = (state: ConnectionState) => void;

class ConnectivityManager {
  private state: ConnectionState = "CHECKING";
  private listeners: Set<ConnectivityListener> = new Set();

  // Control de tiempo para la desconexión prolongada
  private lastTimeOnline: number = Date.now();
  private readonly gracePeriod = 15000; // 15 segundos de tolerancia para microcortes

  getState() {
    return this.state;
  }

  isOnline() {
    return this.state === "ONLINE";
  }

  isOffline() {
    return this.state === "OFFLINE";
  }

  // El CircuitBreaker o el HealthMonitor le avisan lo que ven al instante
  reportHeartbeat(isAlive: boolean) {
    const now = Date.now();

    if (isAlive) {
      this.lastTimeOnline = now;
      this.updateState("ONLINE");
    } else {
      // Si falla, verificamos si ya se consumió el tiempo de gracia tolerado
      const timeSinceLastOnline = now - this.lastTimeOnline;

      if (timeSinceLastOnline >= this.gracePeriod) {
        this.updateState("OFFLINE");
      } else {
        // Seguimos en modo evaluación, no alarmamos a la UI todavía
        // console.log(
        //   `[Connectivity] Fallo detectado. En período de gracia: ${Math.round((this.gracePeriod - timeSinceLastOnline) / 1000)}s restantes.`
        // );
      }
    }
  }

  // Forzar estado (útil si el navegador dispara el evento offline nativo)
  forceState(state: ConnectionState) {
    if (state === "OFFLINE") {
      // Si es forzado por hardware, matamos el tiempo de gracia de inmediato
      this.lastTimeOnline = 0;
    }
    this.updateState(state);
  }

  private updateState(newState: ConnectionState) {
    if (this.state === newState) return;

    this.state = newState;
    // console.log("[Connectivity Consolidado]", newState);

    // Notificar a todos los componentes React suscritos
    this.listeners.forEach((listener) => listener(newState));
  }

  // Sistema Pub/Sub limpio para conectar con hooks de React
  subscribe(listener: ConnectivityListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const connectivityManager = new ConnectivityManager();
