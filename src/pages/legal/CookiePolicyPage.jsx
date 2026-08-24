import React from 'react'
import PolicyAndConditionsCard from "@/components/policyAndConditions/policyAndConditionsCard";
import { privacyPolicyData } from "@/constants/allPolicyData/privacyPolicyData";
import { cookiePolicyData } from '@/constants/allPolicyData/cookiePolicyData';

const CookiePolicyPage = () => {
  return (
    <PolicyAndConditionsCard
      title="COOKIE POLICY"
      lastUpdated="August 20, 2026"
      text={cookiePolicyData}
    />
  )
}

export default CookiePolicyPage