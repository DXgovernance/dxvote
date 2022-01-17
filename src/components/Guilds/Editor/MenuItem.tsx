import './MenuItem.scss';
import remixiconUrl from 'remixicon/fonts/remixicon.symbol.svg';

interface Props {
  icon?: any;
  title?: any;
  action?: any;
  isActive?: any;
}

const MenuItem = ({ icon, title, action, isActive = null }: Props) => (
  <button
    className={`menu-item${isActive && isActive() ? ' is-active' : ''}`}
    onClick={action}
    title={title}
  >
    <svg className="remix">
      <use xlinkHref={`${remixiconUrl}#ri-${icon}`} />
    </svg>
  </button>
);
export default MenuItem;
