import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import HospitalModal from './HospitalModal';

interface Hospital {
  id?: number;
  name: string;
  address: string;
  city: string;
  total_beds: number;
  available_beds: number;
  icu_beds_total: number;
  icu_beds_available: number;
  ventilators_total: number;
  ventilators_available: number;
  oxygen_cylinders: number;
  blood_units_a_plus: number;
  blood_units_b_plus: number;
  blood_units_o_plus: number;
  blood_units_ab_plus: number;
}

const Dashboard: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useContext(AuthContext);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);

  const fetchHospitals = () => {
    setLoading(true);
    fetch('/hospitals/')
      .then(res => res.json())
      .then(data => {
        setHospitals(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleAddClick = () => {
    setEditingHospital(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (hospital: Hospital) => {
    setEditingHospital(hospital);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id?: number) => {
    if (!id || !window.confirm('Are you sure you want to delete this hospital?')) return;
    
    try {
      const res = await fetch(`/hospitals/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setHospitals(hospitals.filter(h => h.id !== id));
      } else {
        alert('Failed to delete hospital');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting hospital');
    }
  };

  const handleSaveHospital = async (hospitalData: Hospital) => {
    const isUpdate = !!hospitalData.id;
    const url = isUpdate ? `/hospitals/${hospitalData.id}` : '/hospitals/';
    const method = isUpdate ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(hospitalData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchHospitals(); // Refresh the list
      } else {
        alert('Failed to save hospital');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving hospital');
    }
  };

  if (loading && hospitals.length === 0) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading hospital data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-actions">
        <div className="dashboard-header" style={{ marginBottom: 0 }}>
          <h2>Hospital Network Dashboard</h2>
          <p>Real-time view of critical resources across all connected hospitals.</p>
        </div>
        {user && (
          <button className="btn btn-primary" onClick={handleAddClick}>
            + Add Hospital
          </button>
        )}
      </div>

      <div className="hospital-grid">
        {hospitals.map(hospital => (
          <div key={hospital.id} className="hospital-card">
            <div className="hospital-card-header">
              <h3>{hospital.name}</h3>
              <span className="hospital-location">{hospital.city}</span>
            </div>
            
            <div className="resource-section">
              <h4>Beds & ICU</h4>
              <div className="resource-stats">
                <div className="resource-item">
                  <span className="resource-label">Available Beds</span>
                  <span className={`resource-value ${hospital.available_beds < 10 ? 'danger' : ''}`}>
                    {hospital.available_beds} <small>/ {hospital.total_beds}</small>
                  </span>
                </div>
                <div className="resource-item">
                  <span className="resource-label">ICU Beds</span>
                  <span className={`resource-value ${hospital.icu_beds_available < 5 ? 'danger' : ''}`}>
                    {hospital.icu_beds_available} <small>/ {hospital.icu_beds_total}</small>
                  </span>
                </div>
              </div>
            </div>

            <div className="resource-section">
              <h4>Equipment</h4>
              <div className="resource-stats">
                <div className="resource-item">
                  <span className="resource-label">Ventilators</span>
                  <span className={`resource-value ${hospital.ventilators_available < 3 ? 'danger' : ''}`}>
                    {hospital.ventilators_available} <small>/ {hospital.ventilators_total}</small>
                  </span>
                </div>
                <div className="resource-item">
                  <span className="resource-label">O2 Cylinders</span>
                  <span className={`resource-value ${hospital.oxygen_cylinders < 20 ? 'danger' : ''}`}>
                    {hospital.oxygen_cylinders}
                  </span>
                </div>
              </div>
            </div>

            <div className="resource-section">
              <h4>Blood Bank (Units)</h4>
              <div className="blood-grid">
                <div className="blood-item"><span>A+</span> {hospital.blood_units_a_plus}</div>
                <div className="blood-item"><span>B+</span> {hospital.blood_units_b_plus}</div>
                <div className="blood-item"><span>O+</span> {hospital.blood_units_o_plus}</div>
                <div className="blood-item"><span>AB+</span> {hospital.blood_units_ab_plus}</div>
              </div>
            </div>

            {user && (
              <div className="card-actions">
                <button className="btn btn-secondary btn-small" onClick={() => handleEditClick(hospital)}>Edit</button>
                <button className="btn btn-secondary btn-small" style={{ color: 'var(--primary)', borderColor: 'rgba(200,16,46,0.3)' }} onClick={() => handleDeleteClick(hospital.id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <HospitalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveHospital} 
        hospital={editingHospital} 
      />
    </div>
  );
};

export default Dashboard;
