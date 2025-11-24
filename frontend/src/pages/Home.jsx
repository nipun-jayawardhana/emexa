import { useState, useEffect } from "react";
import Hello from "../components/Hello";

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) setUser(JSON.parse(u));
    } catch {
      // ignore
    }
  }, []);

  return (
    <>
      <div className="p-4 text-4xl text-white bg-pink-500">
        Home Page
        {user && (
          <div style={{ fontSize: 16, marginTop: 8 }}>Welcome, {user.name}</div>
        )}
      </div>
      <Hello />
    </>
  );
};

export default Home;
