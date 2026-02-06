import { useState, useEffect } from "react";

const USER_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

export default function App() {
  const now = new Date();
  const defaultTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  const [time, setTime] = useState(defaultTime);
  const [countries, setCountries] = useState([]);
  const [zones, setZones] = useState([]);
  const [zonesData, setZonesData] = useState([]);
  const [bestHour, setBestHour] = useState(null);

  const hour = parseInt(time.split(":")[0]);
  const isNight = hour < 7;

  // Load ALL countries + capitals + timezones
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then((r) => r.json())
      .then((data) => {
        const cleaned = data
          .filter((c) => c.timezones && c.capital)
          .map((c) => ({
            name: c.name.common,
            capital: c.capital?.[0],
            flag: c.flag,
            zone: c.timezones[0].replace("UTC", "Etc/GMT"),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(cleaned);
        setZones(cleaned.slice(0, 3).map((c) => c.zone));
      });
  }, []);

  async function fetchTimes(t, z) {
    const res = await fetch(
      "https://timezone-humanizer.onrender.com/convert-time",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_time: t,
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

  async function updateTimes(t, z = zones) {
    const data = await fetchTimes(t, z);

    const enriched = data.map((x) => ({
      ...x,
      is_sleep: isSleeping(x.local_time),
    }));

    setZonesData(enriched);

    for (let i = 0; i < 24; i++) {
      const test = await fetchTimes(`${String(i).padStart(2, "0")}:00`, z);
      if (!test.some((t) => isSleeping(t.local_time))) {
        setBestHour(i);
        break;
      }
    }
  }

  useEffect(() => {
    if (zones.length) updateTimes(time, zones);
  }, [zones]);

  function changeZone(i, val) {
    const copy = [...zones];
    copy[i] = val;
    setZones(copy);
    updateTimes(time, copy);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isNight
          ? "linear-gradient(180deg,#0f172a,#020617)"
          : "linear-gradient(180deg,#f5f7ff,#eef2ff)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 12,
        fontFamily: "system-ui",
      }}
    >
      <div style={styles.container}>
        <h2>Time-Zone Humanizer</h2>

        <p style={{ color: "#555" }}>
          Enter your time and compare with any country instantly.
        </p>

        <input
          type="time"
          value={time}
          onChange={(e) => {
            setTime(e.target.value);
            updateTimes(e.target.value);
          }}
          style={styles.timeInput}
        />

        {bestHour !== null && (
          <div style={styles.best}>⭐ Best meeting hour: {bestHour}:00</div>
        )}

        {zonesData.length === 0 && <div>Loading countries…</div>}

        {zonesData.map((z, i) => (
          <div key={i} style={styles.card}>
            <select
              value={zones[i]}
              onChange={(e) => changeZone(i, e.target.value)}
              style={styles.select}
            >
              {countries.map((c) => (
                <option key={c.zone} value={c.zone}>
                  {c.flag} {c.name} — {c.capital}
                </option>
              ))}
            </select>

            <div style={styles.time}>{z.local_time}</div>

            <div style={{ color: z.is_sleep ? "#dc2626" : "#16a34a" }}>
              {z.is_sleep ? "Sleeping 🌙" : "Available ☀️"}
            </div>
          </div>
        ))}

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
  container: {
    width: "100%",
    maxWidth: 420,
    background: "white",
    borderRadius: 14,
    padding: 20,
    boxShadow: "0 15px 35px rgba(0,0,0,.15)",
  },

  timeInput: {
    width: "100%",
    padding: 10,
    fontSize: 16,
    marginTop: 10,
  },

  best: {
    marginTop: 10,
    background: "#eef2ff",
    padding: 8,
    borderRadius: 6,
    fontSize: 13,
  },

  card: {
    marginTop: 15,
    border: "1px solid #eee",
    borderRadius: 10,
    padding: 12,
  },

  select: {
    width: "100%",
    marginBottom: 8,
  },

  time: {
    fontSize: 22,
    fontWeight: 600,
  },

  footer: {
    marginTop: 25,
    textAlign: "center",
    fontSize: 12,
    color: "#777",
  },
};
