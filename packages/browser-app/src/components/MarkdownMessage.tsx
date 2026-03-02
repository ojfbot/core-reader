import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import BadgeButton, { BadgeAction } from './BadgeButton';
import { useAppDispatch } from '../store/hooks';
import { setDraftInput } from '../store/slices/chatSlice';
import './MarkdownMessage.css';

interface MarkdownMessageProps {
  content: string;
  suggestions?: BadgeAction[];
  onExecute?: (message: string) => void;
  compact?: boolean;
}

function MarkdownMessage({ content, suggestions, onExecute, compact: _compact = false }: MarkdownMessageProps) {
  const dispatch = useAppDispatch();

  console.log('[MarkdownMessage] Rendering with content:', content.substring(0, 100));
  console.log('[MarkdownMessage] Suggestions:', suggestions);

  const handleExecute = (message: string) => {
    console.log('[MarkdownMessage] handleExecute called with:', message);
    if (onExecute) {
      onExecute(message);
    } else {
      dispatch(setDraftInput(message));
    }
  };

  return (
    <div className="markdown-message">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={(url) => {
          console.log('[MarkdownMessage] urlTransform called with:', url);
          // Preserve custom protocols like action:
          if (url.startsWith('action:')) {
            return url;
          }
          // Default transformation for other URLs
          return url;
        }}
        skipHtml={false}
        components={{
          a: ({ node, href, children, ...props }: any) => {
            console.log('[MarkdownMessage] Link component called:', { href, children });
            // Check if this is an action link
            if (href?.startsWith('action:')) {
              const actionMessage = href.replace('action:', '');
              const label = typeof children === 'string' ? children : children?.join?.('') || 'Action';

              console.log('[MarkdownMessage] Action link detected:', { actionMessage, label });

              // Extract icon from label if present (e.g., "📝 Write Blog Post")
              const iconMatch = label.match(/^([\u{1F300}-\u{1F9FF}])\s*(.+)$/u);
              const icon = iconMatch ? iconMatch[1] : undefined;
              const cleanLabel = iconMatch?.[2] || label;

              return (
                <BadgeButton
                  badgeAction={{
                    label: cleanLabel,
                    icon,
                    message: actionMessage,
                    variant: 'purple',
                  }}
                  onExecute={handleExecute}
                  className="inline-action"
                  size="sm"
                />
              );
            }
            // Regular link
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            );
          },
          ul: ({ children, ...props }: any) => {
            return <ul className="markdown-list" {...props}>{children}</ul>;
          },
          ol: ({ children, ...props }: any) => {
            return <ol className="markdown-list" {...props}>{children}</ol>;
          },
          blockquote: ({ children, ...props }: any) => {
            return <blockquote className="markdown-blockquote" {...props}>{children}</blockquote>;
          },
        }}
      >
        {content}
      </ReactMarkdown>

      {/* Render badge action suggestions if present */}
      {suggestions && suggestions.length > 0 && (
        <div className="markdown-suggestions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {suggestions.map((badgeAction, idx) => (
            <BadgeButton
              key={idx}
              badgeAction={badgeAction}
              onExecute={handleExecute}
              size="sm"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MarkdownMessage;
