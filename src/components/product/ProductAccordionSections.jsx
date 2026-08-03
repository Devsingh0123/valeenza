import React from "react";
import {
  FileText,
  Sparkles,
  BookOpen,
  RefreshCcw,
  AlertTriangle,
} from "lucide-react";
import AccordionSection from "../common/AccordionSection";

const ProductAccordionSections = ({
  description,
  benefitsParagraphs,
  howToUseSteps,
}) => {
  return (
    <div className="space-y-3">
      {/* Description – only if description exists */}
      {description && (
        <AccordionSection
          title="Description"
          icon={FileText}
          defaultOpen={true}
        >
          <p className="text-gray-700 leading-relaxed">{description}</p>
        </AccordionSection>
      )}

      {/* Benefits – only if there are benefits paragraphs */}
      {benefitsParagraphs.length > 0 && (
        <AccordionSection title="Benefits" icon={Sparkles} defaultOpen={true}>
          {benefitsParagraphs.map((para, idx) =>
            para.includes(":") ? (
              <p key={idx} className="text-gray-700 leading-relaxed mb-2 flex">
                <span className="text-amber-500">
                  {para.split(":")[0]} :{" "}
                  <span className="text-gray-700">{para.split(":")[1]}</span>
                </span>
              </p>
            ) : (
              <ol className="space-y-3">
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700">{para}</span>
                </li>
              </ol>
            ),
          )}
        </AccordionSection>
      )}

      {/* How to Use – only if there are steps */}
      {howToUseSteps.length > 0 && (
        <AccordionSection title="How to Use ?" icon={BookOpen}>
          {howToUseSteps.map((step, idx) =>
            step.includes(":") ? (
              <p key={idx} className="text-gray-700 leading-relaxed mb-2 flex">
                <span className="text-amber-500">
                  {step.split(":")[0]} :{" "}
                  <span className="text-gray-700">{step.split(":")[1]}</span>
                </span>
              </p>
            ) : (
              <ol className="space-y-3">
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700">{step}</span>
                </li>
              </ol>
            ),
          )}
        </AccordionSection>
      )}

      {/* Return and Exchange – static */}
      <AccordionSection title="Return and Exchange" icon={RefreshCcw}>
        <p className="text-gray-700 leading-relaxed">
          Returns are applicable within 7 days and only apply to defective,
          damaged, or incorrect products in unused condition with original
          packaging. Note: Natural variations in Rudraksha or gemstones are not
          defects. Non-returnable items include any used, altered, or
          personalized items. Refunds incur ₹100 fee but also available through
          store credit. Please get in touch with the "Customer Support" for any
          query/assistance.
        </p>
      </AccordionSection>

      {/* Disclaimer – static */}
      <AccordionSection title="Disclaimer" icon={AlertTriangle}>
        <p className="text-gray-700 leading-relaxed">
          Images are for reference only. There's no guarantee of the
          effectiveness of the product.
        </p>
      </AccordionSection>
    </div>
  );
};

export default ProductAccordionSections;
