interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="layout__header">
      <div className="header">
        <div className="header__left">
          <button
            className="header__toggle"
            title="Toggle sidebar"
            onClick={onToggleSidebar}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
        <div className="header__right">
          <div className="header__user">
            <div className="header__user-avatar">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="20" fill="#FDE8E8" />
                <path
                  d="M20 21c3.315 0 6-2.685 6-6s-2.685-6-6-6-6 2.685-6 6 2.685 6 6 6zm0 3c-4.005 0-12 2.01-12 6v3h24v-3c0-3.99-7.995-6-12-6z"
                  fill="#E31837"
                />
              </svg>
            </div>
            <div className="header__user-info">
              <div className="header__user-name">Usuario</div>
              <div className="header__user-role">Administrador</div>
            </div>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
