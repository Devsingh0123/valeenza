// pages/legal/PrivacyPolicyPage.jsx

import PolicyAndConditionsCard from "@/components/policyAndConditions/policyAndConditionsCard";
import { privacyPolicyData } from "@/constants/allPolicyData/privacyPolicyData";



const PrivacyPolicyPage = () => {
  return (
    <PolicyAndConditionsCard
      title="PRIVACY POLICY"
      lastUpdated="August 20, 2026"
      text={privacyPolicyData}
    />
  );
};

export default PrivacyPolicyPage;