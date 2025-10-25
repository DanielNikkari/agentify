import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import CloseButton from './CloseButton';

interface TermsAndConditionsProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ isOpen, onClose }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetch('/terms_and_conditions.md')
        .then((res) => res.text())
        .then((text) => setContent(text))
        .catch((err) => console.error('Failed to load terms:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Terms and Conditions"
    >
      <div
        className="bg-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton
          onClose={onClose}
          positionClass="sticky top-0 z-10 flex justify-end p-0 bg-transparent"
        />

        <div className="max-w-none text-left">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => (
                <h1
                  className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-gray-900 mb-4"
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  className="text-2xl md:text-3xl font-semibold leading-snug text-gray-900 mt-8 mb-3"
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  className="text-xl md:text-2xl font-semibold text-gray-900 mt-6 mb-2"
                  {...props}
                />
              ),
              h4: ({ node, ...props }) => (
                <h4
                  className="text-lg md:text-xl font-semibold text-gray-900 mt-5 mb-2"
                  {...props}
                />
              ),
              p: ({ node, ...props }) => (
                <p className="text-base leading-7 text-gray-700 mb-4" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a
                  className="underline underline-offset-2 hover:no-underline text-blue-600"
                  {...props}
                />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-6 space-y-1 mb-4" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-6 space-y-1 mb-4" {...props} />
              ),
              li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-4 border-gray-200 pl-4 italic text-gray-600 my-4"
                  {...props}
                />
              ),
              hr: ({ node, ...props }) => <hr className="my-8 border-gray-200" {...props} />,
              code: ({ className, children, ...props }) => {
                const isInline = !String(children).includes('\n');
                if (isInline) {
                  return (
                    <code
                      className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 text-sm"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }
                return (
                  <pre className="p-3 rounded bg-gray-900 text-gray-100 overflow-x-auto text-sm mb-4">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                );
              },
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full text-left border border-gray-200" {...props} />
                </div>
              ),
              thead: ({ node, ...props }) => <thead className="bg-gray-50" {...props} />,
              th: ({ node, ...props }) => (
                <th
                  className="px-3 py-2 font-semibold text-gray-900 border-b border-gray-200"
                  {...props}
                />
              ),
              td: ({ node, ...props }) => (
                <td
                  className="px-3 py-2 text-gray-700 align-top border-b border-gray-200"
                  {...props}
                />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
