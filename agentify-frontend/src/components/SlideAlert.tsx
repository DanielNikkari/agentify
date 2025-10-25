import React, { useEffect, useState } from 'react';

type SlideAlertProps = {
  type?: 'error' | 'success' | 'info' | 'warning';
  message: string;
  duration?: number; // ms; default 5000
  onClose?: () => void;
};

const colorByType: Record<NonNullable<SlideAlertProps['type']>, string> = {
  error: 'bg-red-50 border-red-200 text-red-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
};

const iconByType: Record<NonNullable<SlideAlertProps['type']>, any> = {
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 20">
      <path
        fill="currentColor"
        d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07m1.41-1.41A8 8 0 1 0 15.66 4.34A8 8 0 0 0 4.34 15.66m9.9-8.49L11.41 10l2.83 2.83l-1.41 1.41L10 11.41l-2.83 2.83l-1.41-1.41L8.59 10L5.76 7.17l1.41-1.41L10 8.59l2.83-2.83z"
      />
    </svg>
  ),
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
      <path
        fill="currentColor"
        fill-rule="evenodd"
        d="M256 42.667C138.18 42.667 42.667 138.18 42.667 256S138.18 469.334 256 469.334S469.334 373.82 469.334 256S373.821 42.667 256 42.667m0 384c-94.105 0-170.666-76.561-170.666-170.667S161.894 85.334 256 85.334S426.667 161.894 426.667 256S350.106 426.667 256 426.667m80.336-246.886l30.167 30.167l-131.836 132.388l-79.083-79.083l30.166-30.167l48.917 48.917z"
      />
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M11 17h2v-6h-2zm1-8q.425 0 .713-.288T13 8t-.288-.712T12 7t-.712.288T11 8t.288.713T12 9m0 13q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"
      />
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M1 21L12 2l11 19zm3.45-2h15.1L12 6zM12 18q.425 0 .713-.288T13 17t-.288-.712T12 16t-.712.288T11 17t.288.713T12 18m-1-3h2v-5h-2zm1-2.5"
      />
    </svg>
  ),
};

const SlideAlert: React.FC<SlideAlertProps> = ({
  type = 'info',
  message,
  duration = 5000,
  onClose,
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // slide in
    const enter = requestAnimationFrame(() => setOpen(true));
    // start auto close timers
    const hideTimer = setTimeout(() => setOpen(false), duration);
    // allow 300ms for transition before unmount callback
    const cleanupTimer = setTimeout(() => onClose?.(), duration + 320);

    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(hideTimer);
      clearTimeout(cleanupTimer);
    };
  }, [duration, onClose]);

  return (
    <div
      className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl px-4 pt-4 pointer-events-none"
      role="alert"
      aria-live="assertive"
    >
      <div
        className={[
          'transition-all duration-300 ease-out',
          'transform',
          open ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0',
        ].join(' ')}
      >
        <div
          className={[
            'pointer-events-auto rounded-xl border shadow-lg',
            'px-4 py-3',
            'flex items-start gap-3',
            colorByType[type],
          ].join(' ')}
        >
          <span className="m-2 text-sm font-medium">{iconByType[type]}</span>
          <p className="m-2 text-sm flex-1">{message}</p>
          <button
            type="button"
            aria-label="Close alert"
            className="ml-2 -mr-1 p-1 rounded hover:bg-black/5 transition text-inherit"
            onClick={() => {
              setOpen(false);
              setTimeout(() => onClose?.(), 320);
            }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlideAlert;
