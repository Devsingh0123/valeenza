import React from 'react'
import PolicyAndConditionsCard from "@/components/policyAndConditions/policyAndConditionsCard";
import { astrologyAndAIDisclaimerData } from '@/constants/allPolicyData/astrologyAndAIDisclaimerData';

const AstrologyAndAIDisclaimerPage = () => {
  return (
    <PolicyAndConditionsCard
      title="ASTROLOGY & AI DISCLAIMER"
      lastUpdated="August 20, 2026"
      text={astrologyAndAIDisclaimerData}
    />
  )
}

export default AstrologyAndAIDisclaimerPage