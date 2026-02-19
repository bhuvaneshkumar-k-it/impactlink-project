import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapUpdater({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  map.invalidateSize(); 
  return null;
}

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({ click(e) { onLocationSelect(e.latlng.lat, e.latlng.lng); } });
  return null;
}

const Typewriter = ({ text }) => {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    if (!text) return;
    let index = 0;
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index === text.length) clearInterval(timer);
    }, 15);
    return () => clearInterval(timer);
  }, [text]);
  return <p className="text-gray-700 mb-2 font-mono text-xs leading-relaxed">{displayedText}</p>;
};

const Dashboard = () => {
  const [view, setView] = useState('input'); 
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [notification, setNotification] = useState(null);
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const [formData, setFormData] = useState({
    name: "Transgender Garment School",
    description: "Vocational training for handicapped and transgender youth.",
    target: "Disabled Youth",
    lat: "13.0827",
    lng: "80.2707",
    sdg: "8.5"
  });

  useEffect(() => {
    axios.get('http://localhost:8080/api/projects').then(res => setProjects(res.data)).catch(console.error);
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const runScan = (latInput, lngInput) => {
    setView('scanning');
    setAiInsight(null);
    setLoadingAi(false);
    
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    setFormData(prev => ({ ...prev, lat: lat.toFixed(4), lng: lng.toFixed(4) }));

    setTimeout(() => {
      setView('map');
      const inputPayload = {
          name: formData.name,
          description: formData.description,
          beneficiaryTarget: formData.target,
          latitude: lat,
          longitude: lng,
          sdgTargets: [formData.sdg]
      };

      axios.post('http://localhost:8080/api/projects/check-conflict', inputPayload)
        .then(res => {
             setSelectedProject({ ...inputPayload, id: 999 });
             setDuplicates(res.data);
             if (res.data.length > 0) generateAiReport(res.data[0].projectName);
        })
        .catch(() => { setSelectedProject({ ...inputPayload, id: 999 }); setDuplicates([]); });
    }, 1500);
  };

  const generateAiReport = (partnerName) => {
    setLoadingAi(true);
    axios.get(`http://localhost:8080/api/projects/analyze`, { params: { projectA: formData.name, projectB: partnerName } })
    .then(res => {
        setAiInsight({ partner: partnerName, synergy: res.data.synergy, actions: res.data.actions });
        setLoadingAi(false);
    });
  };

  const handleConnect = (name) => {
    setNotification(`🚀 Request sent to ${name}! (+5 Reputation Points)`);
    setTimeout(() => setNotification(null), 4000);
  };

  if (view === 'input') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 font-sans text-white">
        <div className="bg-gray-800 p-10 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold text-blue-400 mb-2">ImpactLink AI</h1>
            <p className="text-gray-400">Global Coordination Radar for SDGs.</p>
          </div>
          <div className="space-y-5">
            <input name="name" value={formData.name} onChange={handleChange} className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="Project Name"/>
            <textarea name="description" rows="2" value={formData.description} onChange={handleChange} className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="Description"/>
            <button onClick={() => runScan(formData.lat, formData.lng)} className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-lg text-lg shadow-lg">🚀 Initialize Scan</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'scanning') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-blue-400">
        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-blue-500 mb-6"></div>
        <h2 className="text-3xl font-mono animate-pulse mt-8">SCANNING ECOSYSTEM...</h2>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans bg-gray-100">
      {notification && <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-[2000] bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold animate-bounce">✨ {notification}</div>}
      <div className="flex-grow h-full relative z-0">
        <MapContainer center={[parseFloat(formData.lat), parseFloat(formData.lng)]} zoom={13} className="h-full w-full">
          <MapClickHandler onLocationSelect={runScan} />
          <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          <MapUpdater center={[parseFloat(formData.lat), parseFloat(formData.lng)]} zoom={13} />
          {projects.map(p => <Marker key={p.id} position={[p.latitude, p.longitude]}><Popup>{p.name}</Popup></Marker>)}
          <Marker position={[parseFloat(formData.lat), parseFloat(formData.lng)]} icon={new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] })}><Popup><b>📍 Your Proposal</b></Popup></Marker>
          {duplicates.length > 0 && projects.find(p => p.name === duplicates[0].projectName) && (
            <>
              <Circle center={[parseFloat(formData.lat), parseFloat(formData.lng)]} radius={1000} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1, dashArray: '10, 10' }} />
              <Polyline positions={[[parseFloat(formData.lat), parseFloat(formData.lng)], [projects.find(p => p.name === duplicates[0].projectName).latitude, projects.find(p => p.name === duplicates[0].projectName).longitude]]} pathOptions={{ color: 'red', weight: 4, dashArray: '10, 10', opacity: 0.7 }} />
            </>
          )}
        </MapContainer>
      </div>
      <div className="w-96 h-full bg-white p-6 overflow-y-auto shadow-2xl z-10 flex-shrink-0 border-l border-gray-300">
        <div className="flex items-center gap-2 mb-6"><div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div><h1 className="text-xl font-bold text-gray-800">ImpactLink AI Radar</h1></div>
        {duplicates.length > 0 ? (
          <div>
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6"><div className="flex items-center gap-2 text-red-700 font-bold mb-1"><span>⚠️</span> Conflict Detected</div><p className="text-xs text-red-600">Similar initiative found nearby.</p></div>
            <div className="space-y-4">
              {duplicates.map((partner, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 ring-1 ring-black/5">
                  <div className="flex justify-between items-start mb-3"><h4 className="font-bold text-gray-900 text-lg">{partner.projectName}</h4><span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">{partner.duplicationScore}% Match</span></div>
                  <div className="mt-3 bg-purple-50 p-3 rounded-lg border border-purple-200 animate-fade-in"><div className="flex items-center gap-2 mb-2"><span className="animate-pulse">🤖</span><p className="text-xs font-bold text-purple-900">AI Synergy Analysis</p></div>{loadingAi ? (<div className="flex items-center gap-2 text-xs text-purple-600"><span className="animate-spin">🌀</span>Processing...</div>) : (aiInsight && aiInsight.partner === partner.projectName && (<><Typewriter text={aiInsight.synergy} /><ul className="list-disc list-inside text-xs text-gray-600 mt-2 space-y-1">{aiInsight.actions.map((act, i) => <li key={i}>{act}</li>)}</ul></>))}</div>
                  <button onClick={() => handleConnect(partner.projectName)} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow transition-all active:scale-95">Connect & Merge</button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-green-50 p-6 rounded-xl text-center border border-green-200"><div className="text-5xl mb-3">✅</div><h3 className="font-bold text-green-800">Green Light</h3><p className="text-green-700 text-sm mt-1">This zone is underserved.</p></div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
