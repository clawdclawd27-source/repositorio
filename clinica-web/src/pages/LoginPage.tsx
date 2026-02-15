import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/painel');
    } catch {
      setError('Falha no login. Verifique usuário e senha.');
    }
  }

  return (
    <div className="login-wrap">
      <form className="card login-card" onSubmit={onSubmit}>
        <img src="/assets/logo-clinica.jpg" alt="Logo Clínica Emanuelle Ferreira" className="brand-logo" />
        <h1>Clínica Emanuelle Ferreira</h1>
        <p className="subtitle">Acesso ao sistema</p>
        <label>
          E-mail
          <input placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Senha
          <div className="password-row">
            <input placeholder="Senha" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="eye-btn" onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </label>

        {error && <small>{error}</small>}
        <button type="submit">Entrar</button>

        <div className="login-links">
          <a href="#" onClick={(e) => e.preventDefault()}>Esqueci minha senha</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Cadastrar usuário</a>
        </div>
      </form>
    </div>
  );
}
