import React, { useState, useEffect } from "react";
import { Tabs, Tab, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// --- Subcomponente para Turnos ---
const TurnosReport = () => {
  const [estado, setEstado] = useState("");
  const [idDoctor, setIdDoctor] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [patientId, setPatientId] = useState("");
  const [data, setData] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedReports, setSelectedReports] = useState(new Set());
// ✅ nuevo
const [selectedDoctors, setSelectedDoctors] = useState([]); // array de IDs

  const estadosEnum = [
    "disponible",
    "confirmado",
    "cancelado",
    "eliminado",
    "ejecutado",
    "no_asistido",
    "no_reservado",
  ];

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${apiUrl}/doctor`);
        const result = await response.json();
        console.log("Respuesta backend:", result);
        if (result.data && Array.isArray(result.data)) {
          setDoctors(result.data);
        } else if (Array.isArray(result)) {
          setDoctors(result);
        } else {
          console.error("Los datos de doctor no están en el formato esperado");
        }
      } catch (error) {
        console.error("Error fetching doctor:", error);
      }
    };
// ✅ usa setIdDoctor (no setSelectedDoctor)
const toggleDoctor = (id) => {
  setSelectedDoctorIds(prev =>
    prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
  );
  // Compatibilidad con tu lógica existente que usa idDoctor:
  setIdDoctor(prev => (prev ? prev : id));
};

    fetchDoctors();
  }, [apiUrl]);

  const fetchReports = async () => {
    const queryParams = new URLSearchParams({
      idDoctor,
      startDate,
      endDate,
      patientId,
    }).toString();

    const url = !estado
      ? `${apiUrl}/schedules?${queryParams}`
      : `${apiUrl}/schedules/report/${estado}?${queryParams}`;

    try {
      const response = await fetch(url);
      const result = await response.json();

      const arrayTurnos = Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result)
        ? result
        : [];

      setData(arrayTurnos);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
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

  const updateSelectedReports = async (nuevoEstado) => {
    if (selectedReports.size === 0) return;

    const errores = [];

    try {
      await Promise.all(
        Array.from(selectedReports).map(async (idSchedule) => {
          const body = {
            estado: nuevoEstado,
            ...(nuevoEstado === "ELIMINADO" && { deletionReason: "Turno eliminado por administración" }),
          };

          const response = await fetch(`${apiUrl}/schedules/${idSchedule}/status`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            let errorMsg = `Turno ${idSchedule}: `;
            try {
              const error = await response.json();
              errorMsg += error.message || JSON.stringify(error);
            } catch {
              errorMsg += "Error desconocido";
            }
            errores.push(errorMsg);
          }
        })
      );

      setSelectedReports(new Set());
      fetchReports();

      if (errores.length > 0) {
        alert(
          "Algunos turnos no pudieron actualizarse:\n\n" +
            errores.join("\n")
        );
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div>
      <h2 className="text-center mb-4 text-white">Reportes de Turnos</h2>
      <div className="card shadow mb-4">
        <div className="card-body">
          <form className="row g-3">
            <div className="col-md-3">
              <label htmlFor="estado" className="form-label">
                Estado
              </label>
              <select
                id="estado"
                className="form-select"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              >
                <option value="">Todos</option>
                {estadosEnum.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado.charAt(0).toUpperCase() + estado.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label htmlFor="doctor" className="form-label">
                Doctor
              </label>
              <select
                id="doctor"
                className="form-select"
                value={idDoctor}
                onChange={(e) => setIdDoctor(e.target.value)}
              >
                <option value="">Seleccione un doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label htmlFor="startDate" className="form-label">
                Fecha de Inicio
              </label>
              <input
                type="date"
                id="startDate"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label htmlFor="endDate" className="form-label">
                Fecha de Fin
              </label>
              <input
                type="date"
                id="endDate"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label htmlFor="patientId" className="form-label">
                Paciente (DNI)
              </label>
              <input
                type="number"
                id="patientId"
                className="form-control"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="DNI sin puntos"
              />
            </div>

            <div className="col-md-12 d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-warning"
                onClick={fetchReports}
              >
                Obtener Reportes
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={() => updateSelectedReports("EJECUTADO")}
                disabled={selectedReports.size === 0}
              >
                Pacientes confirmados
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => updateSelectedReports("ELIMINADO")}
                disabled={selectedReports.size === 0}
              >
                Eliminar Seleccionados
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow">
        <div className="card-body">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
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
                    checked={
                      selectedReports.size === data.length && data.length > 0
                    }
                  />
                </th>
                <th>Doctor</th>
                <th>Fecha</th>
                <th>Hora Inicio</th>
                <th>Paciente</th>
                <th>Teléfono</th>
                {estado === "" && <th>Estado</th>} {/* Solo cuando es "Todos" */}
              </tr>
            </thead>
            <tbody>
              {data.map((turno) => (
                <tr key={turno.idSchedule}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedReports.has(turno.idSchedule)}
                      onChange={() => toggleReportSelection(turno.idSchedule)}
                    />
                  </td>
                  <td>{turno.doctor?.fullName || "Sin asignar"}</td>
                  <td>{turno.day}</td>
                  <td>{turno.startTime}</td>
                  <td>{turno.patient?.fullName || "Sin asignar"}</td>
                  <td>{turno.patient?.phone || "Sin asignar"}</td>
                  {estado === "" && (
                    <td>{turno.estado || turno.state || "Sin estado"}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Subcomponente para Doctores ---
const DoctoresReport = () => {
  const [doctores, setDoctores] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchDoctores = async () => {
      try {
        const response = await fetch(`${apiUrl}/doctor`);
        const result = await response.json();
        if (result.data && Array.isArray(result.data)) {
          setDoctores(result.data);
        } else if (Array.isArray(result)) {
          setDoctores(result);
        } else {
          console.error("Los datos de doctor no están en el formato esperado");
        }
      } catch (error) {
        console.error("Error al obtener doctor:", error);
      }
    };
    fetchDoctores();
  }, [apiUrl]);

  return (
    <div>
      <h3 className="mb-3">Listado de Doctores</h3>
      <div className="card shadow">
        <div className="card-body">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Matrícula</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Especialidad</th> {/* Renombramos la columna */}
              </tr>
            </thead>
            <tbody>
              {doctores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">
                    No hay doctores para mostrar.
                  </td>
                </tr>
              ) : (
                doctores.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.id}</td>
                    <td>{doc.fullName}</td>
                    <td>{doc.dni}</td>
                    <td>{doc.license}</td>
                    <td>{doc.email}</td>
                    <td>{doc.phone}</td>
                    <td>{doc.speciality?.name || "Sin asignar"}</td>{" "}
                  
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};



// --- Componente principal con Tabs ---
const Reports = () => {
  const [key, setKey] = useState("general");

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4 text-white">Reportes</h2>
      <Tabs
        id="reports-tabs"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-3"
        justify
      >
      
        <Tab eventKey="turnos" title="Turnos">
          <TurnosReport />
        </Tab>
        <Tab eventKey="doctores" title="Doctores">
          <DoctoresReport />
        </Tab>
     
      </Tabs>
    </Container>
  );
};

export default Reports;
