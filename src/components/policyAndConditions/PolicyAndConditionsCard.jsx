// src/components/PolicyAndConditionsCard.jsx
import React from "react";

const PolicyAndConditionsCard = ({ title, lastUpdated, text }) => {
  //  This function formats text beautifully (Headings, Bullets, Paragraphs)
  const formatText = (content) => {
    return content.split("\n").map((line, index) => {
      const trimmed = line.trim();

      // If the lane is clear, just leave a small gap.
      if (trimmed === "") {
        return <div key={index} className="h-2"></div>;
      }

      // Heading 1: If the line starts with a number (e.g., "1. Information...")
      if (/^\d+\./.test(trimmed)) {
        return (
          <h3
            key={index}
            className="text-xl font-semibold text-gray-900 mt-8 mb-3"
          >
            {trimmed}
            <hr className="mt-1 border-gray-300" />
          </h3>
        );
      }

      // HEADING 2: If the line starts with "A.", "B.", or "C." (Sub-headings)
      if (/^[A-Z]\./.test(trimmed)) {
        return (
          <h3
            key={index}
            className="text-lg font-medium text-gray-900 mt-5 mb-2"
          >
            {trimmed}
            <hr className="mt-1 border-gray-300" />
          </h3>
        );
      }

      //   BULLET POINTS: If the line starts with
      if (trimmed.startsWith("•")) {
        return (
          <li key={index} className="flex items-start gap-3 ml-2 my-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-500 mt-2 flex-shrink-0"></span>
            <span className="flex-1">{trimmed.substring(1).trim()}</span>
          </li>
        );
      }

      // Normal paragraph: Everything else
      return (
        <p key={index} className="text-justify mb-1">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* This is the card – white background, shadow, and padding. */}
        <div className="bg-white p-6 md:p-8 lg:p-10">
          {/* Header Section */}
          {/* Parent container text-center hi rahega taaki block center me rahe */}
          <div className="text-center mb-8">
            {/* w-fit aur mx-auto lagane se ye box sirf content ke barabar hi wide hoga */}
            <div className="inline-block w-fit pb-2 border-b-[2px] border-gray-200">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                {title}
              </h1>
              <p className="text-gray-400 text-sm">
                Last Updated: {lastUpdated}
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-1 text-gray-600 text-sm leading-relaxed">
            {/* <h1>hi</h1>
            <h3>hi</h3>
            <h6>hi</h6> */}
            {formatText(text)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyAndConditionsCard;
