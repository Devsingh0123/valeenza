import React from 'react'
import PolicyAndConditionsCard from "@/components/policyAndConditions/policyAndConditionsCard";
import { digitalProductsAndServicesTermsData } from '@/constants/allPolicyData/digitalProductsAndServicesTermsData';

const DigitalProductsAndServicesTermsPage = () => {
  return (
    <PolicyAndConditionsCard
      title="DIGITAL PRODUCTS & SERVICES TERMS"
      lastUpdated="August 20, 2026"
      text={digitalProductsAndServicesTermsData}
    />
  )
}

export default DigitalProductsAndServicesTermsPage