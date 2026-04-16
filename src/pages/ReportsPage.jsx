import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Fetching all reports sorted by the most recent first
      const { data, error } = await supabase
        .from('community_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Reports...</div>;

  return (
    <div className="rp-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="rp-title">Total submitted reports</h2>
        <button 
          onClick={fetchReports} 
          style={{ padding: '8px 15px', backgroundColor: '#FFB800', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Refresh Data
        </button>
      </div>

      <div className="rp-table-wrap">
        <table className="rp-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>User ID (Last 4)</th>
              <th>Shed ID (Last 4)</th>
              <th>Fuel Type</th>
              <th>Queue Length</th>
              <th>Stock Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>
                  No reports submitted yet.
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id}>
                  <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{formatDate(report.created_at)}</td>
                  {/* Showing only last 4 of UUIDs to keep table clean */}
                  <td>...{report.user_id?.slice(-4) || 'Anon'}</td>
                  <td>...{report.shed_id?.slice(-4)}</td>
                  <td>{report.fuel_type}</td>
                  <td>{report.queue_length}</td>
                  <td>
                    <span style={{ 
                      color: report.stock_level === 'Out of Stock' ? 'red' : 
                             report.stock_level === 'Limited Stock' ? 'orange' : 'green',
                      fontWeight: 'bold'
                    }}>
                      {report.stock_level}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}