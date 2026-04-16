import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Badge, Button, Form, 
  InputGroup, Spinner, Stack, ProgressBar 
} from 'react-bootstrap';
import { 
  HeartIcon, 
  StarIcon, 
  TrophyIcon, 
  UserGroupIcon, 
  CalendarIcon, 
  PaperAirplaneIcon, 
  MagnifyingGlassIcon, 
  SparklesIcon 
} from '@heroicons/react/24/outline';
import { getAllAppreciations, sendAppreciation, getEligibleUsers } from '../../../services/appreciation/appreciationService';
import { toast } from 'react-hot-toast';
import Pagination from '../../common/Pagination';

const AppreciationComponent = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [formStates, setFormStates] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [appreciations, setAppreciations] = useState([]);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter]);

  // Use props user id if available
  const currentUserID = user?.userID;
  const fetchAppreciations = async () => {
    try {
      const data = await getAllAppreciations();
      const mapped = data.map(app => ({
        id: app.id,
        from: app.fromUserName,
        fromAvatar: app.fromUserName.substring(0, 2).toUpperCase(),
        to: app.toUserName,
        toAvatar: app.toUserName.substring(0, 2).toUpperCase(),
        message: app.message,
        date: app.createdAt.split('T')[0],
        badge: app.badge || 'Excellence Award',
        fromRole: formatRole(app.fromRole),
        toRole: formatRole(app.toRole)
      }));
      setAppreciations(mapped);
    } catch (error) {
      console.error("Fetch Appreciations Error:", error);
      toast.error("Failed to load appreciations");
    }
  };

  const fetchStaff = async () => {
    try {
      const data = await getEligibleUsers();
      const filteredData = (data || []).filter(u => u.userID.toString() !== currentUserID?.toString());
      setStaff(filteredData);
      const initialStates = {};
      filteredData.forEach(u => {
        initialStates[u.userID] = {
          message: '',
          badge: 'Excellence Award',
          isSubmitting: false
        };
      });
      setFormStates(initialStates);
    } catch (error) {
      console.error("Fetch Eligible Users Error:", error);
      toast.error("Failed to load eligible users");
    }
  };

  useEffect(() => {
    fetchAppreciations();
    fetchStaff();
  }, []);

  const stats = [
    { label: 'Total Appreciations', value: appreciations.length, icon: HeartIcon, bgColor: 'primary', textColor: 'text-primary' },
    { label: 'This Month', value: appreciations.filter(a => new Date(a.date).getMonth() === new Date().getMonth()).length, icon: StarIcon, bgColor: 'success', textColor: 'text-success' },
    { label: 'Recipients', value: new Set(appreciations.map(a => a.to)).size, icon: UserGroupIcon, bgColor: 'info', textColor: 'text-info' },
    { label: 'Latest Badge', value: appreciations.length > 0 ? appreciations[0].badge.split(' ')[0] : 'None', icon: TrophyIcon, bgColor: 'warning', textColor: 'text-warning' },
  ];

  const getBadgeVariant = (badge) => {
    const variants = {
      'Excellence Award': 'primary',
      'Community Service': 'success',
      'Quick Resolution': 'warning',
      'Innovation Award': 'info',
      'Team Excellence': 'secondary'
    };
    return variants[badge] || 'dark';
  };

  const formatRole = (roleStr) => {
    if (!roleStr) return 'N/A';
    const roleMap = {
      'COLLECTOR': 'Collector',
      'ADDITIONAL_DEPUTY_COLLECTOR': 'Additional Collector',
      'SDO': 'SDO',
      'TEHSILDAR': 'Tehsildar',
      'BDO': 'BDO',
      'TALATHI': 'Talathi',
      'GRAMSEVAK': 'Gram Sevak',
      'SYSTEM_ADMINISTRATOR': 'System Administrator'
    };
    return roleMap[roleStr.toUpperCase()] || roleStr;
  };

  const filteredAppreciations = appreciations.filter(apt => {
    const matchesSearch = apt.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.to.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Improved "mine" filter logic to use actual logged-in user name
    const currentUserName = user?.name || '';
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'mine' && apt.from === currentUserName);
    return matchesSearch && matchesFilter;
  });

  const handleInlineSubmit = async (targetUser) => {
    const formData = formStates[targetUser.userID];
    if (!formData.message.trim()) {
      toast.error("Please add a message");
      return;
    }
    setFormStates(prev => ({ ...prev, [targetUser.userID]: { ...formData, isSubmitting: true } }));
    try {
      const fromUserId = user?.userID;
      const payload = {
        fromUserId,
        toUserId: targetUser.userID,
        message: formData.message,
        badge: formData.badge
      };
      console.log("Sending appreciation payload:", payload);
      
      await sendAppreciation(payload);
      
      toast.success(`Appreciation sent to ${targetUser.name}!`);
      fetchAppreciations();
      fetchStaff();
    } catch (error) {
      console.error("Send Appreciation Error:", error);
      toast.error(error.response?.data?.message || "Failed to send appreciation");
      setFormStates(prev => ({ ...prev, [targetUser.userID]: { ...formData, isSubmitting: false } }));
    }
  };

  const badgesList = ['Excellence Award', 'Community Service', 'Quick Resolution', 'Innovation Award', 'Team Excellence'];

  return (
    <div className="p-4 p-lg-5 bg-light min-vh-100">
      {/* Header */}
      <div className="mb-5">
        <h1 className="display-6 fw-bold text-primary mb-1 font-outfit">Amravati Connect</h1>
        <p className="text-secondary mb-0">Celebrate team achievements and foster a culture of appreciation</p>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-5">
        {stats.map((stat) => (
          <Col key={stat.label} xs={6} md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                <div>
                  <p className="small text-secondary fw-medium mb-1">{stat.label}</p>
                  <h3 className="fw-bold mb-0 text-dark">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-4 bg-${stat.bgColor} bg-opacity-10`}>
                  <stat.icon style={{ width: '2rem' }} className={stat.textColor} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Users Awaiting Appreciation */}
      <div className="mb-5">
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="p-2 bg-primary bg-opacity-10 rounded-3">
            <UserGroupIcon style={{ width: '1.5rem' }} className="text-primary" />
          </div>
          <div>
            <h4 className="fw-bold text-dark mb-0">Users Awaiting Appreciation</h4>
            <p className="small text-secondary mb-0">Give a quick shout-out to those who haven't received one yet</p>
          </div>
        </div>

        {staff.length > 0 ? (
          <Row className="g-4">
            {staff.map((member) => (
              <Col key={member.userID} md={6} xl={4}>
                <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden hover-shadow transition-all">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div className="avatar-square bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center rounded-3" style={{ width: '48px', height: '48px' }}>
                        {member.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <h6 className="fw-bold text-dark mb-1 truncate">{member.name}</h6>
                        <Badge bg="light" text="dark" className="text-uppercase border px-2 py-1" style={{ fontSize: '0.65rem' }}>
                          {formatRole(member.role)}
                        </Badge>
                      </div>
                    </div>

                    <Form className="stack gap-3">
                      <Form.Select
                        size="sm"
                        value={formStates[member.userID]?.badge}
                        onChange={(e) => setFormStates(prev => ({
                          ...prev, [member.userID]: { ...prev[member.userID], badge: e.target.value }
                        }))}
                        className="bg-light border-0 rounded-3 py-2"
                      >
                        {badgesList.map(b => <option key={b} value={b}>{b}</option>)}
                      </Form.Select>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder={`What did ${member.name.split(' ')[0]} do well?`}
                        value={formStates[member.userID]?.message}
                        onChange={(e) => setFormStates(prev => ({
                          ...prev, [member.userID]: { ...prev[member.userID], message: e.target.value }
                        }))}
                        className="bg-light border-0 rounded-3 text-sm py-2"
                      />
                      <Button 
                        variant="primary" 
                        className="w-100 fw-bold py-2 rounded-3 d-flex align-items-center justify-content-center gap-2"
                        onClick={() => handleInlineSubmit(member)}
                        disabled={formStates[member.userID]?.isSubmitting}
                      >
                        {formStates[member.userID]?.isSubmitting ? <Spinner size="sm" /> : <><PaperAirplaneIcon style={{ width: '1rem' }} /> Celebrate</>}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center py-5 bg-white rounded-4 border-2 border-dashed">
            <SparklesIcon style={{ width: '3rem' }} className="text-secondary mx-auto mb-3 opacity-25" />
            <h5 className="fw-bold text-dark">All Caught Up!</h5>
            <p className="text-secondary">Everyone has been recognized for now. Check back later!</p>
          </div>
        )}
      </div>

      <hr className="my-5 opacity-10" />

      {/* Appreciation Wall */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="p-2 bg-success bg-opacity-10 rounded-3">
            <TrophyIcon style={{ width: '1.5rem' }} className="text-success" />
          </div>
          <div>
            <h4 className="fw-bold text-dark mb-0">Appreciation Wall</h4>
            <p className="small text-secondary mb-0">A timeline of excellence and teamwork</p>
          </div>
        </div>

        {/* Search & Filter */}
        <Card className="border-0 shadow-sm rounded-4 mb-5">
          <Card.Body className="p-3">
            <Row className="g-3">
              <Col md={8}>
                <InputGroup className="bg-light rounded-3 overflow-hidden border-0">
                  <InputGroup.Text className="bg-transparent border-0 pe-0">
                    <MagnifyingGlassIcon style={{ width: '1.25rem' }} className="text-secondary" />
                  </InputGroup.Text>
                  <Form.Control 
                    placeholder="Search appreciations..." 
                    className="bg-transparent border-0 py-2 py-lg-3 shadow-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={4}>
                <Form.Select 
                  className="bg-light border-0 py-2 py-lg-3 rounded-3 fw-medium h-100"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Appreciations</option>
                  <option value="mine">My Achievements</option>
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Wall Cards */}
        <Row className="g-4 mb-5">
          {filteredAppreciations
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((apt) => (
            <Col key={apt.id} lg={6}>
              <Card className="border-0 shadow-sm rounded-4 h-100 hover-shadow transition-all overflow-hidden border-top border-4 border-primary">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center gap-4">
                      {/* From */}
                      <div className="text-center">
                        <div className="avatar-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center rounded-circle mx-auto mb-1" style={{ width: '40px', height: '40px', fontSize: '0.8rem' }}>
                          {apt.fromAvatar}
                        </div>
                        <p className="small mb-0 fw-bold truncate" style={{ maxWidth: '80px' }}>{apt.from}</p>
                        <p className="text-muted" style={{ fontSize: '0.55rem' }}>{apt.fromRole}</p>
                      </div>
                      
                      <div className="text-secondary opacity-50 px-2 fw-light h2 mb-0">→</div>

                      {/* To */}
                      <div className="text-center">
                        <div className="avatar-circle bg-success text-white fw-bold d-flex align-items-center justify-content-center rounded-circle mx-auto mb-1" style={{ width: '40px', height: '40px', fontSize: '0.8rem' }}>
                          {apt.toAvatar}
                        </div>
                        <p className="small mb-0 fw-bold text-success truncate" style={{ maxWidth: '80px' }}>{apt.to}</p>
                        <p className="text-muted" style={{ fontSize: '0.55rem' }}>{apt.toRole}</p>
                      </div>
                    </div>

                  </div>

                  <Badge bg={getBadgeVariant(apt.badge)} className="px-3 py-2 rounded-pill mb-3 shadow-sm border border-white border-2">
                    {apt.badge}
                  </Badge>

                  <Card className="bg-light border-0 rounded-4 overflow-hidden mb-4">
                    <Card.Body className="p-3 fst-italic text-dark">
                      "{apt.message}"
                    </Card.Body>
                  </Card>

                  <div className="d-flex align-items-center gap-4 py-2 border-top border-light">
                    <div className="d-flex align-items-center gap-1 small text-secondary">
                      <CalendarIcon style={{ width: '1rem' }} /> {apt.date}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Pagination 
          totalItems={filteredAppreciations.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default AppreciationComponent;