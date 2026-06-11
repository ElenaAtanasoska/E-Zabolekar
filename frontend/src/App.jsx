import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SetupClinic from "./pages/SetupClinic";
import Dashboard from "./pages/Dashboard";
import ManageDoctors from "./pages/ManageDoctors"; 
import CompleteDoctorProfile from "./pages/CompleteDoctorProfile";
import DoctorProfile from "./pages/DoctorProfile";
import AddPatient from "./pages/AddPatient";
import PatientProfile from './pages/PatientProfile';
import PatientInfo from "./pages/PatientInfo";
import XRayView from "./pages/XRayView";
import TeethDesktop from "./pages/TeethDesktop";
import ToothDetail from "./pages/ToothDetail";
import ToothMainInfo from "./pages/ToothMainInfo";
import PeriodonticFlow from "./pages/PeriodonticFlow";
import TreatmentForm from "./pages/TreatmentForm";
import AboutUs from "./pages/AboutUs";
import Help from "./pages/Help";

function App() {
  return (
    <Routes>
      <Route index element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/aboutUs" element={<AboutUs />} />
      <Route path="/help" element={<Help />} />
      <Route path="/setup-clinic" element={<SetupClinic />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/manage-doctors" element={<ManageDoctors />} />
      <Route path="/complete-doctor-profile" element={<CompleteDoctorProfile />} />
      <Route path="/profile" element={<DoctorProfile />} />
      <Route path="/add-patient" element={<AddPatient />} />
      <Route path="/patient/:id" element={<PatientProfile />} />
      <Route path="/patient/:id/info" element={<PatientInfo />} />
      <Route path="/patient/:id/xray" element={<XRayView />} />
      <Route path="/patient/:id/chart" element={<TeethDesktop />} />
      <Route path="/patient/:id/chart/:toothId" element={<ToothDetail />}>
        {/* This is the magic part: index means 'show this by default' */}
        <Route index element={<ToothMainInfo />} />

        <Route path="add-treatment" element={<TreatmentForm />} />

        {/* Your new periodontic component will go here later */}
        <Route path="periodontic-flow" element={<PeriodonticFlow />} />
      </Route>
    </Routes>
  );
}

export default App;