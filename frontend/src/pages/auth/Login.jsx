import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaArrowRight, FaShieldAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Spinner, Card } from 'react-bootstrap';

import { loginUser } from '../../services/auth/authService';
import { toast } from 'react-hot-toast';

import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AnimatedBackground from '../../components/landing/AnimatedBackground';
import WelcomeOverlay from '../../components/landing/WelcomeOverlay';
import CulturalSection from '../../components/landing/CulturalSection';

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isWelcomeActive, setIsWelcomeActive] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const data = await loginUser(formData.username, formData.password);
      if (data.message && data.message.toLowerCase() === "login successful") {
        if (onLogin) {
          const success = onLogin(data);
          if (success) {
            toast.success('Login successful');
            setLoading(false);
            navigate("/dashboard");
            return;
          }
        }
      } else {
        toast.error(data.message || 'Invalid credentials');
        setLoading(false);
      }
    } catch (error) {
      console.error("Login Error:", error.response || error.message);
      const errorMessage = error.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 position-relative overflow-hidden d-flex flex-column bg-light">
      <AnimatedBackground />
      <WelcomeOverlay onComplete={() => setIsWelcomeActive(false)} />
      {!isWelcomeActive && <Header />}

      <Container as="main" className="py-5 flex-grow-1 d-flex align-items-center position-relative" style={{ zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto w-100"
          style={{ maxWidth: '1100px' }}
        >
          <Card className="border-0 shadow-lg overflow-hidden glass-card">
            <Row className="g-0 min-vh-60">
              <CulturalSection />

              <Col lg={6} className="p-4 p-md-5 d-flex align-items-center bg-white bg-opacity-50">
                <div className="w-100 mx-auto" style={{ maxWidth: '420px' }}>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    <div className="mb-5 text-center text-lg-start">
                      <div className="d-flex align-items-center justify-content-center justify-content-lg-start gap-2 mb-2">
                        <FaShieldAlt className="text-primary h4 mb-0" />
                        <span className="text-uppercase small tracking-widest fw-bold text-secondary">Secure Access</span>
                      </div>
                      <h2 className="display-5 fw-bold text-dark mb-2 font-outfit">
                        Sign <span className="text-gradient-premium">In</span>
                      </h2>
                      <p className="text-muted mb-0">
                        Enter your credentials to access the portal.
                      </p>
                    </div>

                    <Form onSubmit={handleSubmit} className="mt-4">
                      <Form.Group className="mb-4 position-relative">
                        <Form.Label className="small fw-bold text-secondary ms-1">UserID</Form.Label>
                        <div className="position-relative">
                          <div className="position-absolute top-50 translate-middle-y ps-3 text-muted" style={{ zIndex: 5 }}>
                            <FaUser size={16} />
                          </div>
                          <Form.Control
                            type="text"
                            placeholder="Enter your user ID"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="ps-5 py-3 rounded-4 border-1 bg-light glass-input"
                            style={{ fontSize: '1rem' }}
                          />
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-5 position-relative">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <Form.Label className="small fw-bold text-secondary ms-1 mb-0">Password</Form.Label>
                        </div>
                        <div className="position-relative">
                          <div className="position-absolute top-50 translate-middle-y ps-3 text-muted" style={{ zIndex: 5 }}>
                            <FaLock size={16} />
                          </div>
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="ps-5 py-3 rounded-4 border-1 bg-light glass-input"
                            style={{ fontSize: '1rem' }}
                          />
                          <Button
                            variant="link"
                            onClick={() => setShowPassword(!showPassword)}
                            className="position-absolute top-50 translate-middle-y end-0 me-2 text-secondary p-2 border-0 shadow-none hover-text-primary transition-all"
                            style={{ zIndex: 6 }}
                          >
                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                          </Button>
                        </div>
                      </Form.Group>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-100 py-3 rounded-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 gradient-button-premium mb-4"
                      >
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" />
                            <span>Authenticating...</span>
                          </>
                        ) : (
                          <>
                            <span>Sign In to Dashboard</span>
                            <FaArrowRight size={14} />
                          </>
                        )}
                      </Button>

                      <div className="mt-5 pt-4 border-top text-center opacity-75 x-small">
                        <p className="text-secondary mb-1">
                          Official Communication Portal of
                        </p>
                        <p className="fw-bold text-dark text-uppercase tracking-wider">District Administration, Amravati</p>
                      </div>
                    </Form>
                  </motion.div>
                </div>
              </Col>
            </Row>
          </Card>
        </motion.div>
      </Container>

      <Footer />
    </div>
  );
};

export default LoginPage;