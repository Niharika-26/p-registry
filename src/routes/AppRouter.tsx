import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PatientForm from "@/views/PatientForm/PatientForm";
import PatientListing from "@/views/PatientList/PatientList";
import { AppNavbar } from "@/components/AppNavbar";
import QueryInterface from "@/views/PatientList/components/QueryInterface";

const AppRouter = () => {
  return (
    <Router>
      <div className="flex h-screen overflow-hidden">
        <AppNavbar /> 
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          <Routes>
            <Route path="/register-patient" element={<PatientForm />} />
            <Route path="/patients" element={<PatientListing />} />
            <Route path="/" element={<PatientListing />} />
            <Route path="/patients/query" element={<QueryInterface />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};
export default AppRouter;