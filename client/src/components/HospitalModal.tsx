import React, { useState, useEffect } from 'react';

interface HospitalData {
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
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h3>{hospital ? 'Edit Hospital' : 'Add New Hospital'}</h3>
            <button type="button" className="modal-close" onClick={onClose}>&times;</button>
          </div>
          
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label>Hospital Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} required />
              </div>
            </div>

            <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Beds & ICU</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Total Beds</label>
                <input type="number" name="total_beds" value={formData.total_beds} onChange={handleChange} min="0" required />
              </div>
              <div className="form-group">
                <label>Available Beds</label>
                <input type="number" name="available_beds" value={formData.available_beds} onChange={handleChange} min="0" required />
              </div>
              <div className="form-group">
                <label>Total ICU Beds</label>
                <input type="number" name="icu_beds_total" value={formData.icu_beds_total} onChange={handleChange} min="0" required />
              </div>
              <div className="form-group">
                <label>Available ICU Beds</label>
                <input type="number" name="icu_beds_available" value={formData.icu_beds_available} onChange={handleChange} min="0" required />
              </div>
            </div>

            <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Equipment</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Total Ventilators</label>
                <input type="number" name="ventilators_total" value={formData.ventilators_total} onChange={handleChange} min="0" required />
              </div>
              <div className="form-group">
                <label>Available Ventilators</label>
                <input type="number" name="ventilators_available" value={formData.ventilators_available} onChange={handleChange} min="0" required />
              </div>
              <div className="form-group">
                <label>Oxygen Cylinders</label>
                <input type="number" name="oxygen_cylinders" value={formData.oxygen_cylinders} onChange={handleChange} min="0" required />
              </div>
            </div>

            <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Blood Units</h4>
            <div className="form-row">
              <div className="form-group">
                <label>A+ Units</label>
                <input type="number" name="blood_units_a_plus" value={formData.blood_units_a_plus} onChange={handleChange} min="0" required />
              </div>
              <div className="form-group">
                <label>B+ Units</label>
                <input type="number" name="blood_units_b_plus" value={formData.blood_units_b_plus} onChange={handleChange} min="0" required />
              </div>
              <div className="form-group">
                <label>O+ Units</label>
                <input type="number" name="blood_units_o_plus" value={formData.blood_units_o_plus} onChange={handleChange} min="0" required />
              </div>
              <div className="form-group">
                <label>AB+ Units</label>
                <input type="number" name="blood_units_ab_plus" value={formData.blood_units_ab_plus} onChange={handleChange} min="0" required />
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Hospital</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HospitalModal;
