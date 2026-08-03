// pages/legal/DisclaimerPage.jsx

import { disclaimerData } from '@/constants/allPolicyData/DisclaimerData';
import React from 'react';
import { Link } from 'react-router-dom';

const DisclaimerPage = () => {
  const { name, website, title, lastUpdated, sections } = disclaimerData;

  // Helper function to render body content (paragraphs and lists)
  const renderBody = (body) => {
    return body.map((item, i) => {
      if (item.type === 'paragraph') {
        return (
          <p key={i} className="text-justify">
            {item.text}
          </p>
        );
      }
      if (item.type === 'list') {
        return (
          <ul key={i} className="space-y-2 pl-5">
            {item.items.map((li, j) => (
              <li key={j} className="flex items-start gap-3">
                <span className="inline-block w-1 h-1 rounded-full bg-stone-400 mt-2.5 flex-shrink-0"></span>
                <span className="flex-1 text-justify">{li}</span>
              </li>
            ))}
          </ul>
        );
      }
      return null;
    });
  };

  // Recursive function to render sections and subSections
  const renderSection = (section, level = 1) => {
    const HeadingTag = level === 1 ? 'h3' : 'h4';
    const headingClass = level === 1 
      ? 'text-xl font-semibold text-stone-900 mb-4 mt-6' 
      : 'text-lg font-medium text-stone-800 mb-3 mt-6';

    return (
      <div key={section.heading} className={level > 1 ? 'ml-6' : ''}>
        <HeadingTag className={headingClass}>
          {section.heading}
          {HeadingTag === "h3" && <hr className="mt-1 text-gray-400" />}
        </HeadingTag>
        {section.body && (
          <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
            {renderBody(section.body)}
          </div>
        )}
        {section.subSections && section.subSections.map(sub => renderSection(sub, level + 1))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          {/* <h1 className="text-3xl font-semibold text-stone-900 mb-2">
            {name}
          </h1>
          <p className="text-stone-400 text-xs mb-4">
            <Link to="https://astrotring.com/">{website}</Link>
          </p> */}
          <h2 className="text-2xl font-semibold text-stone-900 mb-2">
            {title}
          </h2>
          <p className="text-stone-400 text-xs">
            Last Updated: {lastUpdated}
          </p>
          <div className="w-16 h-px bg-stone-200 mx-auto mt-3"></div>
        </div>

        {/* Content */}
        <div className="space-y-12">
          {sections.map(section => renderSection(section))}
        </div>

        {/* WEBSITE FOOTER NOTICE */}
        <div className="pt-6 mt-6 border-t border-stone-400">
  <h3 className="text-xl font-semibold text-stone-900 mb-4 text-center">
    WEBSITE FOOTER NOTICE
  </h3>
  <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
    <p className="text-justify">
      The following short-form notice is to be displayed in the footer of every page of www.astrotring.com :-
    </p>
  </div>
  <div className="space-y-4 mt-4 text-stone-600 text-xs font-sans leading-relaxed">
    <p className="text-justify">
      *Astrology services on www.astrotring.com are provided for guidance and knowledge  purposes only. Results may vary. Please read our full Disclaimer, Terms and Conditions, and Privacy Policy before using this website.*
    </p>
  </div>
</div>

        {/* Footer */}
        {/* <div className="mt-12 pt-8 border-t border-stone-100 text-center">
          <p className="text-xs text-stone-400 tracking-wide">
            © 2026 Veltex Services Private Limited. All rights reserved.
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default DisclaimerPage;