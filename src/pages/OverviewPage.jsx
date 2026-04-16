import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { clearAdminSession } from '../utils/session';

export default function OverviewPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSheds: 0,
    todayReports: 0,
    pendingApprovals: 0
  });
  const [criticalSheds, setCriticalSheds] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
  setLoading(true);
  try {
    // 1. Precise Local Midnight to UTC Conversion
    const now = new Date();
    // Set to 00:00:00 in local time
    const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    // Convert that exact moment to a UTC string for Supabase
    const startOfTodayUTC = localMidnight.toISOString(); 

    // 2. Parallel Fetch
    const [users, sheds, reports, criticalData] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('sheds').select('*', { count: 'exact' }),
      // This will now strictly filter only the 4 reports from your local 'today'
      supabase.from('community_reports')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfTodayUTC),
      supabase.from('community_reports')
        .select(`
          created_at,
          stock_level,
          sheds (station_name, district)
        `)
        .eq('stock_level', 'Out of Stock')
        .order('created_at', { ascending: false })
        .limit(4)
    ]);

    // 3. Update Stats
    const { data: shedList } = await supabase.from('sheds').select('is_verified');

    setStats({
      totalUsers: users.count || 0,
      totalSheds: sheds.count || 0,
      todayReports: reports.count || 0, // Should now correctly show 4
      pendingApprovals: shedList ? shedList.filter(s => !s.is_verified).length : 0
    });

    const formattedCritical = (criticalData.data || []).map(item => ({
      title: 'Out of Stock Alert',
      location: `${item.sheds?.station_name || 'Unknown'}, ${item.sheds?.district || ''}`,
      accent: 'red'
    }));
    
    setCriticalSheds(formattedCritical);

  } catch (error) {
    console.error('Fetch Error:', error.message);
  } finally {
    setLoading(false);
  }
};

  const handleSignOut = () => {
    clearAdminSession();
    navigate('/login', { replace: true });
  };

  if (loading) return <div className="loading-state">Syncing System Data...</div>;

  const summaryCards = [
    { title: 'Total Residents', value: stats.totalUsers },
    { title: 'Registered Sheds', value: stats.totalSheds },
    { title: "Today's Reports", value: stats.todayReports },
    { title: 'Pending Approvals', value: stats.pendingApprovals },
  ];

  return (
    <section className="overview-container">
      <div className="overview-head">
        <h2 className="overview-title">System summary page.</h2>
        <button type="button" className="signout-btn" onClick={handleSignOut}>
          Sign out
        </button>
      </div>

      <div className="stat-grid">
        {summaryCards.map((card) => (
          <article key={card.title} className="stat-card">
            <p className="stat-label">{card.title}</p>
            <p className="stat-value">{card.value}</p>
          </article>
        ))}
      </div>

      <h3 className="section-title">Critical Fuel Status</h3>

      <div className="critical-grid">
        {criticalSheds.length > 0 ? (
          criticalSheds.map((item, index) => (
            <article key={index} className={`critical-card ${item.accent}`}>
              <p className="critical-title">{item.title}</p>
              <p className="critical-note">{item.location}</p>
            </article>
          ))
        ) : (
          <p className="empty-msg">No critical shortages reported in the system.</p>
        )}
      </div>
    </section>
  );
}