import React from 'react';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  // Safety check: ensure content is a string
  if (typeof content !== 'string') {
    console.warn('MarkdownRenderer received non-string content:', content);
    return (
      <div className={cn("florence-markdown", className)}>
        <p className="text-red-500">Error: Invalid content format</p>
      </div>
    );
  }

  // Function to parse and render markdown-like content
  const renderMarkdown = (text: string) => {
    // Split content into lines
    const lines = text.split('\n');
    let inList = false;
    let listItems: React.ReactNode[] = [];
    
    const renderList = () => {
      if (listItems.length > 0) {
        const list = (
          <div key={`list-${Date.now()}`} className="space-y-1 mb-3">
            {listItems}
          </div>
        );
        listItems = [];
        return list;
      }
      return null;
    };
    
    const elements: React.ReactNode[] = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) {
        if (inList) {
          const list = renderList();
          if (list) elements.push(list);
          inList = false;
        }
        elements.push(<br key={`br-${index}`} />);
        return;
      }
      
      // Headers (## and ###)
      if (trimmedLine.startsWith('### ')) {
        if (inList) {
          const list = renderList();
          if (list) elements.push(list);
          inList = false;
        }
        elements.push(
          <h3 key={index} className="text-base font-semibold text-foreground mt-3 mb-2">
            {trimmedLine.substring(4)}
          </h3>
        );
        return;
      }
      
      if (trimmedLine.startsWith('## ')) {
        if (inList) {
          const list = renderList();
          if (list) elements.push(list);
          inList = false;
        }
        elements.push(
          <h2 key={index} className="text-lg font-bold text-foreground mt-4 mb-2">
            {trimmedLine.substring(3)}
          </h2>
        );
        return;
      }
      
      // Bullet points (• or -)
      if (trimmedLine.startsWith('• ') || trimmedLine.startsWith('- ')) {
        inList = true;
        listItems.push(
          <div key={index} className="flex items-start">
            <span className="text-primary mr-2 mt-1 text-sm">•</span>
            <span className="flex-1 text-sm leading-relaxed">
              {renderInlineMarkdown(trimmedLine.substring(2))}
            </span>
          </div>
        );
        return;
      }
      
      // Numbered lists (1. 2. etc.)
      if (/^\d+\.\s/.test(trimmedLine)) {
        const match = trimmedLine.match(/^(\d+)\.\s(.+)/);
        if (match) {
          inList = true;
          listItems.push(
            <div key={index} className="flex items-start">
              <span className="text-primary font-medium mr-2 mt-1 min-w-[20px] text-sm">
                {match[1]}.
              </span>
              <span className="flex-1 text-sm leading-relaxed">
                {renderInlineMarkdown(match[2])}
              </span>
            </div>
          );
          return;
        }
      }
      
      // Regular paragraph
      if (inList) {
        const list = renderList();
        if (list) elements.push(list);
        inList = false;
      }
      
      elements.push(
        <p key={index} className="mb-2 text-sm text-foreground leading-relaxed">
          {renderInlineMarkdown(trimmedLine)}
        </p>
      );
    });
    
    // Render any remaining list
    if (inList) {
      const list = renderList();
      if (list) elements.push(list);
    }
    
    return elements;
  };
  
  // Function to render inline markdown (bold, italic, etc.)
  const renderInlineMarkdown = (text: string) => {
    // Bold text (**text**)
    if (text.includes('**')) {
      const parts = text.split('**');
      return parts.map((part, partIndex) => 
        partIndex % 2 === 1 ? (
          <strong key={partIndex} className="font-semibold text-foreground">
            {part}
          </strong>
        ) : (
          <span key={partIndex}>{part}</span>
        )
      );
    }
    
    // Italic text (*text*)
    if (text.includes('*')) {
      const parts = text.split('*');
      return parts.map((part, partIndex) => 
        partIndex % 2 === 1 ? (
          <em key={partIndex} className="italic text-foreground">
            {part}
          </em>
        ) : (
          <span key={partIndex}>{part}</span>
        )
      );
    }
    
    return text;
  };

  return (
    <div className={cn("florence-markdown", className)}>
      <div className="space-y-1">
        {renderMarkdown(content)}
      </div>
    </div>
  );
}; 