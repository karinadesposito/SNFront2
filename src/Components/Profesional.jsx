import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserDoctor } from "@fortawesome/free-solid-svg-icons";
import "../Styles/profesional.css";

const ProfesionalList = () => {
  const [doctors, setDoctors] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${apiUrl}/doctor`);
        const data = await response.json();
        const result = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : [];

        const sorted = [...result].sort((a, b) =>
          a.fullName.localeCompare(b.fullName, "es", { sensitivity: "base" })
        );
        setDoctors(sorted);
      } catch (error) {
        console.error("Error al obtener los profesionales:", error);
        setDoctors([]);
      }
    };
    fetchDoctors();
  }, [apiUrl]);

  return (
    <Container className="doctor-container">
      <h2 className="doctor-title">Nuestros profesionales</h2>

      {doctors.length === 0 ? (
        <p className="text-center text-white">No hay profesionales cargados.</p>
      ) : (
        <Row className="g-4 justify-content-center">
          {doctors.map((doctor) => (
            <Col key={doctor.id} xs={12} sm={6} md={4} lg={3}>
              <Card className="card--gradient shadow-sm border-0 h-100 text-center p-3">
                <Card.Body>
                  <FontAwesomeIcon
                    icon={faUserDoctor}
                    className="profesional-icon mb-2"
                  />
                  <h3 className="mb-2 fw-bold">{doctor.fullName}</h3>
                  <h5 className="mb-2 fw-bold">{doctor.speciality.name}</h5>
                  <h5 className="mb-2 fw-bold">{doctor.license}</h5>
                  {doctor.description && (
                    <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                      {doctor.description}
                    </p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default ProfesionalList;
