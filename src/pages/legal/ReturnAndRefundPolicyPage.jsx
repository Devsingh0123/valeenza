import React from 'react'
import PolicyAndConditionsCard from "@/components/policyAndConditions/policyAndConditionsCard";
import { returnAndRefundPolicyData } from '@/constants/allPolicyData/returnAndRefundPolicyData';

const ReturnAndRefundPolicyPage = () => {
  return (
   <PolicyAndConditionsCard
      title="RETURN & REFUND POLICY"
      lastUpdated="August 20, 2026"
      text={returnAndRefundPolicyData}
    />
  )
}

export default ReturnAndRefundPolicyPage