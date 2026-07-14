"use client";

import { BusinessLocalRepository } from "@/mini-back/infrastructure/dexie/repositories/dexie-business.repository";
import { LocalBusiness } from "@/mini-back/infrastructure/dexie/shcema/business.schema";
import { useEffect, useState } from "react";


const repository = new BusinessLocalRepository();


export function useCurrentBusiness(){

  const [business, setBusiness] = useState<LocalBusiness>();

  const [loading, setLoading] = useState(true);


  useEffect(()=>{

    repository
      .getCurrentBusiness()
      .then((data)=>{
        setBusiness(data);
      })
      .finally(()=>{
        setLoading(false);
      });

  },[]);


  return {
    business,
    loading
  };

}