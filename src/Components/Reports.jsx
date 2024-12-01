// import React, { useState, useEffect } from "react";


// const Reports = () => {
//   const [estado, setEstado] = useState("");
//   const [idDoctor, setIdDoctor] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [patientId, setPatientId] = useState("");
//   const [data, setData] = useState([]);
//   const [doctors, setDoctors] = useState([]);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Función para obtener los doctores
//   const fetchDoctors = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch("http://localhost:3000/doctors");
//       const result = await response.json();

//       // Verifica si los datos están en el formato esperado
//       if (result.data && Array.isArray(result.data)) {
//         setDoctors(result.data); // Guarda los doctores
//       } else {
//         setError("Los datos de doctores no están en el formato esperado");
//       }
//     } catch (error) {
//       console.error("Error fetching doctors:", error);
//       setError("Hubo un error al obtener los doctores");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Llamada a la función para obtener los doctores cuando el componente se monta
//   useEffect(() => {
//     fetchDoctors();
//   }, []);

//   // Función para obtener los reportes
//   const fetchReports = async () => {
//     const queryParams = new URLSearchParams({
//       idDoctor,
//       startDate,
//       endDate,
//       patientId,
//     }).toString();

//     try {
//       const response = await fetch(
//         `http://localhost:3000/schedules/report/${estado}?${queryParams}`
//       );
//       const result = await response.json();
//       setData(result);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   return (
//     <div className="reports-container">
//       <h2>Reportes de Turnos</h2>

//       <div className="reports-content">
//         {/* Contenedor de Filtros */}
//         <div className="filter-container">
//           <label>Seleccione un estado:</label>
//           <select value={estado} onChange={(e) => setEstado(e.target.value)}>             
//           <option value="">Todos</option>
//             <option value="disponible">Disponible</option>
//             <option value="confirmado">Confirmado</option>
//             <option value="cancelado">Cancelado</option>
//             <option value="eliminado">Eliminado</option>
//             <option value="ejecutado">Ejecutado</option>
//             <option value="no_asistido">No Asistido</option>
//             <option value="no_reservado">No Reservado</option>
//           </select>

//           <label>Doctor:</label>
//           <select
//             value={idDoctor}
//             onChange={(e) => setIdDoctor(e.target.value)}
//           >
//             <option value="">Seleccione un doctor</option>
//             {doctors.map((doctor) => (
//               <option key={doctor.id} value={doctor.id}>
//                 {doctor.fullName} {/* Muestra el nombre completo del doctor */}
//               </option>
//             ))}
//           </select>
//           <label>Fecha de Inicio:</label>
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//           />
//           <label>Fecha de Fin:</label>
//           <input
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//           />
//           <label>Paciente (DNI):</label>
//           <input
//             type="number"
//             value={patientId} // Cambiar el nombre si prefieres algo como "dni"
//             onChange={(e) => setPatientId(e.target.value)} // Actualizar el estado con el DNI
//             placeholder="DNI sin puntos"
//           />
//           <button onClick={fetchReports}>Obtener Reportes</button>
//         </div>
//         {/* Contenedor de Tabla */}
//         <div className="table-container">
//           <table className="tableContainer">
//             <thead>
//               <tr>
//                 <th>Doctor</th>
//                 <th>Fecha</th>
//                 <th>Hora Inicio</th>
//                 {/* <th>Hora Fin</th> */}
//                 <th>Paciente</th>
//                 <th>Teléfono</th>
//                 {/* <th>Estado</th> */}
//                 <th>Eliminar</th>
//                 <th>Cancelar</th>
//               </tr>
//             </thead>
//             <tbody>
              
//               {data.map((turno) => {
//                 // Encuentra el doctor asociado al turno
//                 const doctor = doctors.find((doc) => doc.id === turno.idDoctor);
//                 return (
//                   <tr key={turno.idSchedule}>
//                     <td>{doctor.fullName}</td>
//                     <td>{turno.day}</td>
//                     <td>{turno.start_Time}</td>
//                     {/* <td>{turno.end_Time}</td> */}
//                     <td>{turno.patient ? turno.patient.fullName : "Sin asignar"}</td>
//                     <td>{turno.patient ? turno.patient.phone : "Sin asignar"}</td>
//                     {/* <td>{turno.estado}</td> */}
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Reports;
import React, { useState, useEffect } from "react";

const Reports = () => {
  const [estado, setEstado] = useState("");
  const [idDoctor, setIdDoctor] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [patientId, setPatientId] = useState("");
  const [data, setData] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedReports, setSelectedReports] = useState(new Set());

  const estadosEnum = [
    "disponible",
    "confirmado",
    "cancelado",
    "eliminado",
    "ejecutado",
    "no_asistido",
    "no_reservado",
  ];

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      const response = await fetch("http://localhost:3000/doctors");
      const result = await response.json();
      if (result.data && Array.isArray(result.data)) {
        setDoctors(result.data);
      } else {
        console.error("Los datos de doctores no están en el formato esperado");
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchReports = async () => {
    const queryParams = new URLSearchParams({
      idDoctor,
      startDate,
      endDate,
      patientId,
    }).toString();

    try {
      const response = await fetch(
        `http://localhost:3000/schedules/report/${estado}?${queryParams}`
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const toggleReportSelection = (id) => {
    const updatedSelection = new Set(selectedReports);
    if (updatedSelection.has(id)) {
      updatedSelection.delete(id);
    } else {
      updatedSelection.add(id);
    }
    setSelectedReports(updatedSelection);
  };

  const deleteSelectedReports = async () => {
    if (selectedReports.size === 0) return;
  
    try {
      const body = Array.from(selectedReports).map((idSchedule) => ({
        idSchedule,
        estado: "ELIMINADO",
        deletionReason: "Turno eliminado por administración", // Ajusta según sea necesario
      }));
  
      const response = await fetch(`http://localhost:3000/schedules/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
  
      if (!response.ok) {
        const error = await response.json();
        console.error("Error eliminando turnos:", error);
        alert("Ocurrió un error eliminando los turnos seleccionados.");
        return;
      }
  
      console.log("Turnos eliminados exitosamente.");
      setSelectedReports(new Set()); // Limpia la selección
      fetchReports(); // Actualiza la lista de reportes
    } catch (error) {
      console.error("Error en la petición:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="reports-container">
      <h2>Reportes de Turnos</h2>
      <div className="reports-content">
        <div className="filter-container">
          <label>Seleccione un estado:</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos</option>
            {estadosEnum.map((estado) => (
              <option key={estado} value={estado}>
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
              </option>
            ))}
          </select>

          <label>Doctor:</label>
          <select value={idDoctor} onChange={(e) => setIdDoctor(e.target.value)}>
            <option value="">Seleccione un doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.fullName}
              </option>
            ))}
          </select>

          <label>Fecha de Inicio:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label>Fecha de Fin:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <label>Paciente (DNI):</label>
          <input
            type="number"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="DNI sin puntos"
          />
          <button onClick={fetchReports}>Obtener Reportes</button>
          <button onClick={deleteSelectedReports} disabled={selectedReports.size === 0}>
            Eliminar Seleccionados
          </button>
        </div>
        
        {/* Contenedor de Tabla */}
        <div className="table-container">
          <table className="tableContainer">
            <thead><tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      const newSelection = isChecked
                        ? new Set(data.map((turno) => turno.idSchedule))
                        : new Set();
                      setSelectedReports(newSelection);
                    }}
                    checked={selectedReports.size === data.length && data.length > 0}
                  />
                </th>
                <th>Doctor</th>
                <th>Fecha</th>
                <th>Hora Inicio</th>
                <th>Paciente</th>
                <th>Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {data.map((turno) => {
                // Encuentra el doctor asociado al turno
                const doctor = doctors.find((doc) => doc.id === turno.idDoctor);
                return (
                  <tr key={turno.idSchedule}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedReports.has(turno.idSchedule)}
                        onChange={() => toggleReportSelection(turno.idSchedule)}
                      />
                    </td>
                    <td>{doctor ? doctor.fullName : "Sin asignar"}</td>
                    <td>{turno.day}</td>
                    <td>{turno.start_Time}</td>
                    <td>{turno.patient ? turno.patient.fullName : "Sin asignar"}</td>
                    <td>{turno.patient ? turno.patient.phone : "Sin asignar"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;