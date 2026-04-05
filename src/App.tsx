import { Outlet } from 'react-router-dom';
import BottomNav from './components/BottomNav';

export default function App() {
  return (
    <div className="noise-bg">
      <main className="flex-1 pb-20 overflow-y-auto hide-scrollbar relative z-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
