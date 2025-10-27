import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main style={{ padding: 20 }}>
        <h1>Welcome to Kathmandu Waste Pickup Notifier</h1>
        <p>Track your ward's waste collection schedule easily.</p>
      </main>
      <Footer />
    </>
  );
}
