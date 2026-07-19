import { NavLink } from 'react-router-dom';
import { navItems } from '../data/navigation';

function Navigation() {
  return (
    <nav className="primary-navigation" aria-label="Primary navigation">
      <ul>
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `primary-navigation__link${isActive ? ' is-active' : ''}`}
            >
              <img src={item.icon} alt="" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navigation;
