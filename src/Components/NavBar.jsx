import React from "react";
import {
  Navbar,
  Nav,
  NavDropdown,
  Container,
  Button,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import logosaludnet from "../assets/logosaludnet.png";
import "bootstrap-icons/font/bootstrap-icons.css";

const CustomNavBar = () => {
  return (
    <Navbar className="navbar-dark" expand="lg" fixed="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <div className="navbar-logo-text">
            <img
              src={logosaludnet}
              alt="Logo SaludNet"
              id="logosaludnet"
            />
            <span className="saludnet-text">SALUD NET</span>
          </div>
        </Navbar.Brand>

        {/* Toggle mobile */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* Información */}
            <NavDropdown title="Información" id="dropdown-informacion">
              <NavDropdown.Item as={Link} to="/staff">
                Staff
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/especialidades">
                Especialidades
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/obrasSociales">
                Obras Sociales
              </NavDropdown.Item>
            </NavDropdown>

            {/* Servicios */}
            <NavDropdown title="Servicios" id="dropdown-servicios">
              <NavDropdown.Item as={Link} to="/reservar-turno">
                Turnos
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/recetas">
                Recetas
              </NavDropdown.Item>
            </NavDropdown>

            <Nav.Link as={Link} to="/nosotros">
              Nosotros
            </Nav.Link>

            {/* Botón Administración en MOBILE (dentro del collapse) */}
            <div className="d-lg-none w-100 mt-2">
              <Button
                as={Link}
                to="/admin"
                variant="primary"
                className="w-100"
                size="sm"
              >
                Administración
              </Button>
            </div>
          </Nav>
        </Navbar.Collapse>

        {/* Botón Administración en DESKTOP (fuera del collapse) */}
        <Button
          as={Link}
          to="/admin"
          variant="primary"
          size="sm"
          className="d-none d-lg-inline-flex ms-2"
        >
          Administración
        </Button>
      </Container>
    </Navbar>
  );
};

export default CustomNavBar;


