import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="page-container min-h-screen flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
}