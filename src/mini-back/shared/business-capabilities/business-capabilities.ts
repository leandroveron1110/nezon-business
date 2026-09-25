// src/shared/business-capabilities/business-capabilities.ts

/**
 * Capacidades de negocio disponibles para un negocio.
 *
 * Estos valores representan contextos funcionales a los que
 * el negocio tiene acceso, no necesariamente un único Core
 * técnico de la aplicación.
 *
 * Un contexto puede evolucionar y estar compuesto por varios
 * Cores internos sin cambiar esta capacidad.
 *
 * Ejemplo:
 *
 * "INVENTORY" significa que el negocio puede utilizar el
 * contexto completo de Inventario, aunque internamente este
 * contexto pueda estar dividido posteriormente en varios Cores.
 */
export type BusinessCore =
  /**
   * Acceso al contexto de Ventas.
   */
  | "SALES"

  /**
   * Acceso al contexto de Movimientos Financieros.
   *
   * Permite registrar y consultar los movimientos económicos
   * del negocio, independientemente de dónde se encuentre
   * físicamente el dinero.
   */
  | "FINANCIAL_MOVEMENTS"

  /**
   * Acceso al contexto de Tesorería.
   *
   * Permite gestionar dónde se encuentran los fondos y
   * cómo se distribuyen entre las distintas cuentas.
   */
  | "TREASURY"

  /**
   * Acceso al contexto completo de Inventario.
   *
   * Puede abarcar múltiples Cores internos relacionados
   * con stock, lotes, ubicaciones, transformaciones, etc.
   */
  | "INVENTORY"

  /**
   * Acceso al contexto de Compras.
   */
  | "PURCHASES"

  /**
   * Acceso al contexto de Proveedores.
   */
  | "SUPPLIERS"

  /**
   * Acceso al contexto de Empleados.
   */
  | "EMPLOYEES"

  /**
   * Acceso al contexto de Delivery.
   */
  | "DELIVERY"

  /**
   * Acceso al contexto de Contabilidad.
   */
  | "ACCOUNTING"

  /**
   * Acceso al contexto de Notificaciones.
   */
  | "NOTIFICATIONS";

/**
 * Listener utilizado principalmente por la UI
 * para reaccionar cuando cambian las capacidades
 * de un negocio.
 *
 * Recibe una copia de los Cores habilitados.
 */
export type CapabilitiesChangeListener = (
  businessId: string,
  cores: Set<BusinessCore>,
) => void;

export class BusinessCapabilities {
  /**
   * Configuración de capacidades por negocio.
   *
   * Cada negocio posee su propio conjunto de Cores habilitados.
   */
  private readonly businesses = new Map<string, Set<BusinessCore>>();

  /**
   * Suscriptores interesados en cambios
   * de capacidades.
   */
  private readonly listeners = new Set<CapabilitiesChangeListener>();

  /**
   * Carga o reemplaza la configuración completa
   * de Cores de un negocio.
   *
   * Útil para inicializar la configuración
   * desde Dexie, API, etc.
   */
  setCores(businessId: string, cores: BusinessCore[]): void {
    this.businesses.set(businessId, new Set(cores));

    this.notify(businessId);
  }

  /**
   * Habilita un Core para un negocio.
   *
   * Si ya estaba habilitado, no genera
   * una notificación innecesaria.
   */
  enable(businessId: string, core: BusinessCore): void {
    const cores = this.getOrCreate(businessId);

    if (cores.has(core)) {
      return;
    }

    cores.add(core);

    this.notify(businessId);
  }

  /**
   * Deshabilita un Core para un negocio.
   *
   * Si ya estaba deshabilitado, no genera
   * una notificación innecesaria.
   */
  disable(businessId: string, core: BusinessCore): void {
    const cores = this.getOrCreate(businessId);

    if (!cores.has(core)) {
      return;
    }

    cores.delete(core);

    this.notify(businessId);
  }

  /**
   * Determina si un negocio puede utilizar
   * un Core determinado.
   *
   * Es una consulta síncrona y directa.
   *
   * Los Orchestrators utilizan este método
   * para proteger sus propias fronteras.
   */
  canUse(businessId: string, core: BusinessCore): boolean {
    return this.businesses.get(businessId)?.has(core) ?? false;
  }

  /**
   * Obtiene todos los Cores habilitados
   * para un negocio.
   */
  getCores(businessId: string): BusinessCore[] {
    return Array.from(this.businesses.get(businessId) ?? []);
  }

  /**
   * Suscribe un listener a los cambios
   * de capacidades.
   *
   * Retorna una función para cancelar
   * la suscripción.
   *
   * Principalmente útil para que la UI
   * reaccione cuando se habilita o deshabilita
   * un Core.
   */
  subscribe(listener: CapabilitiesChangeListener): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Elimina toda la configuración de capacidades
   * de un negocio.
   */
  clear(businessId: string): void {
    if (!this.businesses.has(businessId)) {
      return;
    }

    this.businesses.delete(businessId);

    this.notify(businessId);
  }

  /**
   * Obtiene el conjunto existente de Cores
   * o crea uno nuevo para el negocio.
   */
  private getOrCreate(businessId: string): Set<BusinessCore> {
    let cores = this.businesses.get(businessId);

    if (!cores) {
      cores = new Set<BusinessCore>();

      this.businesses.set(businessId, cores);
    }

    return cores;
  }

  /**
   * Notifica a los suscriptores que cambió
   * la configuración de un negocio.
   *
   * Se entrega una copia del Set interno
   * para evitar que un listener pueda modificar
   * accidentalmente el estado de BusinessCapabilities.
   */
  private notify(businessId: string): void {
    const cores = new Set(this.businesses.get(businessId) ?? []);

    this.listeners.forEach((listener) => {
      listener(businessId, cores);
    });
  }
}

export const businessCapabilities = new BusinessCapabilities();
