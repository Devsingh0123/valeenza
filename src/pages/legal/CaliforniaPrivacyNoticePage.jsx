import React from 'react'
import PolicyAndConditionsCard from "@/components/policyAndConditions/policyAndConditionsCard";
import { californiaPrivacyNoticeData } from '@/constants/allPolicyData/californiaPrivacyNoticeData';

const CaliforniaPrivacyNoticePage = () => {
  return (
   <PolicyAndConditionsCard
      title="CALIFORNIA PRIVACY NOTICE"
      lastUpdated="August 20, 2026"
      text={californiaPrivacyNoticeData}
    />
  )
}

export default CaliforniaPrivacyNoticePage