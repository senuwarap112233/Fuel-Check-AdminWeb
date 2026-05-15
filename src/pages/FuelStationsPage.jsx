import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function FuelStationsPage() {
  const [pending, setPending] = useState([]);
  const [registered, setRegistered] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sheds')
        .select(`
          *,
          fuel_stocks!fk_shed (fuel_type)
        `);

      if (error) throw error;

      setPending(data.filter(shed => !shed.is_verified));
      setRegistered(data.filter(shed => shed.is_verified));
    } catch (error) {
      console.error('Error fetching stations:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  // Helper function to open the document
  const openDocument = (url) => {
    if (!url) return alert("No document found for this station.");
    
    // If the URL is just a path, construct the full Supabase Storage URL
    // Replace 'verification-docs' with your actual bucket name if different
    const publicUrl = url.startsWith('http') 
      ? url 
      : `${supabase.supabaseUrl}/storage/v1/object/public/verification-docs/${url}`;

    window.open(publicUrl, '_blank');
  };

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from('sheds')
        .update({ is_verified: true })
        .eq('id', id);

      if (error) throw error;
      fetchStations();
    } catch (error) {
      alert('Approval failed: ' + error.message);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Delete this registration?")) return;
    try {
      const { error } = await supabase.from('sheds').delete().eq('id', id);
      if (error) throw error;
      fetchStations();
    } catch (error) {
      alert('Rejection failed: ' + error.message);
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="fs-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="fs-page-title">Manage all Fuel Stations</h2>
        <button
          onClick={fetchStations}
          style={{ padding: '8px 15px', backgroundColor: '#FFB800', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Refresh Data
        </button>
      </div>

      {/* --- PENDING SECTION --- */}
      <div className="pending-card">
        <p className="pending-card-title">Approve Pending Registrations</p>
        {pending.length === 0 ? (
          <p className="pending-empty">No pending registrations.</p>
        ) : (
          pending.map((station) => (
            <div key={station.id} className="pending-row">
              <span className="pending-name">
                {station.station_name} <small style={{ color: '#666' }}>({station.district})</small>
              </span>
              <div className="pending-actions">
                <button className="btn-preview" onClick={() => openDocument(station.document_url)}>
                  Preview Doc
                </button>
                <button className="btn-approve" onClick={() => handleApprove(station.id)}>Approve</button>
                <button className="btn-reject" onClick={() => handleReject(station.id)}>Reject</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- REGISTERED TABLE --- */}
      <div className="fs-table-wrap">
        <table className="fs-table">
          <thead>
            <tr>
              <th>Station Name</th>
              <th>District</th>
              <th>Status</th>
              <th>Fuel Stocks</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {registered.map((row) => (
              <tr key={row.id}>
                <td>{row.station_name}</td>
                <td>{row.district}</td>
                <td><span className="status-badge badge-active">Verified</span></td>
                <td>{row.fuel_stocks?.map(f => f.fuel_type).join(', ') || 'N/A'}</td>
                <td>
                  <button className="btn-preview sm" onClick={() => openDocument(row.document_url)}>
                    View Doc
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}