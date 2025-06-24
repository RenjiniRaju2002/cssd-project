import React, { FC, useState } from 'react';
import './Footer.css';
import { ShortcutsModal } from '@/components/ui/shortcuts-modal';

const Footer: FC = () => {
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const toggleFullscreen = (): void => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err: any) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <>
      <div className="footer-container">
        <div className="footer-left">
          <span>© 2025</span>
          <a href="#">www.hodo.com</a>
          <span>Empowering Entrepreneurs in Healthcare</span>
          <span>
          <button 
            onClick={() => setIsShortcutsOpen(true)}
            className="text-[#0d92ae] hover:text-[#006688] hover:underline transition-colors"
          >
            shortcuts
          </button>
          </span>
        </div>
        <div className="footer-right">
          <button onClick={toggleFullscreen} className="fullscreen-btn" title="Toggle Fullscreen">
            ⛶
          </button>
        </div>
      </div>

      <ShortcutsModal 
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </>
  );
};

export default Footer;
