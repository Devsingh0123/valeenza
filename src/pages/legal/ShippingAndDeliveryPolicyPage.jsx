import React from 'react'
import PolicyAndConditionsCard from "@/components/policyAndConditions/policyAndConditionsCard";
import { shippingAndDeliveryPolicyData } from '@/constants/allPolicyData/shippingAndDeliveryPolicyData';
const ShippingAndDeliveryPolicyPage = () => {
  return (
    <PolicyAndConditionsCard
      title="SHIPPING & DELIVERY POLICY"
      lastUpdated="August 20, 2026"
      text={shippingAndDeliveryPolicyData}
    />
  )
}

export default ShippingAndDeliveryPolicyPage