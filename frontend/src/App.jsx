import { useState, useEffect, useRef } from "react";

const ALL_ZONES = Intl.supportedValuesOf("timeZone");
const USER_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
const NOW = new Date();

export default function App() {
  const [hour, setHour] = useState(NOW.getHours());
  const [minute, setMinute] = useState(NOW.getMinutes());
  const [zones, setZones] = useState([
    "Europe/London",
    "Asia/Tokyo",
    "Asia/Kolkata",
  ]);

  const [zonesData, setZonesData] = useState([]);
  const [bestHour, setBestHour] = useState(null);
  const debounceRef = useRef(null);

  const isNight = hour < 7;
  const isMobile = window.innerWidth < 640;

  async function fetchTimes(h, m, z = zones) {
    const res = await fetch(
      "https://timezone-humanizer.onrender.com/convert-time",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
          base_zone: USER_ZONE,
          zones: z,
        }),
      }
    );
    return await res.json();
  }

  function isSleeping(localTime) {
    return parseInt(localTime.split(":")[0]) < 7;
  }

  async function updateTimes(h, m, z = zones) {
    const data = await fetchTimes(h, m, z);

    const enriched = data.map((x) => ({
      ...x,
      is_sleep: isSleeping(x.local_time),
    }));

    setZonesData(enriched);

    for (let i = 0; i < 24; i++) {
      const test = await fetchTimes(i, 0, z);
      if (!test.some((t) => isSleeping(t.local_time))) {
        setBestHour(i);
        break;
      }
    }
  }

  useEffect(() => {
    updateTimes(hour, minute, zones);
  }, []);

  function onTimeChange(h, m) {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateTimes(h, m), 250);
  }

  function changeZone(i, val) {
    const copy = [...zones];
    copy[i] = val;
    setZones(copy);
    updateTimes(hour, minute, copy);
  }

  function icon(time, sleep) {
    const h = parseInt(time.split(":")[0]);
    if (sleep) return "🌙";
    if (h >= 6 && h < 18) return "☀️";
    return "🌙";
  }

  return (
    <div
      style={{
        ...styles.page,
        background: isNight
          ? "linear-gradient(180deg,#0f172a,#020617)"
          : "linear-gradient(180deg,#f5f7ff,#eef2ff)",
      }}
    >
      <div style={styles.container}>
        <h1>Time-Zone Humanizer</h1>

        <p style={styles.intro}>
          A visual way to find meeting-friendly time windows across global teams.
        </p>

        <label>Hour</label>
        <input
          type="range"
          min="0"
          max="23"
          value={hour}
          onChange={(e) => {
            const h = Number(e.target.value);
            setHour(h);
            onTimeChange(h, minute);
          }}
          style={{ width: "100%" }}
        />

        <label style={{ marginTop: 10, display: "block" }}>Minutes</label>
        <input
          type="range"
          min="0"
          max="59"
          value={minute}
          onChange={(e) => {
            const m = Number(e.target.value);
            setMinute(m);
            onTimeChange(hour, m);
          }}
          style={{ width: "100%" }}
        />

        <div style={{ marginTop: 10 }}>
          {String(hour).padStart(2, "0")}:
          {String(minute).padStart(2, "0")} — Your time ({USER_ZONE})
        </div>

        {bestHour !== null && (
          <div style={styles.bestTime}>
            ⭐ Suggested meeting hour: {bestHour}:00
          </div>
        )}

        <div
          style={{
            ...styles.cards,
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
          }}
        >
          {zonesData.map((z, i) => (
            <div key={i} style={styles.card}>
              <select
                value={zones[i]}
                onChange={(e) => changeZone(i, e.target.value)}
                style={styles.select}
              >
                {ALL_ZONES.map((zone) => (
                  <option key={zone}>{zone}</option>
                ))}
              </select>

              <div style={styles.cardTime}>
                {z.local_time} {icon(z.local_time, z.is_sleep)}
              </div>

              <div style={{ color: z.is_sleep ? "#dc2626" : "#16a34a" }}>
                {z.is_sleep ? "Sleeping" : "Available"}
              </div>
            </div>
          ))}
        </div>

        <hr style={{ margin: "30px 0" }} />

        <h3>How it works</h3>
        <p>Select a time → see global availability → pick the green window.</p>

        <h3>Use cases</h3>
        <ul>
          <li>Remote standups</li>
          <li>Client calls</li>
          <li>International interviews</li>
        </ul>

        <h3>Features</h3>
        <ul>
          <li>Live timezone conversion</li>
          <li>Sleep detection</li>
          <li>Best meeting suggestion</li>
        </ul>

        <div style={styles.footer}>
          Built by Tarun Kumar ·{" "}
          <a
            href="https://github.com/tarunkumar-ds/Timezone-Humanizer"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    fontFamily: "system-ui",
  },

  container: {
    width: "100%",
    maxWidth: 900,
    background: "white",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 20px 40px rgba(0,0,0,.12)",
  },

  intro: {
    color: "#555",
    marginBottom: 16,
  },

  bestTime: {
    marginTop: 10,
    background: "#eef2ff",
    padding: 10,
    borderRadius: 8,
  },

  cards: {
    marginTop: 20,
    display: "grid",
    gap: 12,
  },

  card: {
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 14,
  },

  select: {
    width: "100%",
    padding: 6,
    marginBottom: 10,
  },

  cardTime: {
    fontSize: 22,
    fontWeight: 600,
  },

  footer: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 12,
    color: "#777",
  },
};
