import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {

      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   try {
  //     await dispatch(login({ email, password })).unwrap();
  //     navigate('/dashboard');
  //   } catch (err) {
  //     console.error('Login failed:', err);
  //   }
  // };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Dispatch login and get the returned user object
      const response = await dispatch(login({ email, password })).unwrap();

      // response should have the "user" object
      const user = response.user;

      if (user) {
        localStorage.setItem("role", user.role);          // Save role
        localStorage.setItem("userData", JSON.stringify(user)); // Save full user info
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };


  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)', padding: '1rem' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '0.75rem', boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '28rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#14b8a6', marginBottom: '0.5rem' }}>Admin Portal</h2>
          <p style={{ fontSize: '1rem', color: '#4b5563' }}>Sign in to manage your application</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', color: '#14b8a6', marginBottom: '1rem' }}>Loading...</div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', focus: { outline: 'none', ring: '2px', ringColor: '#14b8a6', borderColor: 'transparent' } }}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', focus: { outline: 'none', ring: '2px', ringColor: '#14b8a6', borderColor: 'transparent' } }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', backgroundColor: '#14b8a6', color: '#ffffff', padding: '0.75rem', borderRadius: '0.5rem', cursor: 'pointer', hover: { backgroundColor: '#0f766e' }, disabled: { opacity: 0.5 }, transition: 'all 0.2s', fontWeight: '600' }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
      <style>
        {`
          input:focus {
            outline: none;
            box-shadow: 0 0 0 2px #14b8a6;
            border-color: transparent;
          }
          button:hover:not(:disabled) {
            background-color: #0f766e;
          }
          button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}
      </style>
    </div>
  );
};

export default Login;