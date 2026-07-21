//src/mini-back/core/DeliveryCore/public/delivery-service.interface.ts
import { QuoteDeliveryInput } from "../inputs/quote-delivery.input";
import { ResolveAddressInput } from "../inputs/resolve-address.input";
import { DeliveryServiceResponse } from "../service/delivery.service";
import { DeliveryAddressResolution } from "../signal/delivery-addressResolution.signal";
import { DeliveryQuotation } from "../signal/delivery-quotation";

export interface IDeliveryService {
    resolveAddress(input: ResolveAddressInput): Promise<DeliveryServiceResponse<DeliveryAddressResolution>>;
    quoteDelivery(input: QuoteDeliveryInput): Promise<DeliveryServiceResponse<DeliveryQuotation>>;
}