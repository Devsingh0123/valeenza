import React from 'react'
import PolicyAndConditionsCard from "@/components/policyAndConditions/policyAndConditionsCard";
import { yourPrivacyChoicesDoNotSellOrShareData } from '@/constants/allPolicyData/yourPrivacyChoicesDoNotSellOrShareData';

const YourPrivacyChoicesDoNotSellOrSharePage = () => {
  return (
    <PolicyAndConditionsCard
      title="YOUR PRIVACY CHOICES / DO NOT SELL OR SHARE"
      lastUpdated="August 20, 2026"
      text={yourPrivacyChoicesDoNotSellOrShareData}
    />
  )
}

export default YourPrivacyChoicesDoNotSellOrSharePage