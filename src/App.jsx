import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// Components
import CustomNavBar from "./Components/NavBar";
import Home from "./Components/Home";
import FourSections from "./Components/FourSections";
import Contacto from "./Components/Contacto";
import Preguntas from "./Components/Preguntas";
import FourSectionsAdmin from "./Components/FourSectionsAdmin";
import Reports from "./Components/Reports";
import AddDoctor from "./Components/AddDoctor";
import CreateScheduleForm from "./Components/CreateSchedule";
import CalendarPatient from "./Components/CalendarPatient";
import Footer from "./Components/Footer";
import ProfesionalList from "./Components/Profesional";
import EditDoctor from "./Components/EditDoctor";

import "./Styles/theme.css"
import "./Styles/addDoctorAddScheduleAddTurno.css";
import "./Styles/calendarPatient.css";
import "./Styles/contacto.css";
import "./Styles/home.css";
import "./Styles/fourSection.css";
import "./Styles/navbar.css";
import "./Styles/profesional.css"
import "./Styles/reports.css";



function AppRoutes() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  // Ocultar footer en rutas de administración y páginas internas de admin
  const path = location.pathname.toLowerCase();
  const adminLike = [
    "/admin",
    "/administracion",
    "/crear-agenda",
    "/agregarprofesional",
    "/reportes",
    "/editarprofesional"
  ];
  const hideFooter = adminLike.some((p) => path === p || path.startsWith(p + "/"));

  return (
    <div className="App d-flex flex-column min-vh-100">
      <CustomNavBar />

      <main className={`flex-grow-1 ${isHome ? "home-main" : ""} ${hideFooter ? "no-footer" : ""}`}>
        <Routes>
          {/* Home: héroe + secciones + contacto */}
          <Route
            path="/"
            element={
              <>
                <Home />
                <FourSections />
                <Contacto />
              </>
            }
          />

          {/* Preguntas */}
          <Route path="/preguntas" element={<Preguntas />} />

          {/* Admin */}
          <Route path="/admin" element={<FourSectionsAdmin />} />
          <Route path="/administracion" element={<FourSectionsAdmin />} />
          {/* Nota: /turnos queda como vista pública (footer visible) */}
          {/* <Route path="/turnos" element={<FourSectionsAdmin />} /> */}

          {/* Crear agenda, profesionales, reservar turno, reportes */}
          <Route path="/crear-agenda" element={<CreateScheduleForm />} />
          <Route path="/AgregarProfesional" element={<AddDoctor />} />
          <Route path="/reservar-turno" element={<CalendarPatient />} />
          <Route path="/reportes" element={<Reports />} />
          <Route path="/profesionales" element={<ProfesionalList />} />
          <Route path="/editarprofesional" element={<EditDoctor />} />
        </Routes>
      </main>

      {!hideFooter && <Footer />}
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


