import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Tiktoken, encodingForModel } from 'js-tiktoken';
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
  const [filesCount] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const dragCounterRef = useRef(0);

  // Initialize tokenizer (use cl100k_base encoding for GPT-4 and modern models)
  const tokenizer = useMemo(() => {
    try {
      return encodingForModel('gpt-4');
    } catch (error) {
      console.error('Failed to initialize tokenizer:', error);
      return null;
    }
  }, []);

  // Calculate token count
  const tokenCount = useMemo(() => {
    if (!tokenizer || !inputValue.trim()) {
      return 0;
    }
    try {
      const tokens = tokenizer.encode(inputValue);
      return tokens.length;
    } catch (error) {
      console.error('Failed to count tokens:', error);
      return 0;
    }
  }, [inputValue, tokenizer]);

  useEffect(() => {
    if (contentEditableRef.current && value !== inputValue) {
      contentEditableRef.current.textContent = value;
      setInputValue(value);
      setShowPlaceholder(value.length === 0);
    }
  }, [value, inputValue]);

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

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // TODO: Handle file upload
      console.log('Files dropped:', files);
      // You can add file processing logic here
    }
  };

  return (
    <div
      className={width}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="relative w-full bg-white border-2 border-gray-200 rounded-[32px] px-6 py-4 flex flex-col gap-3 focus-within:border-agentify-dark transition-colors">
        {/* Drag and Drop Overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 rounded-[32px] border-4 border-dashed border-agentify-accent-coral flex items-center justify-center pointer-events-none bg-white/70">
            <div className="flex flex-col items-center gap-3">
              {/* Upload Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-agentify-accent-coral"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
          </div>
        )}

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
            <span>token count {tokenCount}</span>
            <span>•</span>
            <span>files {filesCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatTextarea;
