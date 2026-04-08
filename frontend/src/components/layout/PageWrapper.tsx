import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const PageWrapper: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  return (
    <div className="layout">
      <Sidebar collapsed={sidebarCollapsed} />
      <main className={`layout__main${sidebarCollapsed ? ' layout__main--expanded' : ''}`}>
        <Header onToggleSidebar={handleToggleSidebar} />
        <div className="layout__content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PageWrapper;
