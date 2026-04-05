import { Outlet } from 'react-router-dom';
import BottomNav from './components/BottomNav';

export default function App() {
  return (
    <>
      <main className="flex-1 pb-20 overflow-y-auto hide-scrollbar">
        <Outlet />
      </main>
      <BottomNav />
    </>
  );
}
