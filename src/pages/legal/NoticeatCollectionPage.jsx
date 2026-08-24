import React from 'react'
import PolicyAndConditionsCard from "@/components/policyAndConditions/policyAndConditionsCard";
import { noticeatCollectionData } from '@/constants/allPolicyData/noticeatCollectionData';

const NoticeatCollectionPage = () => {
  return (
    <PolicyAndConditionsCard
      title="NOTICE AT COLLECTION"
      lastUpdated="August 20, 2026"
      text={noticeatCollectionData}
    />
  )
}

export default NoticeatCollectionPage