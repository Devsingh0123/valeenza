import React from 'react'
import PolicyAndConditionsCard from "@/components/policyAndConditions/policyAndConditionsCard";
import { healthAndWellnessDisclaimerData } from '@/constants/allPolicyData/healthAndWellnessDisclaimerData';

const HealthAndWellnessDisclaimerPage = () => {
  return (
    <PolicyAndConditionsCard
      title="HEALTH & WELLNESS DISCLAIMER"
      lastUpdated="August 20, 2026"
      text={healthAndWellnessDisclaimerData}
    />
  )
}

export default HealthAndWellnessDisclaimerPage