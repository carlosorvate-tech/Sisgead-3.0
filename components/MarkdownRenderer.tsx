import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

/**
 * A simple component to render basic Markdown syntax into HTML.
 * Supports headings (#, ##), bold (**), unordered lists (* or -),
 * code blocks (```), and inline code (`).
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const createMarkup = () => {
    let html = content
      .trim()
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 mt-6">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3 mt-5">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-200 text-sm px-1 rounded mx-0.5 font-mono">$1</code>')
      .replace(/```([\s\S]*?)```/g, (_: any, code: string) => `<pre class="bg-slate-100 p-3 rounded-md text-sm font-mono my-4 whitespace-pre-wrap"><code>${code.trim()}</code></pre>`);

    const blocks = html.split('\n\n').map(block => {
      // Handle lists
      if (block.match(/^(\*|-|\d+\.) /m)) {
        const listItems = block.split('\n').map(item => {
            // Unordered list
            const ulMatch = item.match(/^(\*|-) (.*)/);
            if (ulMatch) return `<li>${ulMatch[2]}</li>`;
            return item;
        }).join('');
        
        return `<ul class="list-disc list-inside my-4 pl-4 space-y-1">${listItems}</ul>`;
      }
      
      // Handle paragraphs for blocks that are not already html tags
      if (!block.startsWith('<') && block.trim() !== '') {
        return `<p>${block.replace(/\n/g, '<br/>')}</p>`;
      }
      
      return block;
    }).join('');

    return { __html: blocks };
  };

  return <div className="prose prose-sm max-w-none text-brand-secondary" dangerouslySetInnerHTML={createMarkup()} />;
};
