import React, { useState, useEffect, FC } from 'react';
import './Header.css';
import { ChevronLeftIcon, ChevronRightIcon } from '@primer/octicons-react';
import { Calendar, Clock, Calculator } from 'lucide-react';

interface HeaderProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const Header: FC<HeaderProps> = ({ sidebarCollapsed, toggleSidebar }) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const currentDate: string = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const formattedTime: string = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="header-container">
      <button
        className="sidebar-toggle-btn"
        onClick={toggleSidebar}
        title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {/* {sidebarCollapsed ? <ChevronRightIcon size={20} /> : <ChevronLeftIcon size={20} />} */}
        {sidebarCollapsed ?<img src="http://192.168.50.210:8123/renjiniraju/static/img/righthand.png" alt="right move" /> : <img src="lefthand.png" alt="left move" />}
      </button>
      <h1></h1>
      <div className="header-div">
        <div className="icons-div">
          <div className="icon-item">
            <Calendar size={25} className="header-icon" />
            <span className="header-span ">{currentDate}</span>
          </div>
          <div className="icon-item">
            <Clock size={25} className="header-icon" />
            <span className="header-span">{formattedTime}</span>
          </div>
          <div className="icon-item">
            <Calculator size={25} className="header-icon" />
            {/* <span>Calculator</span> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
