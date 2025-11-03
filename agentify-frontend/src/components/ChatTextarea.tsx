import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, ToolsIcon, AddIcon } from './icons/icons';

interface ChatTextareaProps {
  value?: string;
  onChange?: (value: string) => void;
  onSend?: (value: string) => void;
  onAddClick?: () => void;
  onToolsClick?: () => void;
  placeholder?: string;
  disabled?: boolean;
  width?: string;
}

const ChatTextarea: React.FC<ChatTextareaProps> = ({
  value = '',
  onChange,
  onSend,
  onAddClick,
  onToolsClick,
  placeholder = 'Type here...',
  disabled = false,
  width = 'w-full',
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [tokenCount] = useState(0);
  const [filesCount] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const contentEditableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentEditableRef.current && value !== inputValue) {
      contentEditableRef.current.textContent = value;
      setInputValue(value);
      setShowPlaceholder(value.length === 0);
    }
  }, [value]);

  const handleInput = () => {
    const newValue = contentEditableRef.current?.textContent || '';
    setInputValue(newValue);
    setShowPlaceholder(newValue.length === 0);
    onChange?.(newValue);
  };

  const handleSend = () => {
    if (inputValue.trim() && !disabled) {
      onSend?.(inputValue);
      setInputValue('');
      if (contentEditableRef.current) {
        contentEditableRef.current.textContent = '';
      }
      setShowPlaceholder(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={width}>
      <div className="relative w-full bg-white border-2 border-gray-200 rounded-[32px] px-6 py-4 flex flex-col gap-3 focus-within:border-agentify-dark transition-colors">
        {/* Top Row: Textarea and Send Icon */}
        <div className="flex items-start gap-3">
          {/* Content Editable Div */}
          <div className="flex-1 relative">
            {showPlaceholder && (
              <div className="absolute inset-0 text-gray-400 pointer-events-none text-base">
                {placeholder}
              </div>
            )}
            <div
              ref={contentEditableRef}
              contentEditable={!disabled}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-base disabled:opacity-50 max-h-[6rem] overflow-y-auto"
              style={{
                minHeight: '1.5rem',
                lineHeight: '1.5rem',
              }}
            />
          </div>

          {/* Send Icon */}
          <div className="w-7 h-7 flex-shrink-0">
            <button
              onClick={handleSend}
              disabled={disabled || !inputValue.trim()}
              className="group disabled:cursor-not-allowed mt-0.5"
              aria-label="Send message"
            >
              <SendIcon
                className={`h-7 w-7 transition-transform duration-300 cursor-pointer ${
                  disabled || !inputValue.trim()
                    ? 'opacity-0 invisible'
                    : 'opacity-100 visible rotate-0 text-agentify-accent-coral group-hover:rotate-45'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Bottom Row: Icons and Token/File Count */}
        <div className="flex items-center justify-between pt-1">
          {/* Left Icons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onAddClick}
              disabled={disabled}
              className="group transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Add attachment"
            >
              <AddIcon className="h-7 w-7 text-agentify-dark-gray group-hover:text-agentify-accent-coral transition-colors cursor-pointer" />
            </button>
            <button
              onClick={onToolsClick}
              disabled={disabled}
              className="group transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Tools"
            >
              <ToolsIcon className="h-6 w-6 text-agentify-dark-gray group-hover:text-agentify-accent-coral transition-colors cursor-pointer" />
            </button>
          </div>

          {/* Token and File Count */}
          <div className="text-xs text-agentify-dark-gray flex gap-2">
            <span>token count {tokenCount.toString().padStart(3, '0')}</span>
            <span>•</span>
            <span>files {filesCount.toString().padStart(3, '0')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatTextarea;
