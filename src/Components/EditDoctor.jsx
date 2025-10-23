import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";


const ProfesionalTable = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  // 🔹 Obtener doctores
  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${apiUrl}/doctor`);
      const data = await response.json();
      const result = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : [];
      // Orden alfabético por nombre
      result.sort((a, b) =>
        a.fullName.localeCompare(b.fullName, "es", { sensitivity: "base" })
      );
      setDoctors(result);
    } catch (error) {
      console.error("Error al obtener doctores:", error);
      setDoctors([]);
    }
  };

  // 🔹 Obtener especialidades
  const fetchSpecialities = async () => {
    try {
      const response = await fetch(`${apiUrl}/speciality`);
      const data = await response.json();
      setSpecialities(Array.isArray(data) ? data : data.data ?? []);
    } catch (error) {
      console.error("Error al obtener especialidades:", error);
      setSpecialities([]);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchSpecialities();
  }, []);

  // 🔹 Abrir modal de edición
  const handleEdit = (doctor) => {
    setSelectedDoctor({ ...doctor, specialityId: doctor.speciality.id });
    setShowModal(true);
  };

  // 🔹 Guardar cambios
  const handleSave = async () => {
  try {
    if (!selectedDoctor || !selectedDoctor.id) {
      alert("Error: no se seleccionó un doctor válido.");
      return;
    }

    // Construir el body con solo los campos editables
    const updatedDoctor = {
      fullName: selectedDoctor.fullName,
      license: selectedDoctor.license,
      phone: selectedDoctor.phone,
      email: selectedDoctor.email,
      specialityId: selectedDoctor.specialityId || null,
    };

    const response = await fetch(`${apiUrl}/doctor/${selectedDoctor.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedDoctor),
    });

    if (response.ok) {
      alert("Datos actualizados correctamente");
      setShowModal(false);
      fetchDoctors();
    } else {
      const err = await response.json().catch(() => ({}));
      alert("Error al actualizar: " + (err.message || "Error desconocido"));
    }
  } catch (error) {
    console.error("Error en handleSave:", error);
    alert("Error de conexión con el servidor");
  }
};
  // 🔹 Eliminar doctor
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este profesional?")) return;
    try {
      const response = await fetch(`${apiUrl}/doctor/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchDoctors();
      } else {
        alert("Error al eliminar el profesional.");
      }
    } catch {
      alert("Error de conexión con el servidor.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedDoctor({ ...selectedDoctor, [name]: value });
  };

  return (
    <div>
      <h3 className="mb-3">Listado de Doctores</h3>
      <div className="card shadow">
        <div className="card-body">
          <table className="table table-hover">
            <thead className="table-light">
            <tr>
              <th>Nombre</th>
              <th>Especialidad</th>
              <th>Matrícula</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {doctors.length > 0 ? (
              doctors.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.fullName}</td>
                  <td>{doc.speciality.name}</td>
                  <td>{doc.license}</td>
                  <td>{doc.phone || "-"}</td>
                  <td>{doc.email || "-"}</td>
                  <td>
                    <Button
                      className="sort-btn"
                      onClick={() => handleEdit(doc)}
                    >
                      Editar
                    </Button>
                    <Button
                      className="sort-btn"
                      onClick={() => handleDelete(doc.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center">
                  No hay profesionales cargados.
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </div>

      {/* 🔹 Modal de edición */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Profesional</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDoctor && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nombre completo</Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={selectedDoctor.fullName}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Matrícula</Form.Label>
                <Form.Control
                  type="text"
                  name="license"
                  value={selectedDoctor.license}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={selectedDoctor.phone || ""}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={selectedDoctor.email || ""}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Especialidad</Form.Label>
                <Form.Select
                  name="specialityId"
                  value={selectedDoctor.specialityId}
                  onChange={handleChange}
                >
                  <option value="">Seleccione una especialidad</option>
                  {specialities.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Guardar cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProfesionalTable;
