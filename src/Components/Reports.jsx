import React, { useState, useEffect } from 'react';

const Reports = () => {
  const [estado, setEstado] = useState('');
  const [idDoctor, setIdDoctor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [patientId, setPatientId] = useState('');
  const [data, setData] = useState([]);
  const [doctors, setDoctors] = useState([]); // Estado para los doctores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Función para obtener los doctores
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/doctors');
      const result = await response.json();

      // Verifica si los datos están en el formato esperado
      if (result.data && Array.isArray(result.data)) {
        setDoctors(result.data); // Guarda los doctores
      } else {
        setError('Los datos de doctores no están en el formato esperado');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Hubo un error al obtener los doctores');
    } finally {
      setLoading(false);
    }
  };

  // Llamada a la función para obtener los doctores cuando el componente se monta
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Función para obtener los reportes
  const fetchReports = async () => {
    const queryParams = new URLSearchParams({
      idDoctor,
      startDate,
      endDate,
      patientId,
    }).toString();

    try {
      const response = await fetch(`http://localhost:3000/schedules/report/${estado}?${queryParams}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div>
      <h2>Filtrar Reportes de Turnos</h2>

      <div>
        <label>Estado:</label>
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Seleccione un estado</option>
          <option value="disponible">Disponible</option>
          <option value="confirmado">Confirmado</option>
          <option value="cancelado">Cancelado</option>
          <option value="eliminado">Eliminado</option>
          <option value="ejecutado">Ejecutado</option>
          <option value="no_asistido">No Asistido</option>
          <option value="no_reservado">No Reservado</option>
        </select>

        <label>Doctor:</label>
        <select value={idDoctor} onChange={(e) => setIdDoctor(e.target.value)}>
          <option value="">Seleccione un doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.fullName} {/* Muestra el nombre completo del doctor */}
            </option>
          ))}
        </select>

        <label>Fecha de Inicio:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

        <label>Fecha de Fin:</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

        <label>Paciente ID:</label>
        <input type="number" value={patientId} onChange={(e) => setPatientId(e.target.value)} />

        <button onClick={fetchReports}>Obtener Reportes</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID Turno</th>
            <th>Doctor</th>
            <th>Fecha</th>
            <th>Hora Inicio</th>
            <th>Hora Fin</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {data.map((turno) => (
            <tr key={turno.idSchedule}>
              <td>{turno.idSchedule}</td>
              <td>{turno.idDoctor}</td>
              <td>{turno.day}</td>
              <td>{turno.start_Time}</td>
              <td>{turno.end_Time}</td>
              <td>{turno.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reports;
