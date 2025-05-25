import AppRouter from "@/routes/AppRouter";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" reverseOrder={false} />
      <AppRouter />
    </div>
  );
}

export default App;