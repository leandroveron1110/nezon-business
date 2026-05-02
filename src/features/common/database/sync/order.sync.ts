import { fetchOrdersByBusinessId } from "@/features/order/api/catalog-api"
import { db } from "..";

interface IOrderUI {
    id: string;
    name: string;
}
const orders = (businessId: string)=> {

    // 1. Obtenemos primero las id de la db local

    // 2. obtenemos datos en del server si hay data nueva

    // 3. convertimos de los datos que trae del back a local

    // 4. convertimos de local a IUI
}