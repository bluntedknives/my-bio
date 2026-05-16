import { ImageResponse } from 'next/og';
 
export const runtime = 'nodejs';
 
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          height: '100%',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#050505',
          fontFamily: 'monospace',
          letterSpacing: '-0.05em',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            backgroundColor: '#080808',
            border: '2px solid #1a1a1a',
            padding: '40px 60px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ color: '#444444', fontSize: 12, marginBottom: 20, letterSpacing: '0.4em' }}>SYSTEM.IDENT</div>
          <div style={{ color: 'white', fontSize: 64 }}>@blunted</div>
          <div style={{ color: '#666666', fontSize: 16, marginTop: 20 }}>MINIMALIST TUI BIO</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
