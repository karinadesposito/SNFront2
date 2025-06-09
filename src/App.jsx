// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import Router and Route
// import Reports from './Components/Reports';
// import "./Styles/reports.css";
// import "./Styles/navbar.css";
// import CustomNavBar from './Components/NavBar';



// function App() {
//   return (
//     <Router> {/* Wrap your application in Router */}
//       <div className="App">
//         <CustomNavBar />
      
//         <Routes> {/* Use Routes to define your routes */}
//           <Route path="/" element={<Reports />} /> {/* Use element prop to render Reports */}
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import Router and Route
import Reports from './Components/Reports';
import "./Styles/reports.css";
import "./Styles/navbar.css";
import "./Styles/card.css"; 

import FourSections from "./Components/FourSections"; // Componente Home
import FourSectionsAdmin from "./Components/FourSectionsAdmin"; // Componente para Turnos/Admin
import CustomNavBar from './Components/NavBar';
import AddDoctor from './Components/AddDoctor';

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

          {/* Ruta para Reportes */}
          <Route path="/turnos/reportes" element={<Reports />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;