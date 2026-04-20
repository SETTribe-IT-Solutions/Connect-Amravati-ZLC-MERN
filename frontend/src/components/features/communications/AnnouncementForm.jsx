import React, { useState, useEffect } from 'react';
import { getTalukas, getVillagesByTaluka } from '../../../services/common/locationService';
import { toast } from 'react-hot-toast';
import { Form, Button, Row, Col, Spinner, InputGroup } from 'react-bootstrap';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  MegaphoneIcon,
  MapPinIcon,
  UserGroupIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import { createAnnouncement } from '../../../services/communications/announcementService';

const AnnouncementForm = ({ onClose, onSuccess, currentUser }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    isCircular: false,
    targetRole: '',
    targetTaluka: '',
    targetVillage: ''
  });

  const [talukas, setTalukas] = useState([]);
  const [villages, setVillages] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({ title: '', message: '', targetRole: '', file: '' });

  const roleLevels = {
    'COLLECTOR': 1,
    'ADDITIONAL_DEPUTY_COLLECTOR': 2,
    'SDO': 3,
    'TEHSILDAR': 4,
    'BDO': 5,
    'TALATHI': 6,
    'GRAMSEVAK': 7
  };

  const roleDisplayNames = {
    'COLLECTOR': 'Collector',
    'ADDITIONAL_DEPUTY_COLLECTOR': 'Additional Collector',
    'SDO': 'SDO',
    'TEHSILDAR': 'Tehsildar',
    'BDO': 'BDO',
    'TALATHI': 'Talathi',
    'GRAMSEVAK': 'Gram Sevak'
  };

  const currentUserLevel = roleLevels[currentUser?.role] || 99;

  // Filter roles that are lower level than current user
  const availableTargetRoles = Object.keys(roleLevels).filter(role => roleLevels[role] > currentUserLevel);

  useEffect(() => {
    // Fetch Talukas (Filtered by targetRole if selected)
    const roleForTaluka = formData.targetRole === 'ALL' ? '' : formData.targetRole;
    getTalukas(roleForTaluka)
      .then(res => {
        setTalukas(res || []);
      })
      .catch(err => console.error("Error fetching talukas:", err));
  }, [formData.targetRole]);

  useEffect(() => {
    if (!formData.targetTaluka) {
      setVillages([]);
      return;
    }
    // Fetch Villages for selected Taluka (Filtered by targetRole if selected)
    const roleForVillage = formData.targetRole === 'ALL' ? '' : formData.targetRole;
    getVillagesByTaluka(formData.targetTaluka, roleForVillage)
      .then(res => {
        setVillages(res || []);
      })
      .catch(err => console.error("Error fetching villages:", err));
  }, [formData.targetTaluka, formData.targetRole]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'jpg', 'jpeg', 'png'];
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      setFormErrors(prev => ({ ...prev, file: 'Invalid format. Allowed Only: PDF, Word, Excel, CSV, TXT, Images' }));
      setFile(null);
      e.target.value = null;
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFormErrors(prev => ({ ...prev, file: 'File size must be less than 10MB' }));
      setFile(null);
      e.target.value = null;
      return;
    }

    setFormErrors(prev => ({ ...prev, file: '' }));
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let errors = { title: '', message: '', file: '' };
    let hasError = false;

    if (!formData.title || !formData.title.trim()) {
      errors.title = 'Subject / Title must not be empty.';
      hasError = true;
    }

    if (!formData.message || !formData.message.trim()) {
      errors.message = 'Content must not be empty.';
      hasError = true;
    }

    if (!formData.targetRole) {
      errors.targetRole = 'Please select a target role.';
      hasError = true;
    }

    if (hasError) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({ title: '', message: '', targetRole: '', file: '' });
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        message: formData.message,
        isCircular: formData.isCircular,
        targetRole: (formData.targetRole === 'ALL' || !formData.targetRole) ? null : formData.targetRole,
        targetTaluka: formData.targetTaluka || null,
        targetVillage: formData.targetVillage || null,
        requesterId: currentUser?.userID
      };

      await createAnnouncement(payload, file);
      toast.success('Message sent successfully');
      onSuccess();
    } catch (error) {
      console.error("Error sending announcement:", error);
      const errorData = error.response?.data;
      if (typeof errorData === 'object' && errorData !== null) {
        setFormErrors({
          title: errorData.title || '',
          message: errorData.message || (errorData.title ? '' : 'Validation failed'),
          targetRole: errorData.targetRole || '',
          file: errorData.file || ''
        });
        if (!errorData.title && !errorData.message) {
          toast.error(errorData.message_error || 'Validation failed');
        }
      } else {
        toast.error(errorData || 'Failed to send message');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-content border-0 overflow-hidden rounded-4">
      {/* Header */}
      <div className="bg-primary text-white p-4 border-0 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2 bg-white bg-opacity-20 rounded-3">
            <MegaphoneIcon style={{ width: '1.5rem' }} className="text-white" />
          </div>
          <div>
            <h2 className="h4 fw-bold mb-0 text-white">Send Communications</h2>
            <p className="small mb-0 opacity-75">Target by role and area</p>
          </div>
        </div>
        <Button variant="link" className="text-white p-0" onClick={onClose}>
          <XMarkIcon style={{ width: '1.5rem' }} />
        </Button>
      </div>

      {/* Form Body */}
      <div className="p-4 bg-light bg-opacity-50">
        <Form onSubmit={handleSubmit}>
          <Row className="g-4">
            {/* Title */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary">Subject / Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter message title..."
                  value={formData.title}
                  isInvalid={!!formErrors.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (formErrors.title) setFormErrors({ ...formErrors, title: '' });
                  }}
                  className="rounded-3 border-light-subtle py-2 shadow-sm"
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.title}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Message */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary">Content</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  placeholder="Type your official communication here..."
                  value={formData.message}
                  isInvalid={!!formErrors.message && formErrors.message !== 'Validation failed'}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value });
                    if (formErrors.message) setFormErrors({ ...formErrors, message: '' });
                  }}
                  className="rounded-3 border-light-subtle py-2 shadow-sm resize-none"
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Role & Area */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary d-flex align-items-center gap-2">
                  <UserGroupIcon style={{ width: '1rem' }} className="text-primary" />
                  Target Role
                </Form.Label>
                <Form.Select
                  value={formData.targetRole}
                  isInvalid={!!formErrors.targetRole}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      targetRole: e.target.value,
                      targetTaluka: '',
                      targetVillage: ''
                    });
                    if (formErrors.targetRole) setFormErrors({ ...formErrors, targetRole: '' });
                  }}
                  className="rounded-3 border-light-subtle py-2 shadow-sm cursor-pointer"
                >
                  <option value="" disabled hidden>Select Role</option>
                  <option value="ALL">Broadcast to All Roles</option>
                  {availableTargetRoles.map(role => (
                    <option key={role} value={role}>{roleDisplayNames[role]}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {formErrors.targetRole}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary d-flex align-items-center gap-2">
                  <MapPinIcon style={{ width: '1rem' }} className="text-primary" />
                  Target Taluka
                </Form.Label>
                <Form.Select
                  value={formData.targetTaluka}
                  onChange={(e) => setFormData({ ...formData, targetTaluka: e.target.value, targetVillage: '' })}
                  className="rounded-3 border-light-subtle py-2 shadow-sm cursor-pointer"
                >
                  <option value="">All Talukas</option>
                  {talukas.map(taluka => (
                    <option key={taluka} value={taluka}>{taluka}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {formData.targetTaluka && (
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-secondary d-flex align-items-center gap-2">
                    <MapPinIcon style={{ width: '1rem' }} className="text-primary" />
                    Target Village
                  </Form.Label>
                  <Form.Select
                    value={formData.targetVillage}
                    onChange={(e) => setFormData({ ...formData, targetVillage: e.target.value })}
                    className="rounded-3 border-light-subtle py-2 shadow-sm cursor-pointer"
                  >
                    <option value="">All Villages in {formData.targetTaluka}</option>
                    {villages.map(village => (
                      <option key={village} value={village}>{village}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}

            {/* File Attachment */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary d-flex align-items-center gap-2">
                  <PaperClipIcon style={{ width: '1rem' }} className="text-primary" />
                  Attachment (Optional)
                </Form.Label>
                <div
                  className={`p-3 border-2 border-dashed rounded-3 bg-white transition-all d-flex align-items-center justify-content-between ${formErrors.file ? 'border-danger bg-danger bg-opacity-10' :
                      file ? 'border-success bg-success bg-opacity-10' : 'border-light-subtle'
                    }`}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className={`p-2 rounded-3 ${formErrors.file ? 'bg-danger text-white' :
                        file ? 'bg-success text-white' : 'bg-light text-secondary'
                      }`}>
                      <PaperClipIcon style={{ width: '1.25rem' }} />
                    </div>
                    <div>
                      <p className={`small fw-bold mb-0 ${formErrors.file ? 'text-danger' :
                          file ? 'text-success' : 'text-dark'
                        }`}>
                        {file ? file.name : (formErrors.file ? 'Upload Failed' : 'Select a file to attach')}
                      </p>
                      <p className="text-secondary mb-0" style={{ fontSize: '0.65rem' }}>
                        {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'PDF, Images, or Documents (Max 10MB)'}
                      </p>
                    </div>
                  </div>
                  <InputGroup className="w-auto">
                    <Form.Control
                      type="file"
                      id="file-upload"
                      className="d-none"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png"
                    />
                    <Button
                      as="label"
                      htmlFor="file-upload"
                      variant={
                        formErrors.file ? "outline-danger" :
                          file ? "outline-success" : "outline-primary"
                      }
                      size="sm"
                      className="fw-bold px-3 rounded-3"
                    >
                      {file ? 'Change File' : 'Browse'}
                    </Button>
                  </InputGroup>
                </div>
                {formErrors.file && (
                  <div className="text-danger small mt-2 d-flex align-items-center gap-1">
                    <XMarkIcon style={{ width: '0.85rem', height: '0.85rem' }} />
                    {formErrors.file}
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex gap-3 pt-5 mt-2 border-top">
            <Button
              variant="light"
              className="px-4 py-2 fw-bold text-secondary rounded-3 border w-100"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="px-4 py-2 fw-bold rounded-3 shadow-sm w-100 d-flex align-items-center justify-content-center gap-2"
            >
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <PaperAirplaneIcon style={{ width: '1.25rem' }} />
                  {formData.isCircular ? 'Publish Circular' : 'Send Message'}
                </>
              )}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default AnnouncementForm;
