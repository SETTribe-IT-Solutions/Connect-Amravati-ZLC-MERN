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

      <Container as="main" className="py-5 flex-grow-1 position-relative" style={{ zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto"
          style={{ maxWidth: '1000px' }}
        >
          <Card className="border-0 shadow-lg overflow-hidden rounded-4">
            <Row className="g-0">
              <CulturalSection />

              <Col lg={6} className="p-4 p-md-5 bg-white d-flex align-items-center">
                <div className="w-100 mx-auto" style={{ maxWidth: '400px' }}>
                  <motion.div
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  >
                    <div className="mb-5">
                      <h2 className="display-6 fw-bold text-dark mb-2 d-flex align-items-center">
                        <FaShieldAlt className="me-3 text-primary" />
                        Login
                      </h2>
                      <p className="text-secondary mb-0 scale-up-hover d-inline-block">
                        Access your dashboard securely
                      </p>
                    </div>

                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-4 position-relative">
                        <div className="position-absolute top-50 translate-middle-y ps-3 text-primary" style={{ zIndex: 5 }}>
                          <FaUser size={18} />
                        </div>
                        <Form.Control
                          type="text"
                          placeholder="UserID"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="ps-5 py-3 rounded-3 border-2 shadow-none focus-border-primary"
                          style={{ fontSize: '1rem' }}
                        />
                      </Form.Group>

                      <Form.Group className="mb-5 position-relative">
                        <div className="position-absolute top-50 translate-middle-y ps-3 text-primary" style={{ zIndex: 5 }}>
                          <FaLock size={18} />
                        </div>
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="ps-5 py-3 rounded-3 border-2 shadow-none focus-border-primary"
                          style={{ fontSize: '1rem' }}
                        />
                        <Button
                          variant="link"
                          onClick={() => setShowPassword(!showPassword)}
                          className="position-absolute top-50 translate-middle-y end-0 me-2 text-secondary p-2 border-0 shadow-none"
                          style={{ zIndex: 6 }}
                        >
                          {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </Button>
                      </Form.Group>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-100 py-3 rounded-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 gradient-button-premium"
                      >
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" />
                            <span>Logging in...</span>
                          </>
                        ) : (
                          <>
                            <span>Login</span>
                            <FaArrowRight />
                          </>
                        )}
                      </Button>

                      <div className="mt-5 pt-4 border-top text-center">
                        <p className="small text-secondary mb-0 d-flex align-items-center justify-content-center gap-1">
                          <FaShieldAlt className="text-muted" />
                          This is a secure government portal. 
                        </p>
                        <p className="text-danger fw-bold" style={{ fontSize: '0.65rem' }}>Unauthorized access is prohibited.</p>
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