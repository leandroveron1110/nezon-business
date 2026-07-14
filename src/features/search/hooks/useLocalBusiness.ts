import { BusinessLocalRepository } from "@/mini-back/infrastructure/dexie/repositories/dexie-business.repository";
import { SearchResultBusiness } from "../types/search";



const repository = new BusinessLocalRepository();


export function useLocalBusiness() {

  const saveBusiness = async (
    business: SearchResultBusiness
  ) => {

    await repository.saveCurrentBusiness({
      id: business.id,
      name: business.name,
      address: business.address,
      latitude: business.latitude,
      longitude: business.longitude,
      phone: undefined,
      updatedAt: Date.now()
    });

  };


  return {
    saveBusiness
  };
}