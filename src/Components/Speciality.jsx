import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeartbeat,
  faUserMd,
  faTooth,
  faEye,
  faHospital,
  faPills,
  faStethoscope,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

import "../Styles/speciality.css";

// Mapeo de íconos según nombre de especialidad
const iconMap = {
  Cardiología: faHeartbeat,
  Clínica: faStethoscope,
  Odontología: faTooth,
  Oftalmología: faEye,
  Farmacia: faPills,
  Hospital: faHospital,
};

const SpecialityList = () => {
  const [specialities, setSpecialities] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchSpecialities = async () => {
      try {
        const response = await fetch(`${apiUrl}/speciality`);
        const data = await response.json();
        const result = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : [];

        const sorted = [...result].sort((a, b) =>
      a.name.localeCompare(b.name, "es", { sensitivity: "base" })
    );

    setSpecialities(sorted);
      } catch (error) {
        setSpecialities([]);
        Swal.fire({
          icon: "error",
          title: "Error al cargar las especialidades",
          text: "No se pudo conectar con el servidor o la lista está vacía.",
          confirmButtonColor: "#0d6efd",
        });
      }
    };
    fetchSpecialities();
  }, [apiUrl]);

  return (
    <Container className="speciality-container">
      <h2 className="speciality-title">Especialidades Médicas</h2>

      {specialities.length === 0 ? (
        <p className="text-center text-white">No hay especialidades cargadas.</p>
      ) : (
        <Row className="g-4 justify-content-center">
          {specialities.map((speciality) => {
            const icon = iconMap[speciality.name] || faUserMd; // icono por defecto

            return (
              <Col key={speciality.id} xs={12} sm={6} md={4} lg={3}>
                <Card className="card--gradient shadow-sm border-0 h-100 text-center p-3">
                  <FontAwesomeIcon icon={icon} className="speciality-icon mb-2" />
                  <Card.Body>
                    <h5 className="mb-2 fw-bold">{speciality.name}</h5>
                    {speciality.description && (
                      <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                        {speciality.description}
                      </p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default SpecialityList;

