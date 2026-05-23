type ConnectionState = "ONLINE" | "OFFLINE" | "CHECKING";

class ConnectivityManager {
  private state: ConnectionState = "CHECKING";

  getState() {
    return this.state;
  }

  isOnline() {
    return this.state === "ONLINE";
  }

  isOffline() {
    return this.state === "OFFLINE";
  }

  setState(state: ConnectionState) {
    if (this.state === state) return;

    this.state = state;

    console.log("[Connectivity]", state);
  }
}

export const connectivityManager = new ConnectivityManager();
