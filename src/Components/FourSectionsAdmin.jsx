import React from "react";
import { Link } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";

const FourSectionsAdmin = () => {
  return (
    <div className="container my-4">
      <div className="row g-3">
        {/* Administrar Profesionales */}
        <div className="col-12 col-md-6">
          <div
            className="card-custom"
            style={{
              backgroundImage: `url(https://media.istockphoto.com/id/872676342/es/foto/concepto-de-tecnolog%C3%ADa-m%C3%A9dica-registro-m%C3%A9dico-electr%C3%B3nico.jpg?s=612x612&w=0&k=20&c=_Zg00u1zKtFAeH2EiNaA8htvx8yDFsq568pMl3wpyC0=)`,
            }}
          >
            <Dropdown>
              <Dropdown.Toggle
                as="div"
                className="text-decoration-none d-flex justify-content-center align-items-center"
                style={{ cursor: "pointer" }}
              >
                <h2 className="card-title">ADMINISTRAR PROFESIONALES</h2>
              </Dropdown.Toggle>

              <Dropdown.Menu align="center">
                <Dropdown.Item as={Link} to="/AgregarProfesional">
                  Agregar Profesional
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/EditarProfesional">
                  Editar Profesional
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/EliminarProfesional">
                  Eliminar Profesional
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {/* Administrar Agenda */}
        <div className="col-12 col-md-6">
          <div
            className="card-custom"
            style={{
              backgroundImage: `url(https://www.shutterstock.com/image-illustration/top-view-medical-stethoscope-icon-600nw-2075382679.jpg)`,
            }}
          >
            <Dropdown>
              <Dropdown.Toggle
                as="div"
                className="text-decoration-none d-flex justify-content-center align-items-center"
                style={{ cursor: "pointer" }}
              >
                <h2 className="card-title">ADMINISTRAR AGENDA</h2>
              </Dropdown.Toggle>

              <Dropdown.Menu align="center">
                <Dropdown.Item as={Link} to="/crear-agenda">
                  Crear Agenda
                </Dropdown.Item>
                <Dropdown.Item onClick={() => alert("Funcionalidad en desarrollo")}>
                  Actualizar Agenda
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {/* Administrar Turnos */}
        <div className="col-12 col-md-6">
          <div
            className="card-custom"
            style={{
              backgroundImage: `url(https://bancosdeimagenes.com/wp-content/uploads/2019/03/Getty-Medical-Category-768x443-1.jpg)`,
            }}
          >
            <Link to="/EliminarTurnos" className="stretched-link">
              <h2 className="card-title">ADMINISTRAR TURNOS</h2>
            </Link>
          </div>
        </div>

        {/* Reportes */}
        <div className="col-12 col-md-6">
          <div
            className="card-custom"
            style={{
              backgroundImage: `url(https://economia3.com/wp-content/uploads/2021/02/informes_1.jpg)`,
            }}
          >
            <Link to="/turnos/reportes" className="stretched-link">
              <h2 className="card-title">REPORTES</h2>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FourSectionsAdmin;
