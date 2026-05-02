    // src/features/orders/types/ui-order.ts

    import { IOrder } from "./order";


    export interface UIOrder extends IOrder{
    id: string; // El id de Postgres
    idTemp: string;
    syncStatus: 'pending' | 'synced';
    }