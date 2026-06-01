import { useState } from "react";

import { Mail, LockKeyhole, Wallet, ArrowRight } from "lucide-react";

import "../styles/login.css";

function Login({ onLogin, onShowRegister }) {
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Email dan password wajib diisi");

      return;
    }

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));

        localStorage.setItem("userId", data.user.id);

        localStorage.setItem("userName", data.user.name);

        localStorage.setItem("userEmail", data.user.email);

        onLogin();
      } else {
        alert("Email atau password salah");
      }
    } catch (err) {
      console.error(err);

      alert("Error koneksi ke server");
    }
  };

  return (
    <div className="auth-page">
      {/* LEFT */}

      <div className="auth-left">
        <div className="auth-brand">
          <div className="brand-icon">
            <Wallet size={34} />
          </div>

          <h1>Smart Finance</h1>
        </div>

        <p className="auth-desc">Kelola keuangan lebih pintar dengan dashboard modern, goals tracking, dan AI assistant.</p>
      </div>

      {/* RIGHT */}

      <div className="auth-right">
        <div className="auth-card">
          <h2>Welcome Back</h2>

          <p className="auth-subtitle">Login untuk melanjutkan</p>

          {/* EMAIL */}

          <div className="input-group">
            <Mail size={18} />

            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          {/* PASSWORD */}

          <div className="input-group">
            <LockKeyhole size={18} />

            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button className="auth-btn" onClick={handleLogin}>
            Login
            <ArrowRight size={18} />
          </button>

          <p className="switch-auth">
            Belum punya akun? <span onClick={onShowRegister}>Daftar di sini</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
