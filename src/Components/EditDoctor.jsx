import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Container } from "react-bootstrap";
import Swal from "sweetalert2";
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
      const response = await fetch(`${apiUrl}/doctor/all-with-deleted`);
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
      Swal.fire({
        title: "❌ Error",
        text: "No se pudieron obtener los profesionales.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
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
      Swal.fire({
        title: "❌ Error",
        text: "No se pudieron cargar las especialidades.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
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
      Swal.fire({
        title: "⚠️ Error",
        text: "No se seleccionó un profesional válido.",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
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
      await Swal.fire({
          title: "✅ Datos actualizados",
          text: "El profesional fue actualizado correctamente.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
      setShowModal(false);
      fetchDoctors();
    } else {
      await Swal.fire({
          title: "⚠️ Error al actualizar",
          text: data.message || "No se pudo actualizar el profesional.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "❌ Error de conexión",
        text: "No se pudo conectar con el servidor.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  // 🔹 Eliminar doctor
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar profesional?",
      text: "¿Estás seguro de que deseas eliminar este profesional?.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await fetch(`${apiUrl}/doctor/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await Swal.fire({
          title: "✅ Eliminado",
          text: "El profesional fue eliminado correctamente.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        fetchDoctors();
      } else {
        const data = await response.json().catch(() => ({}));
        Swal.fire({
          title: "⚠️ Error",
          text: data.message || "No se pudo eliminar el profesional.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    } catch {
      Swal.fire({
        title: "❌ Error de conexión",
        text: "No se pudo conectar con el servidor.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedDoctor({ ...selectedDoctor, [name]: value });
  };

   const handleRestore = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Reactivar profesional?",
      text: "El profesional volverá a estar disponible.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, reactivar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#aaa",
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await fetch(`${apiUrl}/doctor/restore/${id}`, {
        method: "PATCH",
      });
      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          title: "✅ Restaurado",
          text: data.message || "El profesional fue reactivado correctamente.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        fetchDoctors();
      } else {
        await Swal.fire({
          title: "⚠️ Error",
          text: data.message || "No se pudo restaurar el profesional.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error al restaurar doctor:", error);
      Swal.fire({
        title: "❌ Error de conexión",
        text: "No se pudo conectar con el servidor.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
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
                <tr key={doc.id} className={doc.deletedAt ? "table-secondary" : ""}>
                  <td>{doc.fullName}</td>
                  <td>{doc.speciality.name}</td>
                  <td>{doc.license}</td>
                  <td>{doc.phone || "-"}</td>
                  <td>{doc.email || "-"}</td>
                  <td>
                  {!doc.deletedAt ? (
    <>
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
                     </>
  ) : (
    <Button
      variant="success"
      className="sort-btn"
      onClick={() => handleRestore(doc.id)}
    >
      Restaurar
    </Button>
  )}
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
