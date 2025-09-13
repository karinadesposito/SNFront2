// FourSectionsAdmin.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Button, ButtonGroup } from "react-bootstrap";

const FourSectionsAdmin = () => {
  return (
    <div className="admin-offset">
      <div className="container py-3 h-100">
        <div className="row g-3 h-100">

          {/* Administrar Profesionales (igual) */}
          <div className="col-12 col-md-6 d-flex">
            <div
              className="card-custom"
              style={{
                backgroundImage:
                  "url(https://media.istockphoto.com/id/872676342/es/foto/concepto-de-tecnolog%C3%ADa-m%C3%A9dica-registro-m%C3%A9dico-electr%C3%B3nico.jpg?s=612x612&w=0&k=20&c=_Zg00u1zKtFAeH2EiNaA8htvx8yDFsq568pMl3wpyC0=)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="card-inner">
                <h2 className="card-title mb-3">PROFESIONALES</h2>
                <ButtonGroup className="card-actions">
                  <Button as={Link} to="/AgregarProfesional" variant="primary" size="sm">Agregar</Button>
                  <Button as={Link} to="/EditarProfesional" variant="primary" size="sm">Editar</Button>
                  <Button as={Link} to="/EliminarProfesional" variant="primary" size="sm">Eliminar</Button>
                </ButtonGroup>
              </div>
            </div>
          </div>

          {/* Administrar Agenda (igual) */}
          <div className="col-12 col-md-6 d-flex">
            <div
              className="card-custom"
              style={{
                backgroundImage:
                  "url(https://www.shutterstock.com/image-illustration/top-view-medical-stethoscope-icon-600nw-2075382679.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="card-inner">
                <h2 className="card-title mb-3">AGENDA</h2>
                <ButtonGroup className="card-actions">
                  <Button as={Link} to="/crear-agenda" variant="primary" size="sm">Crear Agenda</Button>
                  <Button onClick={() => alert("Funcionalidad en desarrollo")} variant="primary" size="sm">
                    Actualizar Agenda
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </div>

          {/* Turnos — sin botón; toda la card cliqueable */}
          <div className="col-12 col-md-6 d-flex">
            <div
              className="card-custom"
              style={{
                backgroundImage:
                  "url(https://bancosdeimagenes.com/wp-content/uploads/2019/03/Getty-Medical-Category-768x443-1.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="card-inner">
                <h2 className="card-title mb-3">TURNOS</h2>
                {/* Link expandido sobre toda la tarjeta */}
                <Link to="/reservar-turno" className="stretched-link" aria-label="Ir a reservar turno"></Link>
              </div>
            </div>
          </div>

          {/* Reportes (igual) */}
          <div className="col-12 col-md-6 d-flex">
            <div
              className="card-custom"
              style={{
                backgroundImage:
                  "url(https://economia3.com/wp-content/uploads/2021/02/informes_1.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="card-inner">
                <h2 className="card-title mb-3">REPORTES</h2>
                <div className="card-actions">
                  <Button as={Link} to="/reportes" variant="primary" size="sm">Ver Reportes</Button>
                </div>
              </div>
            </div>
          </div>

        </div>{/* row */}
      </div>{/* container */}
    </div>
  );
};

export default FourSectionsAdmin;
