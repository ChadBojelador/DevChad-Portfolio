import { NavLink } from 'react-router-dom';
import { navItems } from '../data/navigation';

function Navigation() {
  // Group nav items by their `group` property to render sections with spacing
  const groups = [];
  let currentGroup = null;

  navItems.forEach((item) => {
    if (item.group !== currentGroup) {
      groups.push({ key: item.group, items: [] });
      currentGroup = item.group;
    }
    groups[groups.length - 1].items.push(item);
  });

  return (
    <nav className="primary-navigation" aria-label="Primary navigation">
      {groups.map((group) => (
        <ul key={group.key} className="primary-navigation__group">
          {group.items.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `primary-navigation__link${isActive ? ' is-active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      ))}
    </nav>
  );
}

export default Navigation;
