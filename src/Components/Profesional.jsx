import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserDoctor } from "@fortawesome/free-solid-svg-icons";
import "../Styles/profesional.css";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const ProfesionalList = () => {
  const [doctors, setDoctors] = useState([]);
  const [sortType, setSortType] = useState("name"); // por defecto: nombre
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
        Swal.fire({
          title: "❌ Error al cargar profesionales",
          text: "No se pudieron obtener los datos del servidor. Intenta nuevamente más tarde.",
          icon: "error",
          confirmButtonColor: "#3085d6",
        });
        setDoctors([]);
      }
    };
    fetchDoctors();
  }, [apiUrl]);

  const handleSort = (type) => {
    setSortType(type);
    const sorted = [...doctors].sort((a, b) => {
      if (type === "name") {
        return a.fullName.localeCompare(b.fullName, "es", { sensitivity: "base" });
      } else if (type === "speciality") {
        return a.speciality.name.localeCompare(b.speciality.name, "es", { sensitivity: "base" });
      }
      return 0;
    });
    setDoctors(sorted);
  };

  return (
    <Container className="doctor-container">
      <h2 className="doctor-title">Nuestros profesionales</h2>

      {/* 🔹 Botones con estilo de card */}
      <div className="sort-buttons text-center mb-4">
        <button
          className={`sort-btn ${sortType === "name" ? "active" : ""}`}
          onClick={() => handleSort("name")}
        >
          Ordenar por nombre
        </button>
        <button
          className={`sort-btn ${sortType === "speciality" ? "active" : ""}`}
          onClick={() => handleSort("speciality")}
        >
          Ordenar por especialidad
        </button>
      </div>

      {doctors.length === 0 ? (
        <p className="text-center text-white">No hay profesionales cargados.</p>
      ) : (
        <Row className="g-4 justify-content-center">
          {doctors.map((doctor) => (
            <Col key={doctor.id} xs={12} sm={6} md={4} lg={3}>
              <Card className="doctor-card shadow-sm border-0 h-100 text-center p-3">
                <Card.Body className="doctor-card-body">
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
                  <Link
      to={`/reservar-turno?doctor=${doctor.id}`}
      className="btn btn-brand w-100"
    >
      Reservar turno
    </Link>
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

