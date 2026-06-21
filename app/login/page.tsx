import Image from 'next/image';
import { loginAction } from './actions';

type SearchParams = { error?: string; from?: string };

export default function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const hasError = searchParams.error === '1';
  const from = searchParams.from || '';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f4f4f4',
        fontFamily: "'Anek Latin', sans-serif",
        padding: '24px',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 2px 24px rgba(0,0,0,0.08)',
          padding: '48px 40px',
          width: '100%',
          maxWidth: '420px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '28px',
        }}
      >
        <Image
          src="/cdc-habitat-logo.jpg"
          alt="CDC Habitat"
          width={120}
          height={60}
          style={{ objectFit: 'contain' }}
          priority
        />

        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#4C4C4B',
              margin: '0 0 8px',
              lineHeight: '1.3',
            }}
          >
            Rencontre Nationale Patrimoine 2026
          </h1>
          <p style={{ fontSize: '14px', color: '#6b6b6a', margin: 0 }}>
            Espace d&apos;inscription réservé aux invités
          </p>
        </div>

        {hasError && (
          <div
            style={{
              width: '100%',
              backgroundColor: '#fde8e9',
              border: '1px solid #f9b3b6',
              borderRadius: '6px',
              padding: '12px 16px',
              color: '#E30613',
              fontSize: '14px',
              fontWeight: '500',
              boxSizing: 'border-box',
            }}
          >
            Identifiant ou mot de passe incorrect.
          </div>
        )}

        <form
          action={loginAction}
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <input type="hidden" name="from" value={from} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="identifier"
              style={{ fontSize: '14px', fontWeight: '500', color: '#4C4C4B' }}
            >
              Identifiant
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              required
              style={{
                padding: '10px 14px',
                border: '1px solid #d1d1d1',
                borderRadius: '6px',
                fontSize: '15px',
                color: '#4C4C4B',
                width: '100%',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="password"
              style={{ fontSize: '14px', fontWeight: '500', color: '#4C4C4B' }}
            >
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              style={{
                padding: '10px 14px',
                border: '1px solid #d1d1d1',
                borderRadius: '6px',
                fontSize: '15px',
                color: '#4C4C4B',
                width: '100%',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: '8px',
              backgroundColor: '#E30613',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              fontFamily: "'Anek Latin', sans-serif",
            }}
          >
            Accéder à l&apos;inscription
          </button>
        </form>
      </div>
    </div>
  );
}
