import { useState } from "react";

import { Mail, LockKeyhole, User, Wallet, ArrowRight } from "lucide-react";

import "../styles/login.css";

function Register({ onBackLogin }) {
  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password) {
      alert("Semua field wajib diisi");

      return;
    }

    if (password.length < 8) {
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Register berhasil!");

        onBackLogin();
      } else {
        alert(data.message || "Register gagal");
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

        <p className="auth-desc">Mulai perjalanan finansialmu dengan fitur dashboard, goals tracker, dan AI insight.</p>
      </div>

      {/* RIGHT */}

      <div className="auth-right">
        <div className="auth-card">
          <h2>Create Account</h2>

          <p className="auth-subtitle">Daftar untuk mulai</p>

          {/* NAME */}

          <div className="input-group">
            <User size={18} />

            <input type="text" placeholder="Nama lengkap" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

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

          {password.length > 0 && password.length < 8 && (
            <div className="password-requirement">
              <span className="requirement-invalid">Minimal 8 karakter</span>
            </div>
          )}

          <button className="auth-btn" onClick={handleRegister} disabled={password.length < 8}>Daftar</button>

          <p className="switch-auth">
            Sudah punya akun? <span onClick={onBackLogin}>Login di sini</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
