// Components/Footer.jsx
import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./../Styles/footer.css";
import clinicBrand from "../assets/logosaludnet.png";

function SocialIcon({ href, label, children }) {
  return (
    <a
      className="social-icon"
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
    >
      {children}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <Row className="align-items-center gy-0">
          <Col xs={12} md={4} className="mb-2 mb-md-0">
            <div className="d-flex align-items-center">
              <img
                src={clinicBrand}
                alt="SaludNet — logo"
                className="brand-mark"
              />
              <span className="brand-first ms-2">SaludNet</span>
            </div>
          </Col>

          <Col
            xs={12}
            md={4}
            className="d-flex justify-content-center mb-2 mb-md-0"
          >
            <div className="social">
              <SocialIcon href="#" label="Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="#" label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 22v-9h3l1-4h-4V7a1 1 0 0 1 1-1h3V2h-3a5 5 0 0 0-5 5v2H6v4h3v9h4z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="#" label="X/Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4h-3l-4 5-4-5H6l6 8-6 8h3l4-5 4 5h3l-6-8 6-8z" />
                </svg>
              </SocialIcon>
            </div>
          </Col>

          <Col xs={12} md={4} className="text-md-end small">
            <span className="me-2 d-none d-md-inline text-white">
              © {new Date().getFullYear()}
            </span>
            <span className="d-none d-md-inline text-white">
              Todos los derechos reservados.
            </span>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
