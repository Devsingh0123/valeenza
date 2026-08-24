// src/components/PolicyAndConditionsCard.jsx
import React from "react";

const PolicyAndConditionsCard = ({ title, lastUpdated, text }) => {
  const formatText = (content) => {
    return content.split("\n").map((line, index) => {
      const trimmed = line.trim();

      if (trimmed === "") {
        return <div key={index} className="h-2"></div>;
      }

      // Heading 1
      if (/^\d+\./.test(trimmed)) {
        return (
          <h3 key={index} className="text-xl font-semibold text-gray-900 mt-8 mb-3">
            <span dangerouslySetInnerHTML={{ __html: trimmed }} />
            <hr className="mt-1 border-gray-300" />
          </h3>
        );
      }

      // Heading 2
      if (/^[A-Z]\./.test(trimmed)) {
        return (
          <h3 key={index} className="text-lg font-medium text-gray-900 mt-5 mb-2">
            <span dangerouslySetInnerHTML={{ __html: trimmed }} />
            <hr className="mt-1 border-gray-300" />
          </h3>
        );
      }

      // Bullet Points
      if (trimmed.startsWith("•")) {
        return (
          <li key={index} className="flex items-start gap-3 ml-2 my-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-500 mt-2 flex-shrink-0"></span>
            <span className="flex-1" dangerouslySetInnerHTML={{ __html: trimmed.substring(1).trim() }} />
          </li>
        );
      }

    

      // Normal Paragraph
      return (
        <p key={index} className="text-justify mb-1">
          <span dangerouslySetInnerHTML={{ __html: trimmed }} />
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 md:p-8 lg:p-10">
          <div className="text-center mb-8">
            <div className="inline-block w-fit pb-2 border-b-[2px] border-gray-200">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">{title}</h1>
              <p className="text-gray-400 text-sm">Last Updated: {lastUpdated}</p>
            </div>
          </div>
          <div className="space-y-1 text-gray-600 text-sm leading-relaxed">
            {formatText(text)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyAndConditionsCard;