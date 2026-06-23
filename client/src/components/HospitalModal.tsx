import React, { useState, useEffect } from 'react';

interface HospitalData {
  id?: number;
  name: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
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

interface HospitalModalProps {
  hospital?: HospitalData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: HospitalData) => void;
}

const defaultState: HospitalData = {
  name: '',
  address: '',
  city: '',
  latitude: 0,
  longitude: 0,
  total_beds: 0,
  available_beds: 0,
  icu_beds_total: 0,
  icu_beds_available: 0,
  ventilators_total: 0,
  ventilators_available: 0,
  oxygen_cylinders: 0,
  blood_units_a_plus: 0,
  blood_units_b_plus: 0,
  blood_units_o_plus: 0,
  blood_units_ab_plus: 0,
};

const HospitalModal: React.FC<HospitalModalProps> = ({ hospital, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<HospitalData>(defaultState);

  useEffect(() => {
    if (hospital) {
      setFormData(hospital);
    } else {
      setFormData(defaultState);
    }
  }, [hospital, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: any = value;
    
    if (type === 'number') {
      parsedValue = name === 'latitude' || name === 'longitude' ? parseFloat(value) : parseInt(value);
      if (isNaN(parsedValue)) parsedValue = 0;
    }

    setFormData({
      ...formData,
      [name]: parsedValue,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const glassStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    borderRadius: '16px',
    padding: '32px',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflowY: 'auto'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.95rem',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    transition: 'all 0.2s',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '24px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
  };

  const sectionTitleStyle: React.CSSProperties = {
    margin: '0 0 16px 0',
    fontSize: '1.1rem',
    color: '#c8102e',
    fontWeight: '700',
    borderBottom: '2px solid #f1f5f9',
    paddingBottom: '8px'
  };

  const rowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '16px'
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={glassStyle}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a', fontWeight: '800' }}>
                {hospital ? 'Edit Facility Telemetry' : 'Deploy New Facility'}
              </h2>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Update geographic and resource parameters.</p>
            </div>
            <button 
              type="button" 
              onClick={onClose}
              style={{ background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '1.5rem', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            >
              &times;
            </button>
          </div>
          
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>General Information</h4>
            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>Facility Name</label>
                <input style={inputStyle} type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. City General" />
              </div>
              <div>
                <label style={labelStyle}>City</label>
                <input style={inputStyle} type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="e.g. New York" />
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Street Address</label>
              <input style={inputStyle} type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="123 Medical Way" />
            </div>
            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>Latitude (Map Coord)</label>
                <input style={inputStyle} type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} required placeholder="40.7128" />
              </div>
              <div>
                <label style={labelStyle}>Longitude (Map Coord)</label>
                <input style={inputStyle} type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} required placeholder="-74.0060" />
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Bed Capacity</h4>
            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>Total General Beds</label>
                <input style={inputStyle} type="number" name="total_beds" value={formData.total_beds} onChange={handleChange} min="0" required />
              </div>
              <div>
                <label style={labelStyle}>Available Gen Beds</label>
                <input style={{...inputStyle, borderLeft: '4px solid #10b981'}} type="number" name="available_beds" value={formData.available_beds} onChange={handleChange} min="0" required />
              </div>
              <div>
                <label style={labelStyle}>Total ICU Beds</label>
                <input style={inputStyle} type="number" name="icu_beds_total" value={formData.icu_beds_total} onChange={handleChange} min="0" required />
              </div>
              <div>
                <label style={labelStyle}>Available ICU Beds</label>
                <input style={{...inputStyle, borderLeft: '4px solid #c8102e'}} type="number" name="icu_beds_available" value={formData.icu_beds_available} onChange={handleChange} min="0" required />
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Critical Equipment</h4>
            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>Total Ventilators</label>
                <input style={inputStyle} type="number" name="ventilators_total" value={formData.ventilators_total} onChange={handleChange} min="0" required />
              </div>
              <div>
                <label style={labelStyle}>Available Ventilators</label>
                <input style={{...inputStyle, borderLeft: '4px solid #c8102e'}} type="number" name="ventilators_available" value={formData.ventilators_available} onChange={handleChange} min="0" required />
              </div>
              <div>
                <label style={labelStyle}>Oxygen Cylinders</label>
                <input style={{...inputStyle, borderLeft: '4px solid #3b82f6'}} type="number" name="oxygen_cylinders" value={formData.oxygen_cylinders} onChange={handleChange} min="0" required />
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Blood Bank Inventory</h4>
            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>A+ Units</label>
                <input style={inputStyle} type="number" name="blood_units_a_plus" value={formData.blood_units_a_plus} onChange={handleChange} min="0" required />
              </div>
              <div>
                <label style={labelStyle}>B+ Units</label>
                <input style={inputStyle} type="number" name="blood_units_b_plus" value={formData.blood_units_b_plus} onChange={handleChange} min="0" required />
              </div>
              <div>
                <label style={labelStyle}>O+ Units</label>
                <input style={inputStyle} type="number" name="blood_units_o_plus" value={formData.blood_units_o_plus} onChange={handleChange} min="0" required />
              </div>
              <div>
                <label style={labelStyle}>AB+ Units</label>
                <input style={inputStyle} type="number" name="blood_units_ab_plus" value={formData.blood_units_ab_plus} onChange={handleChange} min="0" required />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ padding: '12px 24px', backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{ padding: '12px 32px', color: '#fff', backgroundColor: '#c8102e', border: 'none', fontWeight: 'bold', borderRadius: '8px', boxShadow: '0 4px 12px rgba(200, 16, 46, 0.3)', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HospitalModal;
