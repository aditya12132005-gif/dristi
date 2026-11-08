/**
 * DRISHTI Mock Intelligence & API Server
 * Provides full REST & WebSocket backend for DRISHTI frontend on port 8001.
 */

const http = require('http');
const url = require('url');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = 8001;

// Load network graph from frontend public
let networkGraph = { graph: { nodes: [], edges: [] } };
try {
  const graphPath = path.join(__dirname, 'frontend', 'public', 'network_graph.json');
  if (fs.existsSync(graphPath)) {
    networkGraph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
  }
} catch (e) {
  console.error('Warning: could not read network_graph.json', e.message);
}

// Full Train Roster
const TRAINS = [
  { train_id: '12841', train_name: 'Coromandel Express', current_station: 'BLS', zone: 'SER', route: 'HWH-MAS', stress_level: 'CRITICAL', speed: 128, delay_minutes: 42, latitude: 21.49, longitude: 86.92 },
  { train_id: '12842', train_name: 'Coromandel (Return)', current_station: 'BAM', zone: 'ECoR', route: 'MAS-HWH', stress_level: 'HIGH', speed: 110, delay_minutes: 28, latitude: 19.31, longitude: 84.79 },
  { train_id: '12301', train_name: 'Howrah Rajdhani', current_station: 'CNB', zone: 'NCR', route: 'HWH-NDLS', stress_level: 'HIGH', speed: 130, delay_minutes: 35, latitude: 26.45, longitude: 80.35 },
  { train_id: '12302', train_name: 'New Delhi Rajdhani', current_station: 'DDU', zone: 'ECR', route: 'NDLS-HWH', stress_level: 'MEDIUM', speed: 125, delay_minutes: 18, latitude: 25.28, longitude: 83.11 },
  { train_id: '12001', train_name: 'Bhopal Shatabdi', current_station: 'AGC', zone: 'NCR', route: 'NDLS-BPL', stress_level: 'MEDIUM', speed: 140, delay_minutes: 15, latitude: 27.18, longitude: 78.01 },
  { train_id: '12002', train_name: 'Bhopal Shatabdi Return', current_station: 'GWL', zone: 'NCR', route: 'BPL-NDLS', stress_level: 'STABLE', speed: 135, delay_minutes: 6, latitude: 26.22, longitude: 78.18 },
  { train_id: '12951', train_name: 'Mumbai Rajdhani', current_station: 'BRC', zone: 'WR', route: 'BOMBAY-NDLS', stress_level: 'STABLE', speed: 130, delay_minutes: 4, latitude: 22.31, longitude: 73.18 },
  { train_id: '12952', train_name: 'Mumbai Return', current_station: 'KOTA', zone: 'WCR', route: 'NDLS-BOMBAY', stress_level: 'LOW', speed: 122, delay_minutes: 12, latitude: 25.18, longitude: 75.83 },
  { train_id: '22691', train_name: 'Bangalore Rajdhani', current_station: 'NGP', zone: 'CR', route: 'NDLS-SBC', stress_level: 'STABLE', speed: 115, delay_minutes: 5, latitude: 21.15, longitude: 79.08 },
  { train_id: '22692', train_name: 'Bangalore Return', current_station: 'BPL', zone: 'WCR', route: 'SBC-NDLS', stress_level: 'LOW', speed: 118, delay_minutes: 9, latitude: 23.26, longitude: 77.41 },
  { train_id: '12622', train_name: 'Tamil Nadu Express', current_station: 'BZA', zone: 'SCR', route: 'NDLS-MAS', stress_level: 'MEDIUM', speed: 110, delay_minutes: 22, latitude: 16.51, longitude: 80.62 },
  { train_id: '12621', train_name: 'Tamil Nadu Return', current_station: 'BPQ', zone: 'CR', route: 'MAS-NDLS', stress_level: 'LOW', speed: 105, delay_minutes: 14, latitude: 19.92, longitude: 79.30 },
  { train_id: '12259', train_name: 'Sealdah Duronto', current_station: 'DHN', zone: 'ECR', route: 'HWH-NDLS', stress_level: 'STABLE', speed: 120, delay_minutes: 3, latitude: 23.80, longitude: 86.43 },
  { train_id: '12423', train_name: 'Dibrugarh Rajdhani', current_station: 'NJP', zone: 'NFR', route: 'NDLS-DBRG', stress_level: 'LOW', speed: 112, delay_minutes: 19, latitude: 26.68, longitude: 88.44 },
  { train_id: '12424', train_name: 'Dibrugarh Return', current_station: 'GHY', zone: 'NFR', route: 'DBRG-NDLS', stress_level: 'HIGH', speed: 95, delay_minutes: 48, latitude: 26.18, longitude: 91.75 },
  { train_id: '12345', train_name: 'Saraighat Express', current_station: 'MLDT', zone: 'ER', route: 'HWH-GHY', stress_level: 'STABLE', speed: 100, delay_minutes: 8, latitude: 25.01, longitude: 88.14 },
  { train_id: '12703', train_name: 'Falaknuma Express', current_station: 'VSKP', zone: 'ECoR', route: 'HWH-SC', stress_level: 'LOW', speed: 102, delay_minutes: 11, latitude: 17.72, longitude: 83.29 },
  { train_id: '12801', train_name: 'Purushottam Express', current_station: 'PRYJ', zone: 'NCR', route: 'PURI-NDLS', stress_level: 'MEDIUM', speed: 108, delay_minutes: 24, latitude: 25.44, longitude: 81.85 },
  { train_id: '12129', train_name: 'Azad Hind Express', current_station: 'BSL', zone: 'CR', route: 'PUNE-HWH', stress_level: 'STABLE', speed: 104, delay_minutes: 6, latitude: 21.05, longitude: 75.78 },
  { train_id: '12401', train_name: 'Magadh Express', current_station: 'ALJN', zone: 'NCR', route: 'NDLS-PNBE', stress_level: 'STABLE', speed: 110, delay_minutes: 7, latitude: 27.89, longitude: 78.08 },
  { train_id: '12559', train_name: 'Shiv Ganga Express', current_station: 'BSB', zone: 'NER', route: 'NDLS-BSB', stress_level: 'LOW', speed: 115, delay_minutes: 10, latitude: 25.32, longitude: 82.99 },
  { train_id: '18030', train_name: 'Shalimar Express', current_station: 'ROU', zone: 'SER', route: 'HWH-LTT', stress_level: 'MEDIUM', speed: 98, delay_minutes: 32, latitude: 22.23, longitude: 84.85 },
  { train_id: '22221', train_name: 'CSMT Rajdhani', current_station: 'JL', zone: 'CR', route: 'BOMBAY-NZM', stress_level: 'STABLE', speed: 125, delay_minutes: 4, latitude: 21.01, longitude: 75.56 },
  { train_id: '20503', train_name: 'NE Rajdhani Express', current_station: 'KIR', zone: 'NFR', route: 'NDLS-DBRG', stress_level: 'LOW', speed: 112, delay_minutes: 16, latitude: 25.54, longitude: 87.57 },
  { train_id: '12627', train_name: 'Karnataka Express', current_station: 'ET', zone: 'WCR', route: 'NDLS-SBC', stress_level: 'STABLE', speed: 110, delay_minutes: 5, latitude: 22.61, longitude: 77.76 },
  { train_id: '12864', train_name: 'Yesvantpur Express', current_station: 'KGP', zone: 'SER', route: 'HWH-YPR', stress_level: 'CRITICAL', speed: 85, delay_minutes: 62, latitude: 22.34, longitude: 87.32 },
];

// Rich Alert Buffer
const ALERTS = [
  {
    id: 'ALT-2024-901',
    alert_id: 'ALT-2024-901',
    train_id: '12841',
    train_name: 'Coromandel Express',
    station_code: 'BLS',
    station_name: 'Bahanaga Bazar / Balasore',
    zone: 'SER',
    severity: 'CRITICAL',
    risk_score: 0.96,
    bayesian_risk: 0.94,
    anomaly_score: 97.2,
    causal_risk: 0.92,
    signature_match_pct: 94,
    methods_voting: {
      'Bayesian Network': true,
      'Isolation Forest': true,
      'Causal DAG': true,
      'DBSCAN Trajectory': true,
    },
    votes: 4,
    timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
    explanation: 'Cross-locking Point 17A status mismatch with Green aspect. Causal chain matches CRS Balasore accident signature.',
    actions: ['Signal trip protocol initiated', 'Speed restriction: 30 km/h', 'Emergency dispatch to Bahanaga interlocking'],
    lat: 21.49,
    lng: 86.92,
  },
  {
    id: 'ALT-2024-902',
    alert_id: 'ALT-2024-902',
    train_id: '12864',
    train_name: 'Yesvantpur Express',
    station_code: 'KGP',
    station_name: 'Kharagpur Junction',
    zone: 'SER',
    severity: 'CRITICAL',
    risk_score: 0.89,
    bayesian_risk: 0.88,
    anomaly_score: 91.5,
    causal_risk: 0.85,
    signature_match_pct: 88,
    methods_voting: {
      'Bayesian Network': true,
      'Isolation Forest': true,
      'Causal DAG': true,
      'DBSCAN Trajectory': false,
    },
    votes: 3,
    timestamp: new Date(Date.now() - 9 * 60000).toISOString(),
    explanation: 'Section headway collapse on Down Main line; headway reduced below 180s safe buffer.',
    actions: ['Impose cautionary speed on Down line', 'Hold trailing rake at Hijli'],
    lat: 22.34,
    lng: 87.32,
  },
  {
    id: 'ALT-2024-903',
    alert_id: 'ALT-2024-903',
    train_id: '12424',
    train_name: 'Dibrugarh Return',
    station_code: 'GHY',
    station_name: 'Guwahati Junction',
    zone: 'NFR',
    severity: 'HIGH',
    risk_score: 0.82,
    bayesian_risk: 0.79,
    anomaly_score: 84.1,
    causal_risk: 0.81,
    signature_match_pct: 78,
    methods_voting: {
      'Bayesian Network': true,
      'Isolation Forest': true,
      'Causal DAG': false,
      'DBSCAN Trajectory': true,
    },
    votes: 3,
    timestamp: new Date(Date.now() - 17 * 60000).toISOString(),
    explanation: 'Speed deviation >3.8σ recorded on single-line gradient section with moisture alert.',
    actions: ['Issue cab advisory to pilot', 'Enable sander auto-actuation'],
    lat: 26.18,
    lng: 91.75,
  },
  {
    id: 'ALT-2024-904',
    alert_id: 'ALT-2024-904',
    train_id: '12301',
    train_name: 'Howrah Rajdhani',
    station_code: 'CNB',
    station_name: 'Kanpur Central',
    zone: 'NCR',
    severity: 'HIGH',
    risk_score: 0.78,
    bayesian_risk: 0.75,
    anomaly_score: 79.4,
    causal_risk: 0.76,
    signature_match_pct: 72,
    methods_voting: {
      'Bayesian Network': true,
      'Isolation Forest': false,
      'Causal DAG': true,
      'DBSCAN Trajectory': true,
    },
    votes: 3,
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    explanation: 'OHE overhead traction tension fluctuations exceeding 40% threshold during high-speed transit.',
    actions: ['Alert traction power controller (TPC)', 'Monitor pantograph current draw'],
    lat: 26.45,
    lng: 80.35,
  },
  {
    id: 'ALT-2024-905',
    alert_id: 'ALT-2024-905',
    train_id: '12842',
    train_name: 'Coromandel (Return)',
    station_code: 'BAM',
    station_name: 'Brahmapur',
    zone: 'ECoR',
    severity: 'HIGH',
    risk_score: 0.74,
    bayesian_risk: 0.71,
    anomaly_score: 75.0,
    causal_risk: 0.72,
    signature_match_pct: 69,
    methods_voting: {
      'Bayesian Network': true,
      'Isolation Forest': true,
      'Causal DAG': false,
      'DBSCAN Trajectory': false,
    },
    votes: 2,
    timestamp: new Date(Date.now() - 34 * 60000).toISOString(),
    explanation: 'Inter-station block section running time anomaly detected between BAM and IPM.',
    actions: ['Verify track occupancy circuits', 'Request station master confirmation'],
    lat: 19.31,
    lng: 84.79,
  },
  {
    id: 'ALT-2024-906',
    alert_id: 'ALT-2024-906',
    train_id: '12001',
    train_name: 'Bhopal Shatabdi',
    station_code: 'AGC',
    station_name: 'Agra Cantt',
    zone: 'NCR',
    severity: 'MEDIUM',
    risk_score: 0.65,
    bayesian_risk: 0.62,
    anomaly_score: 66.8,
    causal_risk: 0.61,
    signature_match_pct: 58,
    methods_voting: {
      'Bayesian Network': true,
      'Isolation Forest': false,
      'Causal DAG': true,
      'DBSCAN Trajectory': false,
    },
    votes: 2,
    timestamp: new Date(Date.now() - 48 * 60000).toISOString(),
    explanation: 'Junction platform occupancy conflict predicted within next 22 minutes.',
    actions: ['Reassign Platform 3 to Platform 5', 'Notify passenger information display system'],
    lat: 27.18,
    lng: 78.01,
  },
  {
    id: 'ALT-2024-907',
    alert_id: 'ALT-2024-907',
    train_id: '12622',
    train_name: 'Tamil Nadu Express',
    station_code: 'BZA',
    station_name: 'Vijayawada Jn',
    zone: 'SCR',
    severity: 'MEDIUM',
    risk_score: 0.58,
    bayesian_risk: 0.55,
    anomaly_score: 61.2,
    causal_risk: 0.54,
    signature_match_pct: 51,
    methods_voting: {
      'Bayesian Network': true,
      'Isolation Forest': false,
      'Causal DAG': true,
      'DBSCAN Trajectory': false,
    },
    votes: 2,
    timestamp: new Date(Date.now() - 65 * 60000).toISOString(),
    explanation: 'Axle box temperature sensor reading elevated by 8°C on Coach B4.',
    actions: ['Schedule roller bearing inspection at next halt', 'Alert hot axle box detector team'],
    lat: 16.51,
    lng: 80.62,
  },
  {
    id: 'ALT-2024-908',
    alert_id: 'ALT-2024-908',
    train_id: '12801',
    train_name: 'Purushottam Express',
    station_code: 'PRYJ',
    station_name: 'Prayagraj Jn',
    zone: 'NCR',
    severity: 'MEDIUM',
    risk_score: 0.52,
    bayesian_risk: 0.49,
    anomaly_score: 55.4,
    causal_risk: 0.50,
    signature_match_pct: 46,
    methods_voting: {
      'Bayesian Network': true,
      'Isolation Forest': true,
      'Causal DAG': false,
      'DBSCAN Trajectory': false,
    },
    votes: 2,
    timestamp: new Date(Date.now() - 82 * 60000).toISOString(),
    explanation: 'Signal overlap clearing delay exceeding nominal by 45 seconds.',
    actions: ['Acknowledge and monitor interlocking cycle'],
    lat: 25.44,
    lng: 81.85,
  },
  {
    id: 'ALT-2024-909',
    alert_id: 'ALT-2024-909',
    train_id: '12952',
    train_name: 'Mumbai Return',
    station_code: 'KOTA',
    station_name: 'Kota Jn',
    zone: 'WCR',
    severity: 'LOW',
    risk_score: 0.38,
    bayesian_risk: 0.35,
    anomaly_score: 41.0,
    causal_risk: 0.36,
    signature_match_pct: 32,
    methods_voting: {
      'Bayesian Network': true,
      'Isolation Forest': false,
      'Causal DAG': false,
      'DBSCAN Trajectory': false,
    },
    votes: 1,
    timestamp: new Date(Date.now() - 110 * 60000).toISOString(),
    explanation: 'Minor speed variation due to ongoing permanent way maintenance speed restriction.',
    actions: ['Standard PSR acknowledged'],
    lat: 25.18,
    lng: 75.83,
  },
  {
    id: 'ALT-2024-910',
    alert_id: 'ALT-2024-910',
    train_id: '12423',
    train_name: 'Dibrugarh Rajdhani',
    station_code: 'NJP',
    station_name: 'New Jalpaiguri',
    zone: 'NFR',
    severity: 'LOW',
    risk_score: 0.32,
    bayesian_risk: 0.30,
    anomaly_score: 34.5,
    causal_risk: 0.28,
    signature_match_pct: 28,
    methods_voting: {
      'Bayesian Network': false,
      'Isolation Forest': true,
      'Causal DAG': false,
      'DBSCAN Trajectory': false,
    },
    votes: 1,
    timestamp: new Date(Date.now() - 135 * 60000).toISOString(),
    explanation: 'Routine dwell time extension at water servicing stop.',
    actions: ['Status normal'],
    lat: 26.68,
    lng: 88.44,
  },
];

const DECISIONS = ALERTS.map((a, i) => {
  const votes = a.votes || 2;
  return {
    alert_id: a.id,
    train_id: a.train_id,
    train_name: a.train_name,
    station: a.station_name || a.station_code,
    severity: a.severity,
    risk_score: a.risk_score,
    ensemble_votes: votes,
    model_contributions: {
      'Bayesian Network': { vote: !!a.methods_voting['Bayesian Network'], weight: 0.35, confidence: a.bayesian_risk },
      'Isolation Forest': { vote: !!a.methods_voting['Isolation Forest'], weight: 0.25, confidence: Math.round(a.anomaly_score) / 100 },
      'Causal DAG': { vote: !!a.methods_voting['Causal DAG'], weight: 0.25, confidence: a.causal_risk },
      'DBSCAN Trajectory': { vote: !!a.methods_voting['DBSCAN Trajectory'], weight: 0.15, confidence: (a.signature_match_pct || 50) / 100 },
    },
    final_decision: {
      recommendation: votes >= 2 ? 'ALERT' : 'MONITOR',
      confidence: Math.round((votes / 4) * 100),
      reasoning: `${votes} of 4 AI models flagged this junction as elevated risk`,
    },
    timestamp: a.timestamp,
  };
});

// Create HTTP server
const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  const sendJSON = (data, status = 200) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  // Route Handling
  if (pathname === '/api/health' || pathname === '/health') {
    return sendJSON({
      status: 'ok',
      database: 'ok',
      websocket_connections: activeWebSockets.size,
      nodes_watched: 51,
      trains_monitored: TRAINS.length,
      bayesian_network: true,
      cascade_engine: true,
      modules: {
        cascade_visualization: 'operational',
        alert_reasoning: 'operational',
        ml_inference: 'operational',
        data_ingestion: 'operational',
      },
      timestamp: new Date().toISOString(),
    });
  }

  if (pathname === '/api/stats') {
    const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, STABLE: 0 };
    TRAINS.forEach(t => {
      counts[t.stress_level] = (counts[t.stress_level] || 0) + 1;
    });
    return sendJSON({
      total: TRAINS.length,
      critical: counts.CRITICAL,
      high: counts.HIGH,
      medium: counts.MEDIUM,
      low: counts.LOW,
      stable: counts.STABLE,
      trains_monitored: TRAINS.length,
      nodes_watched: 51,
      batches_processed: 1420,
      uptime_seconds: 7200,
      alert_critical: ALERTS.filter(a => a.severity === 'CRITICAL').length,
      alert_total: ALERTS.length,
      timestamp: new Date().toISOString(),
    });
  }

  if (pathname === '/api/trains/current') {
    return sendJSON(TRAINS);
  }

  if (pathname.startsWith('/api/trains/') && pathname.endsWith('/current')) {
    const parts = pathname.split('/');
    const trainId = parts[3];
    const train = TRAINS.find(t => t.train_id === trainId) || TRAINS[0];
    return sendJSON({
      ...train,
      latest_telemetry: {
        station_code: train.current_station,
        speed_kmh: train.speed,
        delay_minutes: train.delay_minutes,
        latitude: train.latitude,
        longitude: train.longitude,
        timestamp_utc: new Date().toISOString(),
      },
    });
  }

  if (pathname.startsWith('/api/trains/') && pathname.endsWith('/history')) {
    const parts = pathname.split('/');
    const trainId = parts[3];
    const train = TRAINS.find(t => t.train_id === trainId) || TRAINS[0];
    const now = Date.now();
    const history = [];
    for (let i = 24; i >= 0; i--) {
      history.push({
        timestamp_utc: new Date(now - i * 3600000).toISOString(),
        station_code: train.current_station,
        speed_kmh: Math.max(0, train.speed + Math.floor(Math.sin(i) * 20)),
        delay_minutes: Math.max(0, train.delay_minutes + Math.floor(Math.cos(i) * 10)),
        stress_score: train.stress_level === 'CRITICAL' ? 0.9 : 0.3,
        latitude: train.latitude + (i * 0.05),
        longitude: train.longitude + (i * 0.05),
      });
    }
    return sendJSON({ telemetry: history });
  }

  if (pathname === '/api/trains/ingestion/summary') {
    return sendJSON({
      total_records: {
        received: 128450,
        valid: 127920,
        persisted: 127920,
      },
      by_source: {
        NTES: 63960,
        real_time: 63960,
      },
      ingestion_rate: '100+ records/sec',
      valid_rate: 99.6,
      error_rate: 0.4,
      timestamp: new Date().toISOString(),
    });
  }

  if (pathname === '/api/trains/coverage/zones') {
    const counts = {};
    TRAINS.forEach(t => {
      counts[t.zone] = (counts[t.zone] || 0) + 1;
    });
    return sendJSON({
      by_zone: Object.entries(counts).map(([zone, count]) => ({ zone, train_count: count })),
    });
  }

  if (pathname === '/api/alerts/history') {
    const limit = parseInt(parsedUrl.query.limit || '50', 10);
    return sendJSON({
      alerts: ALERTS.slice(0, limit),
      total: ALERTS.length,
    });
  }

  if (pathname.startsWith('/api/alerts/reasoning/')) {
    const id = pathname.split('/').pop();
    const alert = ALERTS.find(a => a.id === id) || ALERTS[0];
    return sendJSON({
      alert_id: alert.id,
      train_id: alert.train_id,
      explanation: alert.explanation,
      methods_voting: alert.methods_voting,
      risk_score: alert.risk_score,
      actions: alert.actions,
      timestamp: alert.timestamp,
    });
  }

  if (pathname === '/api/ai/decisions') {
    const limit = parseInt(parsedUrl.query.limit || '30', 10);
    return sendJSON({
      decisions: DECISIONS.slice(0, limit),
      total: DECISIONS.length,
      timestamp: new Date().toISOString(),
    });
  }

  if (pathname === '/api/pilot/live-trains') {
    return sendJSON(TRAINS);
  }

  if (pathname === '/api/network/nodes' || pathname === '/api/network-nodes') {
    const nodes = (networkGraph.graph?.nodes || []).map(n => ({
      id: n.id,
      name: n.name,
      zone: n.zone,
      latitude: n.lat,
      longitude: n.lng,
      stress_level: n.stress_level || 'STABLE',
      trains_present: Math.floor(Math.random() * 4),
    }));
    return sendJSON({ nodes, total: nodes.length });
  }

  if (pathname === '/api/cascade/network-topology' || pathname === '/api/network/pulse') {
    return sendJSON(networkGraph.graph || { nodes: [], links: [] });
  }

  if (pathname === '/api/dashboard/summary') {
    return sendJSON({
      network_status: {
        zones_monitored: 16,
        junctions: 51,
        trains_tracked: TRAINS.length,
        stations: 412,
      },
      real_time_metrics: {
        alerts_active: ALERTS.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length,
        cascades_detected: 1,
        anomalies_flagged: 47,
        predictions_active: 12,
      },
      health: {
        average_delay: 24.5,
        on_time_percentage: 82.4,
        critical_trains: TRAINS.filter(t => t.stress_level === 'CRITICAL').length,
        stranded_passengers: 1250,
      },
      capacity: {
        network_utilization: '68%',
        peak_junction: 'NDLS (92% utilization)',
        available_capacity: '12 additional hourly trains',
      },
      intelligence: {
        last_cascade_prediction: '14 minutes ago',
        ml_accuracy: {
          cascade_detection: '98%',
          delay_prediction: '87%',
          incident_classification: '94%',
        },
      },
    });
  }

  if (pathname === '/api/dashboard/operations') {
    return sendJSON({
      urgent_actions: [
        {
          priority: 'CRITICAL',
          action: 'Cascade Response Protocol Active',
          location: 'BLS / Bahanaga Section',
          status: 'In Progress',
          eta_resolution: '25 minutes',
        },
        {
          priority: 'WARNING',
          action: 'Investigate Headway Compression',
          location: 'KGP-HIJLI Corridor',
          status: 'Acknowledged',
          eta_resolution: '15 minutes',
        },
      ],
      next_predicted_incidents: [
        {
          time: 'Next 30 min',
          location: 'Howrah Junction',
          type: 'Congestion Cascade',
          severity: 'HIGH',
          confidence: '86%',
        },
      ],
      zone_status: [
        { zone: 'SER', status: 'CRITICAL', trains_affected: 3 },
        { zone: 'NCR', status: 'HIGH', trains_affected: 2 },
        { zone: 'ER', status: 'WARNING', trains_affected: 1 },
        { zone: 'NR', status: 'NORMAL', trains_affected: 0 },
        { zone: 'WR', status: 'NORMAL', trains_affected: 0 },
      ],
    });
  }

  if (pathname === '/api/dashboard/ml-insights') {
    return sendJSON({
      isolation_forest: {
        anomalies_detected: 47,
        confidence_mean: 0.92,
        top_anomalies: [
          { train: '12841', anomaly_score: 0.97, reason: 'Point state vs route mismatch' },
          { train: '12864', anomaly_score: 0.92, reason: 'Severe headway collapse' },
        ],
      },
      cascade_simulator: {
        active_cascades: 1,
        source: 'BLS',
        affected_junctions: 4,
        predicted_duration: '1.2 hours',
        severity_trend: 'stabilizing',
      },
      bayesian_engine: {
        inference_latency_ms: 18,
        active_hypotheses: 5,
        top_root_cause: 'Point Machine Interlocking Logic Discrepancy (P=0.94)',
      },
    });
  }

  if (pathname === '/api/cascade/analyze') {
    const source = parsedUrl.query.source_junction || 'BLS';
    return sendJSON({
      source_junction: source,
      initial_delay_minutes: parseInt(parsedUrl.query.initial_delay || '60', 10),
      cascade_hops: [
        { hop: 0, junction: source, delay: 60, status: 'SOURCE' },
        { hop: 1, junction: 'BAM', delay: 42, status: 'HIGH_RISK' },
        { hop: 1, junction: 'KGP', delay: 38, status: 'HIGH_RISK' },
        { hop: 2, junction: 'HWH', delay: 25, status: 'MEDIUM_RISK' },
      ],
      mitigation_recommendation: 'Enact dynamic headway regulation at Kharagpur to absorb downstream buffer.',
    });
  }

  if (pathname === '/api/inference/predict' || pathname === '/api/inference/batch') {
    return sendJSON({
      status: 'success',
      predictions: [
        {
          train_id: '12841',
          accident_probability: 0.08,
          delay_prediction_minutes: 45,
          recommended_speed_kmh: 30,
          confidence: 0.94,
        },
      ],
      inference_time_ms: 22,
    });
  }

  // Fallback for any unknown /api endpoint
  if (pathname.startsWith('/api/')) {
    return sendJSON({ message: 'OK', path: pathname, timestamp: new Date().toISOString() });
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// WebSocket Server (RFC 6455 Handshake)
const activeWebSockets = new Set();

server.on('upgrade', (req, socket) => {
  const parsed = url.parse(req.url);
  if (parsed.pathname === '/ws' || parsed.pathname === '/ws/telemetry') {
    const key = req.headers['sec-websocket-key'];
    if (!key) {
      socket.destroy();
      return;
    }
    const hash = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    socket.write(
      'HTTP/1.1 101 Switching Protocols\r\n' +
      'Upgrade: websocket\r\n' +
      'Connection: Upgrade\r\n' +
      `Sec-WebSocket-Accept: ${hash}\r\n\r\n`
    );

    activeWebSockets.add(socket);

    const sendFrame = (obj) => {
      try {
        const payload = Buffer.from(JSON.stringify(obj));
        const len = payload.length;
        let header;
        if (len < 126) {
          header = Buffer.alloc(2);
          header[0] = 0x81;
          header[1] = len;
        } else if (len < 65536) {
          header = Buffer.alloc(4);
          header[0] = 0x81;
          header[1] = 126;
          header.writeUInt16BE(len, 2);
        } else {
          header = Buffer.alloc(10);
          header[0] = 0x81;
          header[1] = 127;
          header.writeBigUInt64BE(BigInt(len), 2);
        }
        socket.write(Buffer.concat([header, payload]));
      } catch (e) {
        socket.destroy();
        activeWebSockets.delete(socket);
      }
    };

    // Initial greeting frame
    sendFrame({
      type: 'connection_established',
      client_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    });

    const interval = setInterval(() => {
      // Pick a random train to twitch speed
      const t = TRAINS[Math.floor(Math.random() * TRAINS.length)];
      sendFrame({
        type: 'telemetry_stream',
        trains_updated: TRAINS.length,
        sample_train: {
          id: t.train_id,
          name: t.train_name,
          speed: t.speed + Math.floor(Math.random() * 5 - 2),
          station: t.current_station,
        },
        alerts_active: ALERTS.filter(a => a.severity === 'CRITICAL').length,
        timestamp: new Date().toISOString(),
      });
    }, 2500);

    socket.on('close', () => {
      clearInterval(interval);
      activeWebSockets.delete(socket);
    });

    socket.on('error', () => {
      clearInterval(interval);
      activeWebSockets.delete(socket);
    });
  } else {
    socket.destroy();
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🚂 DRISHTI Mock API & Intelligence Server running at http://127.0.0.1:${PORT}`);
  console.log(`⚡ WebSocket Stream ready at ws://127.0.0.1:${PORT}/ws/telemetry`);
});

