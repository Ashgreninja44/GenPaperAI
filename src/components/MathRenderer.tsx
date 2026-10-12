import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

/**
 * Normalizes common legacy/ASCII math notation into clean LaTeX where appropriate,
 * without altering regular English sentences.
 */
export function normalizeMathText(text: string): string {
  if (!text) return '';

  let normalized = text;

  // If text already contains explicit LaTeX delimiters ($...$, $$...$$, \(...\), \[...\]),
  // we do minimal cleanup to avoid corrupting LaTeX syntax.
  const hasLatexDelimiters = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^\$\n]+?\$|\\\([\s\S]+?\\\))/.test(normalized);

  if (!hasLatexDelimiters) {
    // Check if the string has obvious mathematical constructs that should be wrapped
    // E.g., standalone LaTeX commands without $ delimiters (e.g. \frac{a}{b}, \sqrt{x}, \alpha, \theta)
    if (/\\[a-zA-Z]+(\{.*?\})?/.test(normalized)) {
      // If there are naked LaTeX macros like \frac{1}{2} or \sqrt{x}, wrap them or treat as math
      normalized = normalized.replace(/(\\frac\{[^{}]*\}\{[^{}]*\}|\\sqrt\{[^{}]*\}|\\[a-zA-Z]+)/g, (match) => {
        return `$${match}$`;
      });
    }
  }

  return normalized;
}

interface Segment {
  type: 'text' | 'inline-math' | 'block-math';
  content: string;
}

/**
 * Parses mixed text and LaTeX formulas into ordered segments.
 */
function parseContentToSegments(input: string): Segment[] {
  if (!input) return [];

  const segments: Segment[] = [];
  
  // Regex to match:
  // 1. Block math: $$...$$ or \[...\]
  // 2. Inline math: $...$ or \(...\)
  const mathRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$(?!\s)[^$\n]+?(?<!\s)\$|\\\([\s\S]*?\\\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mathRegex.exec(input)) !== null) {
    const matchIndex = match.index;
    const fullMatch = match[0];

    // Push preceding text segment if any
    if (matchIndex > lastIndex) {
      segments.push({
        type: 'text',
        content: input.slice(lastIndex, matchIndex)
      });
    }

    // Determine math type and strip delimiters
    if (fullMatch.startsWith('$$') && fullMatch.endsWith('$$')) {
      segments.push({
        type: 'block-math',
        content: fullMatch.slice(2, -2).trim()
      });
    } else if (fullMatch.startsWith('\\[') && fullMatch.endsWith('\\]')) {
      segments.push({
        type: 'block-math',
        content: fullMatch.slice(2, -2).trim()
      });
    } else if (fullMatch.startsWith('\\(') && fullMatch.endsWith('\\)')) {
      segments.push({
        type: 'inline-math',
        content: fullMatch.slice(2, -2).trim()
      });
    } else if (fullMatch.startsWith('$') && fullMatch.endsWith('$')) {
      segments.push({
        type: 'inline-math',
        content: fullMatch.slice(1, -1).trim()
      });
    }

    lastIndex = matchIndex + fullMatch.length;
  }

  // Push remaining text if any
  if (lastIndex < input.length) {
    segments.push({
      type: 'text',
      content: input.slice(lastIndex)
    });
  }

  return segments;
}

/**
 * Safely renders a LaTeX math expression to HTML string using KaTeX.
 */
function renderLatex(expression: string, isBlock: boolean): string {
  try {
    return katex.renderToString(expression, {
      displayMode: isBlock,
      throwOnError: false,
      output: 'htmlAndMathml',
      strict: false,
      trust: false // Prevent arbitrary execution / XSS
    });
  } catch {
    // If KaTeX rendering fails, safely fallback to raw expression
    return expression;
  }
}

/**
 * MathRenderer component for rendering strings containing mixed LaTeX and plain text.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = '',
  inline = false
}) => {
  const processedContent = useMemo(() => normalizeMathText(content || ''), [content]);
  const segments = useMemo(() => parseContentToSegments(processedContent), [processedContent]);

  if (!content) return null;

  // If there are no math segments, render plain text with line breaks preserved
  if (segments.length === 1 && segments[0].type === 'text') {
    return <span className={className}>{segments[0].content}</span>;
  }

  const Wrapper = inline ? 'span' : 'div';

  return (
    <Wrapper className={`math-rendered-container ${className}`}>
      {segments.map((seg, idx) => {
        if (seg.type === 'text') {
          return <span key={idx}>{seg.content}</span>;
        }

        const isBlock = seg.type === 'block-math';
        const html = renderLatex(seg.content, isBlock);

        if (isBlock) {
          return (
            <div
              key={idx}
              className="my-2 overflow-x-auto text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }

        return (
          <span
            key={idx}
            className="inline-math-item inline-block align-middle mx-0.5"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </Wrapper>
  );
};

export default MathRenderer;
