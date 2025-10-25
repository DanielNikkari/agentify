import React from 'react';
import clsx from 'clsx';

interface AuthButtonProps {
  icon: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  bgClass?: string;
  textClass?: string;
  hoverClass?: string;
  shadowClass?: string;
  borderClass?: string;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  icon,
  label,
  onClick,
  disabled = false,
  bgClass = 'bg-white',
  textClass = 'text-black',
  hoverClass = '',
  shadowClass = '',
  borderClass = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'relative h-12 w-full rounded-full px-4 pl-12 text-base font-medium transition',
        bgClass,
        textClass,
        shadowClass,
        hoverClass,
        borderClass,
        disabled && 'opacity-60 cursor-not-allowed'
      )}
    >
      <img
        src={icon}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-7 w-7"
      />
      <span className="block text-center leading-none">{label}</span>
    </button>
  );
};

export default AuthButton;
