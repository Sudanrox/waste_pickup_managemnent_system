import { useState, useEffect } from "react";

export default function WardSchedule() {
  const [ward, setWard] = useState("1");
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/pickups/" + ward)
      .then((res) => res.json())
      .then((data) => setSchedule(data));
  }, [ward]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Ward Schedule</h2>
      <input value={ward} onChange={(e) => setWard(e.target.value)} />
      <pre>{JSON.stringify(schedule, null, 2)}</pre>
    </div>
  );
}
