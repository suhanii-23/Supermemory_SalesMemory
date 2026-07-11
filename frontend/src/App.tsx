import { DashboardPage } from "./pages/DashboardPage";
import { ToastProvider } from "./components/toast/ToastContext";
import { LiveToastFeed } from "./components/toast/LiveToastFeed";

function App() {
  return (
    <ToastProvider>
      <LiveToastFeed />
      <DashboardPage />
    </ToastProvider>
  );
}

export default App;
