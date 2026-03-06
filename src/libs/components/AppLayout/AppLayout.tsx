import { FC } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { NavigationBar } from "../NavigationBar/NavigationBar";

export const AppLayout: FC = () => {
  const { user } = useAuth();

  return (
    <div className="app">
      <NavigationBar userName={user?.fullName || ""} />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};
