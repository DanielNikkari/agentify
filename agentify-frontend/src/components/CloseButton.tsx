import React from 'react';
import clsx from 'clsx';
import closeButton from '../assets/icons/close-icon.svg';

interface CloseButtonProps {
  onClose: () => void;
  positionClass?: string;
}

const CloseButton: React.FC<CloseButtonProps> = ({
  onClose,
  positionClass = 'sticky top-0 z-10 flex justify-end p-1 bg-transparent',
}) => {
  return (
    <div className={clsx(positionClass)}>
      <button onClick={onClose} className="hover:cursor-pointer" aria-label="Close">
        <img
          src={closeButton}
          alt="Close button"
          className="w-5 h-5 md:bg-agentify-red md:stroke-agentify-red-light md:hover:bg-transparent md:hover:bg-agentify-red rounded-full transition"
        />
      </button>
    </div>
  );
};

export default CloseButton;
