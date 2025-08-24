import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Import Router and Route
import Reports from "./Components/Reports";
import "./Styles/reports.css";
import "./Styles/navbar.css";
import "./Styles/card.css";

import "./Styles/calendarPatient.css";
import FourSections from "./Components/FourSections"; // Componente Home
import FourSectionsAdmin from "./Components/FourSectionsAdmin"; // Componente para Turnos/Admin
import CustomNavBar from "./Components/NavBar";
import AddDoctor from "./Components/AddDoctor";
import CreateScheduleForm from "./Components/CreateSchedule";

import CalendarPatient from "./Components/CalendarPatient";

function App() {
  return (
    <Router>
      <div className="App">
        <CustomNavBar />

        <Routes>
          {/* Ruta para el Home */}
          <Route path="/" element={<FourSections />} />
          <Route path="/admin" element={<FourSectionsAdmin />} />
          <Route path="/AgregarProfesional" element={<AddDoctor />} />
          {/* Ruta para Turnos / Admin */}
          <Route path="/turnos" element={<FourSectionsAdmin />} />
          <Route path="/crear-agenda" element={<CreateScheduleForm />} />
          <Route path="/reservar-turno" element={<CalendarPatient />} />
          {/* Ruta para Reportes */}
          <Route path="/reportes" element={<Reports />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
