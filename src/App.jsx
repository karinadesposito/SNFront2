// App.jsx
import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";

import Reports from "./Components/Reports";
import "bootstrap/dist/css/bootstrap.min.css";   // por si lo cargás acá también
import "./Styles/reports.css";
import "./Styles/cards.css";
import "./Styles/calendarPatient.css";
import "./Styles/home.css";
import "./Styles/navbar.css";                    // ← SIEMPRE ÚLTIMO

import FourSections from "./Components/FourSections";
import FourSectionsAdmin from "./Components/FourSectionsAdmin";
import CustomNavBar from "./Components/NavBar";
import AddDoctor from "./Components/AddDoctor";
import CreateScheduleForm from "./Components/CreateSchedule";
import CalendarPatient from "./Components/CalendarPatient";
import Footer from "./Components/Footer";

function AppRoutes() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="App d-flex flex-column min-vh-100">
      <CustomNavBar />
      <main className={`flex-fill ${isHome ? "home-main" : ""}`}>
        <Routes>
          <Route path="/" element={<FourSections />} />
          <Route path="/admin" element={<FourSectionsAdmin />} />
          <Route path="/administracion" element={<FourSectionsAdmin />} />
          <Route path="/turnos" element={<FourSectionsAdmin />} />
          <Route path="/crear-agenda" element={<CreateScheduleForm />} />
          <Route path="/AgregarProfesional" element={<AddDoctor />} />
          <Route path="/reservar-turno" element={<CalendarPatient />} />
          <Route path="/reportes" element={<Reports />} />
        </Routes>
      </main>
      {isHome && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
