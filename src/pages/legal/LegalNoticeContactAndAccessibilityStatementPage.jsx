import React from 'react'
import PolicyAndConditionsCard from "@/components/policyAndConditions/policyAndConditionsCard";
import { legalNoticeContactAndAccessibilityStatementData } from '@/constants/allPolicyData/legalNoticeContactAndAccessibilityStatementData';

const LegalNoticeContactAndAccessibilityStatementPage = () => {
  return (
   <PolicyAndConditionsCard
      title="LEGAL / CONTACT / ACCESSIBILITY NOTICE"
      lastUpdated="August 20, 2026"
      text={legalNoticeContactAndAccessibilityStatementData}
    />
  )
}

export default LegalNoticeContactAndAccessibilityStatementPage