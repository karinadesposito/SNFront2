import React, { useEffect, useRef, useState } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import logosaludnet from "../assets/logosaludnet.png";

export default function CustomNavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const updateVars = () => {
      const h = navRef.current?.offsetHeight || 64;
      document.documentElement.style.setProperty("--nav-h", `${h}px`);
      document.body.classList.add("with-fixed-navbar");
    };
    const onScroll = () => setScrolled(window.scrollY > 4);

    updateVars();
    onScroll();

    window.addEventListener("resize", updateVars, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", updateVars);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const closeMenu = () => setExpanded(false);

  return (
    <Navbar
      ref={navRef}
      fixed="top"
      expand="lg"
      expanded={expanded}
      className={`app-navbar navbar-dark ${scrolled ? "is-scrolled" : ""}`}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" onClick={closeMenu}>
          <div className="navbar-logo-text">
            {/* <img src={logosaludnet} alt="Logo SaludNet" id="logosaludnet" /> */}
            <span className="saludnet-text">JS</span>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="main-navbar"
          onClick={() => setExpanded(v => !v)}
        />

        <Navbar.Collapse id="main-navbar">
          {/* Bloque único, columna en md/sm y fila en lg+ */}
          <div className="d-flex flex-column flex-lg-row w-100">
            {/* Menú a la izquierda */}
            <Nav className="me-lg-3">
              <Nav.Link as={Link} to="/especialidades" onClick={closeMenu}>
                Especialidades
              </Nav.Link>
              <Nav.Link as={Link} to="/profesionales" onClick={closeMenu}>
                Profesionales
              </Nav.Link>
            </Nav>

            {/* CTAs: izquierda en md/sm, derecha en lg+ (sin gaps raros) */}
            <Nav className="ms-lg-auto">
              <Nav.Link
                as={Link}
                to="/reservar-turno"
             
                onClick={closeMenu}
              >
                Reservar turnos
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/admin"
               
                onClick={closeMenu}
              >
                Administración
              </Nav.Link>
            </Nav>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}




