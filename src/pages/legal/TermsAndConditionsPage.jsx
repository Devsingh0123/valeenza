import React from 'react'
import PolicyAndConditionsCard from "@/components/policyAndConditions/policyAndConditionsCard";
import { termsAndConditionsData } from '@/constants/allPolicyData/termsAndConditionsData';

const TermsAndConditionsPage = () => {
  return (
    <PolicyAndConditionsCard
      title="TERMS & CONDITIONS"
      lastUpdated="August 20, 2026"
      text={termsAndConditionsData}
    />
  )
}

export default TermsAndConditionsPage