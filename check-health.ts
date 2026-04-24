async function checkHealth() {
  try {
    const res = await fetch('http://localhost:3000/api/health');
    console.log("Health Check Status:", res.status);
    console.log("Health Check Body:", await res.json());
  } catch (e) {
    console.log("Health Check Error:", e.message);
  }
}
checkHealth();
