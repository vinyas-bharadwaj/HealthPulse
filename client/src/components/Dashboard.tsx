import React, { useEffect, useState, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import HospitalModal from './HospitalModal';
import DashboardAnalysisPanel from './DashboardAnalysisPanel';
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Hospital {
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

interface Distance {
  id: number;
  source_hospital_id: number;
  target_hospital_id: number;
  distance: number;
}

const Dashboard: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [distances, setDistances] = useState<Distance[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useContext(AuthContext);
  
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hospitalsRes, distancesRes] = await Promise.all([
        fetch('/hospitals/'),
        fetch('/hospitals/distances/')
      ]);
      const hospitalsData = await hospitalsRes.json();
      const distancesData = await distancesRes.json();
      setHospitals(hospitalsData);
      setDistances(distancesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
    if (!id || !window.confirm('Are you sure you want to delete this facility?')) return;
    
    try {
      const res = await fetch(`/hospitals/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setHospitals(hospitals.filter(h => h.id !== id));
        setDistances(distances.filter(d => d.source_hospital_id !== id && d.target_hospital_id !== id));
        if (selectedHospitalId === id) setSelectedHospitalId(null);
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
        fetchData(); // Refresh the list
      } else {
        alert('Failed to save hospital');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving hospital');
    }
  };

  const geojson = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: distances.map(d => {
        const source = hospitals.find(h => h.id === d.source_hospital_id);
        const target = hospitals.find(h => h.id === d.target_hospital_id);
        if (!source || !target || !source.longitude || !source.latitude || !target.longitude || !target.latitude) return null;
        
        return {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [source.longitude, source.latitude],
              [target.longitude, target.latitude]
            ]
          },
          properties: {
            distance: d.distance
          }
        };
      }).filter(Boolean)
    };
  }, [hospitals, distances]);

  if (loading && hospitals.length === 0) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Initializing Geographic Command Center...</p>
      </div>
    );
  }

  // Network Statistics
  const totalHospitals = hospitals.length;
  const totalBedsTotal = hospitals.reduce((acc, h) => acc + h.total_beds, 0);
  const totalBedsAvailable = hospitals.reduce((acc, h) => acc + h.available_beds, 0);
  const totalIcuTotal = hospitals.reduce((acc, h) => acc + h.icu_beds_total, 0);
  const totalIcuAvailable = hospitals.reduce((acc, h) => acc + h.icu_beds_available, 0);

  const selectedHospital = hospitals.find(h => h.id === selectedHospitalId);
  const alerts = hospitals.filter(h => h.available_beds < 10 || h.icu_beds_available < 5 || h.ventilators_available < 3);

  // Utilization Percentages
  const bedUtilization = totalBedsTotal > 0 ? Math.round(((totalBedsTotal - totalBedsAvailable) / totalBedsTotal) * 100) : 0;
  const icuUtilization = totalIcuTotal > 0 ? Math.round(((totalIcuTotal - totalIcuAvailable) / totalIcuTotal) * 100) : 0;

  // Reusable Glassmorphism Style for Light Theme
  const glassStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      
      {/* Standard Header Row to prevent overlap */}
      <div className="dashboard-actions" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0 }}>
        <div className="dashboard-header" style={{ marginBottom: 0 }}>
          <h2 style={{ color: '#1a1a1a', fontSize: '1.8rem', fontWeight: '800', margin: '0 0 5px 0' }}>Network Command Center</h2>
          <p style={{ color: '#666', margin: 0, fontSize: '1rem' }}>Live telemetry and resource management mapped globally.</p>
        </div>
        {user && (
          <button className="btn btn-primary" onClick={handleAddClick} style={{ backgroundColor: '#c8102e', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(200, 16, 46, 0.2)', color: '#fff', cursor: 'pointer', transition: 'all 0.3s ease' }}>
            + Add Facility
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '24px', flex: 1, overflow: 'hidden', width: '100%' }}>
        
        {/* Left Side: Alerts & Status (Static) */}
        <div style={{ width: '380px', flexShrink: 0, height: '100%', borderRadius: '16px', display: 'flex', flexDirection: 'column', padding: '24px', border: '1px solid #e2e8f0', background: '#fff' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: '#c8102e', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px rgba(200, 16, 46, 0.6)' }}></span>
            Live Network Alerts
          </h3>
          
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
            {alerts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {alerts.map(a => (
                  <div key={a.id} style={{ padding: '16px', backgroundColor: '#fff5f5', borderLeft: '4px solid #c8102e', borderRadius: '8px', border: '1px solid #ffeaea', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <strong style={{ color: '#a80016', display: 'block', marginBottom: '8px', fontSize: '1rem', letterSpacing: '0.2px' }}>{a.name}</strong>
                    <span style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6', display: 'block' }}>
                      {a.available_beds < 10 && <span style={{display: 'block'}}>• General Beds Critical ({a.available_beds})</span>}
                      {a.icu_beds_available < 5 && <span style={{display: 'block'}}>• ICU Capacity Critical ({a.icu_beds_available})</span>}
                      {a.ventilators_available < 3 && <span style={{display: 'block'}}>• Ventilator Shortage ({a.ventilators_available})</span>}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#15803d', fontSize: '0.95rem', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #22c55e', border: '1px solid #dcfce7' }}>
                All network telemetry optimal. No critical shortages detected.
              </div>
            )}
          </div>
          
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <h4 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '16px', fontWeight: '600', letterSpacing: '0.5px' }}>System Utilization</h4>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '500', color: '#64748b' }}>
                <span>General Beds</span>
                <span style={{ color: '#334155' }}>{bedUtilization}% Used</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}>
                <div style={{ height: '100%', width: `${bedUtilization}%`, backgroundColor: bedUtilization > 85 ? '#c8102e' : '#e63946', transition: 'width 0.5s ease-out' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '500', color: '#64748b' }}>
                <span>ICU Capacity</span>
                <span style={{ color: '#334155' }}>{icuUtilization}% Used</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}>
                <div style={{ height: '100%', width: `${icuUtilization}%`, backgroundColor: icuUtilization > 85 ? '#c8102e' : '#e63946', transition: 'width 0.5s ease-out' }}></div>
              </div>
            </div>
          </div>
        </div>
        <div 
          style={{ position: 'relative', flex: 1, backgroundColor: '#fcfcfc', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.02)' }}
          onClick={() => setSelectedHospitalId(null)}
        >
          <Map
          initialViewState={{
            longitude: -73.97,
            latitude: 40.75,
            zoom: 10
          }}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
          {/* Edges Layer */}
          <Source id="edges" type="geojson" data={geojson as any}>
            <Layer 
              id="edges-layer" 
              type="line" 
              paint={{
                'line-color': '#c8102e',
                'line-width': 3,
                'line-opacity': 0.4,
                'line-dasharray': [2, 4]
              }} 
            />
          </Source>

          {/* Hospital Nodes */}
          {hospitals.map(h => {
            if (!h.latitude || !h.longitude) return null;
            const isSelected = selectedHospitalId === h.id;
            const isCritical = h.available_beds < 10 || h.icu_beds_available < 5 || h.ventilators_available < 3;

            return (
              <Marker 
                key={h.id} 
                longitude={h.longitude} 
                latitude={h.latitude} 
                anchor="center"
              >
                <div 
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedHospitalId(h.id!);
                  }}
                  style={{
                  position: 'relative',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}>
                  {/* Critical pulse */}
                  {isCritical && (
                    <div style={{
                      position: 'absolute',
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      border: '2px solid #e63946',
                      animation: 'pulse 2s infinite'
                    }} />
                  )}
                  {/* Outer circle */}
                  <div style={{
                    position: 'absolute',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: `2px ${isSelected ? 'solid' : 'dashed'} ${isSelected ? '#ff4d4d' : '#94a3b8'}`,
                    animation: isSelected ? 'none' : 'spin 15s linear infinite'
                  }} />
                  {/* Inner core */}
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? '#c8102e' : (isCritical ? '#e63946' : '#fff'),
                    border: `2px solid ${isSelected || isCritical ? '#fff' : '#cbd5e1'}`,
                    boxShadow: isSelected || isCritical ? '0 0 12px rgba(200, 16, 46, 0.6)' : '0 4px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: isSelected || isCritical ? '#fff' : '#94a3b8' }} />
                  </div>
                  {/* Label */}
                  <div style={{
                    position: 'absolute',
                    top: '42px',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#1e293b',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: 3
                  }}>
                    {h.name}
                  </div>
                </div>
              </Marker>
            );
          })}
        </Map>

        {/* Global animations for map markers */}
        <style>
          {`
            @keyframes pulse {
              0% { transform: scale(0.5); opacity: 0.8; }
              100% { transform: scale(1.5); opacity: 0; }
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>

        {/* Floating Top Stats Pills */}
        <div style={{ position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '16px', zIndex: 1000, pointerEvents: 'none' }}>
          <div style={{ ...glassStyle, padding: '10px 24px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Facilities</span>
            <span style={{ color: '#0f172a', fontSize: '1.2rem', fontWeight: '800' }}>{totalHospitals}</span>
          </div>
          <div style={{ ...glassStyle, padding: '10px 24px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Gen Beds</span>
            <span style={{ color: '#0f172a', fontSize: '1.2rem', fontWeight: '800' }}>{totalBedsAvailable}</span>
          </div>
          <div style={{ ...glassStyle, padding: '10px 24px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(200, 16, 46, 0.2)', boxShadow: '0 4px 12px rgba(200, 16, 46, 0.1)' }}>
            <span style={{ color: '#c8102e', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>ICU Beds</span>
            <span style={{ color: '#0f172a', fontSize: '1.2rem', fontWeight: '800' }}>{totalIcuAvailable}</span>
          </div>
        </div>

        {/* Selected Hospital Side Panel (Floating) */}
        {selectedHospital && (
          <div 
            style={{ position: 'absolute', right: '30px', top: '30px', bottom: 'auto', maxHeight: '45vh', width: '400px', ...glassStyle, borderRadius: '16px', display: 'flex', flexDirection: 'column', zIndex: 1000, padding: '24px', animation: 'fadeIn 0.3s ease-out' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', color: '#1e293b', fontWeight: '800', letterSpacing: '0.5px' }}>{selectedHospital.name}</h3>
                <span style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  {selectedHospital.address}, {selectedHospital.city}
                </span>
              </div>
              <button onClick={() => setSelectedHospitalId(null)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }}>&times;</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
              <div style={{ marginBottom: '28px' }}>
                <h4 style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', marginBottom: '16px', color: '#c8102e', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Bed Availability</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: '#475569', fontSize: '0.95rem', fontWeight: '500' }}>General Ward</span>
                    <span style={{ fontSize: '1rem', fontWeight: '800', color: selectedHospital.available_beds < 10 ? '#c8102e' : '#0f172a' }}>
                      {selectedHospital.available_beds} <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'normal' }}>/ {selectedHospital.total_beds}</span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: '#475569', fontSize: '0.95rem', fontWeight: '500' }}>Intensive Care</span>
                    <span style={{ fontSize: '1rem', fontWeight: '800', color: selectedHospital.icu_beds_available < 5 ? '#c8102e' : '#0f172a' }}>
                      {selectedHospital.icu_beds_available} <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'normal' }}>/ {selectedHospital.icu_beds_total}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <h4 style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', marginBottom: '16px', color: '#c8102e', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Equipment</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: '#475569', fontSize: '0.95rem', fontWeight: '500' }}>Ventilators</span>
                    <span style={{ fontSize: '1rem', fontWeight: '800', color: selectedHospital.ventilators_available < 3 ? '#c8102e' : '#0f172a' }}>
                      {selectedHospital.ventilators_available} <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'normal' }}>/ {selectedHospital.ventilators_total}</span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: '#475569', fontSize: '0.95rem', fontWeight: '500' }}>Oxygen Cylinders</span>
                    <span style={{ fontSize: '1rem', fontWeight: '800', color: selectedHospital.oxygen_cylinders < 20 ? '#c8102e' : '#0f172a' }}>
                      {selectedHospital.oxygen_cylinders}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <h4 style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', marginBottom: '16px', color: '#c8102e', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Blood Bank Inventory</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ color: '#c8102e', fontWeight: 'bold', marginBottom: '6px', fontSize: '1.1rem' }}>A+</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>{selectedHospital.blood_units_a_plus}</div>
                  </div>
                  <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ color: '#c8102e', fontWeight: 'bold', marginBottom: '6px', fontSize: '1.1rem' }}>B+</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>{selectedHospital.blood_units_b_plus}</div>
                  </div>
                  <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ color: '#c8102e', fontWeight: 'bold', marginBottom: '6px', fontSize: '1.1rem' }}>O+</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>{selectedHospital.blood_units_o_plus}</div>
                  </div>
                  <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ color: '#c8102e', fontWeight: 'bold', marginBottom: '6px', fontSize: '1.1rem' }}>AB+</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>{selectedHospital.blood_units_ab_plus}</div>
                  </div>
                </div>
              </div>
            </div>

            {user && (
              <div style={{ marginTop: 'auto', paddingTop: '24px', display: 'flex', gap: '12px', borderTop: '1px solid #f1f5f9' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '12px', backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }} 
                  onClick={() => handleEditClick(selectedHospital)}
                >
                  Edit Data
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '12px', color: '#fff', backgroundColor: '#c8102e', border: 'none', fontWeight: 'bold', borderRadius: '8px', boxShadow: '0 4px 10px rgba(200, 16, 46, 0.3)', cursor: 'pointer' }} 
                  onClick={() => handleDeleteClick(selectedHospital.id)}
                >
                  Delete Node
                </button>
              </div>
            )}
          </div>
        )}
        </div>

        <div style={{ width: '380px', flexShrink: 0, height: '100%' }}>
          <DashboardAnalysisPanel onDataChange={fetchData} />
        </div>
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
