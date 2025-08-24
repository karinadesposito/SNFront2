import React from "react";
import {
  Navbar,
  Nav,
  NavDropdown,
  Container,
  Form,
  FormControl,
  Row,
  Col,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import logosaludnet from "../assets/logosaludnet.png"; // Ajusta la ruta si es necesario
import 'bootstrap-icons/font/bootstrap-icons.css';

const CustomNavBar = () => {
  const handleSearch = (event) => {
    event.preventDefault();
    // Aquí puedes agregar la lógica de búsqueda
    alert("Búsqueda realizada.");
  };

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

        {/* Botón de toggle para pantallas pequeñas */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        {/* Contenido colapsable del Navbar */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* Dropdown de Información */}
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

            {/* Dropdown de Servicios */}
            <NavDropdown title="Servicios" id="dropdown-servicios">
              <NavDropdown.Item as={Link} to="/turnos">
                Turnos
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/recetas">
                Recetas
              </NavDropdown.Item>
            </NavDropdown>

            <Nav.Link as={Link} to="/nosotros">
              Nosotros
            </Nav.Link>
          </Nav>

          {/* Formulario de búsqueda */}
          <Form className="d-flex" onSubmit={handleSearch}>
            <div className="input-group">
              <FormControl
                type="search"
                name="search"
                placeholder="Buscar"
                className="form-control-sm"
                aria-label="Search"
              />
              <button
                type="submit"
                className="btn btn-outline-secondary"
                id="button-addon-search"
              >
                <i className="bi bi-search "></i>
              </button>
            </div>
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavBar;
