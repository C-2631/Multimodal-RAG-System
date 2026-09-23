import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

/**
 * High-performance, zero-dependency Markdown Renderer tailored for scientific & editorial research.
 * Formats headings, bold text, italics, bullet lists, numbered lists, blockquotes, code blocks,
 * citations like [1], [2], and embedded images `![caption](url)`.
 */
export const MarkdownRenderer = ({ content, className = '' }) => {
  if (!content) return null;

  // Clean out any accidental outer wrapping quotes
  let text = content.trim();
  if (text.startsWith('"') && text.endsWith('"') && text.length > 2) {
    text = text.slice(1, -1).trim();
  }

  const lines = text.split('\n');
  const elements = [];
  let inList = false;
  let listType = 'ul';
  let listItems = [];
  let codeBlock = [];
  let inCodeBlock = false;

  const flushList = (keyPrefix) => {
    if (listItems.length > 0) {
      if (listType === 'ol') {
        elements.push(
          <ol key={`${keyPrefix}-ol`} className="list-decimal pl-5 my-3 space-y-1.5 text-slate-800 text-sm sm:text-base">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{renderInline(item)}</li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`${keyPrefix}-ul`} className="list-disc pl-5 my-3 space-y-1.5 text-slate-800 text-sm sm:text-base marker:text-brand-600">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{renderInline(item)}</li>
            ))}
          </ul>
        );
      }
      listItems = [];
      inList = false;
    }
  };

  const flushCodeBlock = (keyPrefix) => {
    if (codeBlock.length > 0) {
      elements.push(
        <pre key={`${keyPrefix}-code`} className="bg-slate-900 text-purple-200 p-4 rounded-2xl overflow-x-auto text-xs font-mono my-4 border border-slate-800 shadow-inner">
          <code>{codeBlock.join('\n')}</code>
        </pre>
      );
      codeBlock = [];
      inCodeBlock = false;
    }
  };

  const renderInline = (str) => {
    if (!str) return null;

    // 1. Markdown Images: ![alt](url)
    const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = imgRegex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }
      const alt = match[1];
      let src = match[2];
      if (src.startsWith('/')) {
        const backendHost = (import.meta.env.VITE_API_URL || 'http://localhost:8001').replace(/\/$/, '');
        src = `${backendHost}${src}`;
      }
      parts.push(
        <span key={`img-${match.index}`} className="block my-3 rounded-2xl overflow-hidden border border-purple-200 shadow-md max-w-lg bg-slate-900">
          <img src={src} alt={alt} className="w-full h-auto object-cover" />
          {alt && <span className="block text-[11px] font-sans text-slate-500 bg-slate-50 px-3 py-1.5 border-t border-slate-100">{alt}</span>}
        </span>
      );
      lastIndex = imgRegex.lastIndex;
    }

    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }

    return parts.map((part, pIdx) => {
      if (typeof part !== 'string') return part;

      // Handle Bold (**bold**), Italic (*italic*), Citations [1], and Markdown Links [text](url)
      // Split tokens
      const formattedParts = [];
      // Regex for links [text](url), bold **text**, inline code `code`, citation [1]
      const tokenRegex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*|\*.*?\*|`.*?`|\[\d+\])/g;
      let tokenLast = 0;
      let tokenMatch;

      while ((tokenMatch = tokenRegex.exec(part)) !== null) {
        if (tokenMatch.index > tokenLast) {
          formattedParts.push(part.substring(tokenLast, tokenMatch.index));
        }
        const token = tokenMatch[1];
        if (token.startsWith('**') && token.endsWith('**')) {
          formattedParts.push(<strong key={tokenMatch.index} className="font-semibold text-slate-900">{token.slice(2, -2)}</strong>);
        } else if (token.startsWith('*') && token.endsWith('*')) {
          formattedParts.push(<em key={tokenMatch.index} className="italic text-slate-800">{token.slice(1, -1)}</em>);
        } else if (token.startsWith('`') && token.endsWith('`')) {
          formattedParts.push(<code key={tokenMatch.index} className="px-1.5 py-0.5 rounded bg-purple-50 text-brand-700 font-mono text-xs border border-purple-100">{token.slice(1, -1)}</code>);
        } else if (token.startsWith('[') && token.includes('](')) {
          const linkMatch = token.match(/\[(.*?)\]\((.*?)\)/);
          if (linkMatch) {
            formattedParts.push(
              <a key={tokenMatch.index} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-800 font-medium underline inline-flex items-center gap-0.5">
                {linkMatch[1]}
                <ExternalLink className="w-3 h-3 inline" />
              </a>
            );
          }
        } else if (/^\[\d+\]$/.test(token)) {
          formattedParts.push(
            <span key={tokenMatch.index} className="inline-flex items-center justify-center px-1.5 py-0.2 mx-0.5 rounded-full bg-amber-100 text-amberGold-dark font-mono text-[11px] font-bold border border-amber-200 shadow-2xs cursor-pointer hover:bg-amber-200 transition-colors" title={`Source Citation ${token}`}>
              {token}
            </span>
          );
        } else {
          formattedParts.push(token);
        }
        tokenLast = tokenRegex.lastIndex;
      }

      if (tokenLast < part.length) {
        formattedParts.push(part.substring(tokenLast));
      }

      return <span key={pIdx}>{formattedParts}</span>;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock(i);
      } else {
        flushList(i);
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlock.push(line);
      continue;
    }

    if (!trimmed) {
      flushList(i);
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      flushList(i);
      elements.push(
        <h3 key={i} className="font-display text-lg sm:text-xl font-bold text-slate-900 mt-5 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
          {renderInline(trimmed.slice(4))}
        </h3>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList(i);
      elements.push(
        <h2 key={i} className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-6 mb-3 pb-1 border-b border-purple-100">
          {renderInline(trimmed.slice(3))}
        </h2>
      );
    } else if (trimmed.startsWith('# ')) {
      flushList(i);
      elements.push(
        <h1 key={i} className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-6 mb-4 text-brand-900">
          {renderInline(trimmed.slice(2))}
        </h1>
      );
    } else if (trimmed.startsWith('> ')) {
      flushList(i);
      elements.push(
        <blockquote key={i} className="my-3 pl-4 border-l-4 border-amberGold bg-amber-50/40 p-3 rounded-r-2xl font-serif text-slate-700 italic text-sm sm:text-base leading-relaxed">
          {renderInline(trimmed.slice(2))}
        </blockquote>
      );
    } else if (/^[-*•]\s+/.test(trimmed)) {
      if (!inList || listType !== 'ul') {
        flushList(i);
        inList = true;
        listType = 'ul';
      }
      listItems.push(trimmed.replace(/^[-*•]\s+/, ''));
    } else if (/^\d+\.\s+/.test(trimmed)) {
      if (!inList || listType !== 'ol') {
        flushList(i);
        inList = true;
        listType = 'ol';
      }
      listItems.push(trimmed.replace(/^\d+\.\s+/, ''));
    } else {
      flushList(i);
      elements.push(
        <p key={i} className="text-slate-800 text-sm sm:text-base leading-relaxed font-sans my-2.5">
          {renderInline(trimmed)}
        </p>
      );
    }
  }

  flushList('final');
  flushCodeBlock('final');

  return <div className={`markdown-content space-y-1 ${className}`}>{elements}</div>;
};
