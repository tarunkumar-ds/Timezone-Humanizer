import { useState, useEffect } from "react";

const USER_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

const COUNTRIES = [
  { name: "United States", city: "New York", zone: "America/New_York" },
  { name: "United states", city: "Chicago", zone: "America/Chicago" },
  
  { name: "United states", city:"Denver", zone: "America/Denver" },
  { name: "United states", city: "Los Angeles", zone: "America/Los_Angeles" },

  { name: "United Kingdom", city: "London", zone: "Europe/London" },
  { name: "India", city: "Delhi", zone: "Asia/Kolkata" },
  { name: "Japan", city: "Tokyo", zone: "Asia/Tokyo" },
  { name: "Germany", city: "Berlin", zone: "Europe/Berlin" },
  { name: "France", city: "Paris", zone: "Europe/Paris" },
  { name: "Canada", city: "Toronto", zone: "America/Toronto" },
  { name: "Canada", city: "Vancouver", zone: "America/Vancouver" },
  { name: "Brazil", city: "São Paulo", zone: "America/Sao_Paulo" },
  { name: "Brazil", city: "Manaus", zone: "America/Manaus" },
  { name: "Australia", city: "Sydney", zone: "Australia/Sydney" },
  { name: "Australia", city: "Perth", zone: "Australia/Perth" },
  { name: "China", city: "Beijing", zone: "Asia/Shanghai" },
  { name: "Russia", city: "Moscow", zone: "Europe/Moscow" },
  { name: "South Korea", city: "Seoul", zone: "Asia/Seoul" },
  { name: "Singapore", city: "Singapore", zone: "Asia/Singapore" },
  { name: "UAE", city: "Dubai", zone: "Asia/Dubai" },
  { name: "Italy", city: "Rome", zone: "Europe/Rome" },
  { name: "Spain", city: "Madrid", zone: "Europe/Madrid" },
  { name: "Netherlands", city: "Amsterdam", zone: "Europe/Amsterdam" },
  { name: "Sweden", city: "Stockholm", zone: "Europe/Stockholm" },
  { name: "Norway", city: "Oslo", zone: "Europe/Oslo" },
  { name: "Switzerland", city: "Zurich", zone: "Europe/Zurich" },
  { name: "Mexico", city: "Mexico City", zone: "America/Mexico_City" },
  { name: "Argentina", city: "Buenos Aires", zone: "America/Argentina/Buenos_Aires" },
  { name: "Chile", city: "Santiago", zone: "America/Santiago" },
  { name: "Colombia", city: "Bogotá", zone: "America/Bogota" },
  { name: "Peru", city: "Lima", zone: "America/Lima" },
  { name: "South Africa", city: "Cape Town", zone: "Africa/Johannesburg" },
  { name: "Egypt", city: "Cairo", zone: "Africa/Cairo" },
  { name: "Nigeria", city: "Lagos", zone: "Africa/Lagos" },
  { name: "Kenya", city: "Nairobi", zone: "Africa/Nairobi" },
  { name: "Thailand", city: "Bangkok", zone: "Asia/Bangkok" },
  { name: "Vietnam", city: "Ho Chi Minh", zone: "Asia/Ho_Chi_Minh" },
  { name: "Indonesia", city: "Jakarta", zone: "Asia/Jakarta" },
  { name: "Malaysia", city: "Kuala Lumpur", zone: "Asia/Kuala_Lumpur" },
  { name: "Philippines", city: "Manila", zone: "Asia/Manila" },
  { name: "Pakistan", city: "Karachi", zone: "Asia/Karachi" },
  { name: "Bangladesh", city: "Dhaka", zone: "Asia/Dhaka" },
  { name: "Sri Lanka", city: "Colombo", zone: "Asia/Colombo" },
  { name: "Nepal", city: "Kathmandu", zone: "Asia/Kathmandu" },
  { name: "Turkey", city: "Istanbul", zone: "Europe/Istanbul" },
  { name: "Israel", city: "Tel Aviv", zone: "Asia/Jerusalem" },
  { name: "Saudi Arabia", city: "Riyadh", zone: "Asia/Riyadh" },
  { name: "Qatar", city: "Doha", zone: "Asia/Qatar" },
  { name: "New Zealand", city: "Auckland", zone: "Pacific/Auckland" }
];


export default function App() {
  const now = new Date();
  const defaultTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  const [time, setTime] = useState(defaultTime);
  const [zones, setZones] = useState([
    COUNTRIES[0],
    COUNTRIES[1],
    COUNTRIES[2],
  ]);

  const [zonesData, setZonesData] = useState([]);
  const [bestHour, setBestHour] = useState(null);

  const hour = parseInt(time.split(":")[0]);
  const isNight = hour < 7;

  async function fetchTimes(t, z) {
    const res = await fetch(
      "https://timezone-humanizer.onrender.com/convert-time",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_time: t,
          base_zone: USER_ZONE,
          zones: z.map(c => c.zone),

        }),
      }
    );

    return await res.json();
  }

  function isSleeping(localTime) {
    const h = parseInt(localTime.split(":")[0]);
    return h >= 23 || h < 7;
  }


  async function updateTimes(h, m, z = zones) {
    const data = await fetchTimes(h, m, z);
    const enriched = data.map((x) => ({
      ...x,
      is_sleep: isSleeping(x.local_time),
   }));
    setZonesData(enriched);
    let best = null;
    let bestScore = -1;
    for (let i = 0; i < 24; i++) {
      const testHour = (h + i) % 24;
      const test = await fetchTimes(testHour, 0, z);
      const awakeCount = test.filter(
        (t) => !isSleeping(t.local_time)
      ).length;
      if (awakeCount > bestScore) {
        bestScore = awakeCount;
        best = testHour;
      }
    }

setBestHour(best);

    }

    if (!found) {
      setBestHour(null);
    }

  }


  

  useEffect(() => {
    updateTimes(time, zones);
  }, []);

  function changeZone(i, country) 
 {
    const copy = [...zones];
    copy[i] = country;
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

        <input
          type="time"
          value={time}
          onChange={(e) => {
            setTime(e.target.value);
            updateTimes(e.target.value);
          }}
          style={styles.timeInput}
        />

        {bestHour !== null ? (
      <div style={styles.bestTime}>
        ⭐ Best meeting hour: {bestHour}:00
      </div>
    ) : (
      <div style={styles.bestTime}>
        ⚠️ No perfect overlap — try nearby hours.
      </div>
    )}


        


          

        {zonesData.map((z, i) => (
          <div key={i} style={styles.card}>
            <select
              value={zones[i].zone}
              onChange={(e) => {
                const selected = COUNTRIES.find(c => c.zone === e.target.value);
                changeZone(i, selected);
              }}
              style={styles.select}
              >
              {COUNTRIES.map((c) => (
                <option key={c.zone} value={c.zone}>
                  {c.name} — {c.city}
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

