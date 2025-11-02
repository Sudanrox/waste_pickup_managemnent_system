export const API_URL = "http://localhost:5000/api";

export const fetchWardSchedule = async (wardId) => {
  const res = await fetch(`${API_URL}/pickups/${wardId}`);
  return res.json();
};
