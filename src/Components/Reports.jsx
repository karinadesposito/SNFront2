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

    fetchDoctors();
  }, [apiUrl]);

  const fetchReports = async () => {
    const queryParams = new URLSearchParams({
      idDoctor,
      startDate,
      endDate,
      patientId,
    }).toString();

    try {
      const response = await fetch(
        `${apiUrl}/schedules/report/${estado}?${queryParams}`
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
        deletionReason: "Turno eliminado por administración",
      }));

      const response = await fetch(`${apiUrl}/schedules/status`, {
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
      setSelectedReports(new Set());
      fetchReports();
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
                onClick={deleteSelectedReports}
                disabled={selectedReports.size === 0}
              >
                Ejecutar Seleccionados
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={deleteSelectedReports}
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
                <th>ID Especialidad</th>
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
                    <td>{doc.specialityId}</td>
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

const EspecialidadesReport = () => (
  <div className="text-center my-4">Aquí irá el reporte de Especialidades.</div>
);

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
        <Tab eventKey="general" title="General">
          <div className="text-center my-4">
            <p>Selecciona un tipo de reporte para ver la información correspondiente.</p>
          </div>
        </Tab>
        <Tab eventKey="turnos" title="Turnos">
          <TurnosReport />
        </Tab>
        <Tab eventKey="doctores" title="Doctores">
          <DoctoresReport />
        </Tab>
        <Tab eventKey="especialidades" title="Especialidades">
          <EspecialidadesReport />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Reports;
