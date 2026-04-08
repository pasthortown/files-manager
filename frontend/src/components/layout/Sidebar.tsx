import { NavLink } from 'react-router-dom';

interface SidebarProps {
  collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  return (
    <aside className={`layout__sidebar${collapsed ? ' layout__sidebar--collapsed' : ''}`}>
      <nav className="sidebar">
        {/* Logo */}
        <div className="sidebar__logo">
          {collapsed ? (
            <img src="/logo-min.png" alt="Logo" style={{ width: 36, height: 'auto' }} />
          ) : (
            <img src="/logo.png" alt="Administrador de Archivos" style={{ maxWidth: '100%', height: 'auto' }} />
          )}
        </div>

        {/* HOME Section */}
        <div className="sidebar__section">
          <div className="sidebar__section-title">HOME</div>
          <ul className="sidebar__nav">
            <li className="sidebar__nav-item">
              <NavLink
                to="/"
                data-tooltip="Dashboard"
                className={({ isActive }) =>
                  `sidebar__nav-link${isActive ? ' sidebar__nav-link--active' : ''}`
                }
              >
                <svg className="sidebar__nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span>Dashboard</span>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* ARCHIVOS Section */}
        <div className="sidebar__section">
          <div className="sidebar__section-title">ARCHIVOS</div>
          <ul className="sidebar__nav">
            <li className="sidebar__nav-item">
              <NavLink
                to="/archivos"
                data-tooltip="Repositorio de Archivos"
                className={({ isActive }) =>
                  `sidebar__nav-link${isActive ? ' sidebar__nav-link--active' : ''}`
                }
              >
                <svg className="sidebar__nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                <span>Repositorio de Archivos</span>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Footer - Cerrar Sesion */}
        <div className="sidebar__footer">
          <button className="sidebar__nav-link sidebar__nav-link--logout" data-tooltip="Cerrar Sesion" style={{ border: 'none', width: '100%', cursor: 'pointer' }}>
            <svg className="sidebar__nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Cerrar Sesion</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
