import { useState } from 'react';

interface MetricsType {
  latency: number;
  repairCount: number;
  issuesResolved: string[];
  executable: boolean;
}

interface OutputType {
  metadata: {
    appName: string;
    version: string;
    generatedAt: string;
    confidence: number;
    assumptions: string[];
  };
  database: {
    entities: Array<{ name: string; fields: Array<{ name: string; type: string }> }>;
    relations: any[];
  };
  api: {
    endpoints: Array<{ path: string; method: string; entity: string; auth: string[] }>;
  };
  auth: {
    roles: Array<{ name: string; permissions: string[] }>;
    defaultRole: string;
  };
  ui: {
    pages: Array<{ name: string; path: string; components: any[] }>;
    layout: { navigation: Array<{ label: string; path: string; roles: string[] }> };
  };
  businessLogic: any[];
}

function App() {
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState<OutputType | null>(null);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<MetricsType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('config');

  const compileApp = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt describing your application');
      return;
    }
    
    setLoading(true);
    setError(null);
    setOutput(null);
    
    try {
      const response = await fetch('https://ai-app-compiler-backend-ih1l.onrender.com/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setOutput(data.output);
        setMetrics(data.metrics);
      } else if (data.status === 'needs_clarification') {
        setError(`⚠️ Clarification needed:\n${data.questions.join('\n')}`);
      } else {
        setError(data.error || 'Compilation failed');
      }
    } catch (err: any) {
      setError(`❌ Cannot connect to compiler server.\n\nError: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const examplePrompts = [
    "Build a CRM with login, contacts, dashboard, and role-based access",
    "Create an e-commerce store with products, cart, and user reviews",
    "Make a task management app with projects, tasks, and team members",
    "Build a blog platform with posts, comments, and author profiles"
  ];

  const colors = {
    bgDark: '#2A2B2A',
    bgCard: '#3D3E3D',
    accent1: '#D4755B',
    accent2: '#8A9A7B',
    accent3: '#E8DCC6',
    textLight: '#F5F0E6',
    textMuted: '#B5B0A4',
    success: '#7C9A6E',
    error: '#C96A5B',
    border: '#4A4B4A'
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.bgDark,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: colors.bgCard,
            padding: '8px 24px',
            borderRadius: '100px',
            border: `1px solid ${colors.accent1}`,
            marginBottom: '24px'
          }}>
            <span style={{ fontSize: '28px' }}>⚡</span>
            <span style={{ color: colors.textMuted, fontSize: '14px', fontWeight: 500, letterSpacing: '0.5px' }}>
              COMPILER V1.0
            </span>
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(48px, 8vw, 72px)', 
            fontWeight: 700,
            color: colors.accent3,
            marginBottom: '16px',
            letterSpacing: '-0.02em'
          }}>
            AI App Compiler
          </h1>
          
          <p style={{ 
            fontSize: '18px', 
            color: colors.textMuted,
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Natural language → Production-ready configuration
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <div style={{ 
            background: colors.bgCard,
            borderRadius: '20px',
            border: `1px solid ${colors.border}`,
            padding: '28px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: colors.accent1,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '20px' }}>📝</span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 600, color: colors.accent3, margin: 0 }}>
                Describe Your Vision
              </h2>
            </div>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments. Admins can see analytics."
              style={{
                width: '100%',
                height: '160px',
                padding: '16px',
                background: colors.bgDark,
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'monospace',
                color: colors.textLight,
                resize: 'vertical',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.accent1}
              onBlur={(e) => e.target.style.borderColor = colors.border}
            />
            
            <div style={{ marginTop: '20px' }}>
              <p style={{ color: colors.textMuted, fontSize: '12px', marginBottom: '12px' }}>
                ⚡ QUICK START
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {examplePrompts.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(example)}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${colors.accent2}`,
                      padding: '6px 14px',
                      borderRadius: '100px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      color: colors.accent2,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.accent2;
                      e.currentTarget.style.color = colors.bgDark;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = colors.accent2;
                    }}
                  >
                    {example.substring(0, 45)}...
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={compileApp}
              disabled={loading}
              style={{
                width: '100%',
                marginTop: '24px',
                padding: '14px',
                background: loading ? colors.border : colors.accent1,
                color: loading ? colors.textMuted : colors.bgDark,
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    display: 'inline-block',
                    width: '14px',
                    height: '14px',
                    border: `2px solid ${colors.textMuted}`,
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    marginRight: '8px'
                  }} />
                  Compiling...
                </>
              ) : (
                '✨ Generate Configuration'
              )}
            </button>
          </div>

          <div style={{ 
            background: colors.bgCard,
            borderRadius: '20px',
            border: `1px solid ${colors.border}`,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              borderBottom: `1px solid ${colors.border}`,
              padding: '0 20px'
            }}>
              <button
                onClick={() => setActiveView('config')}
                style={{
                  padding: '14px 20px',
                  background: 'none',
                  border: 'none',
                  color: activeView === 'config' ? colors.accent1 : colors.textMuted,
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  borderBottom: activeView === 'config' ? `2px solid ${colors.accent1}` : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                📄 Configuration
              </button>
              <button
                onClick={() => setActiveView('preview')}
                style={{
                  padding: '14px 20px',
                  background: 'none',
                  border: 'none',
                  color: activeView === 'preview' ? colors.accent1 : colors.textMuted,
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  borderBottom: activeView === 'preview' ? `2px solid ${colors.accent1}` : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                👁️ Preview
              </button>
            </div>

            <div style={{ padding: '24px', flex: 1 }}>
              {error && (
                <div style={{
                  background: `rgba(201, 106, 91, 0.1)`,
                  border: `1px solid ${colors.error}`,
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <strong style={{ color: colors.error }}>Error</strong>
                  <p style={{ margin: '8px 0 0 0', color: colors.textMuted, fontSize: '13px', whiteSpace: 'pre-wrap' }}>{error}</p>
                </div>
              )}

              {metrics && (
                <div style={{
                  background: `rgba(124, 154, 110, 0.1)`,
                  border: `1px solid ${colors.success}`,
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span>✅</span>
                    <strong style={{ color: colors.success }}>Compilation Successful</strong>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div style={{ color: colors.textMuted, fontSize: '11px' }}>LATENCY</div>
                      <div style={{ color: colors.accent3, fontSize: '20px', fontWeight: 600 }}>{metrics.latency}ms</div>
                    </div>
                    <div>
                      <div style={{ color: colors.textMuted, fontSize: '11px' }}>REPAIRS</div>
                      <div style={{ color: colors.accent1, fontSize: '20px', fontWeight: 600 }}>{metrics.repairCount}</div>
                    </div>
                  </div>
                  {metrics.issuesResolved && metrics.issuesResolved.length > 0 && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid rgba(124, 154, 110, 0.2)` }}>
                      <div style={{ color: colors.accent1, fontSize: '11px', marginBottom: '6px' }}>Auto-Repaired:</div>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: colors.textMuted, fontSize: '11px' }}>
                        {metrics.issuesResolved.slice(0, 3).map((issue: string, i: number) => (
                          <li key={i}>{issue.substring(0, 80)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeView === 'config' && (
                <pre style={{
                  background: colors.bgDark,
                  color: colors.accent3,
                  padding: '16px',
                  borderRadius: '12px',
                  overflow: 'auto',
                  fontSize: '11px',
                  fontFamily: 'Monaco, Consolas, monospace',
                  margin: 0,
                  border: `1px solid ${colors.border}`,
                  maxHeight: '500px'
                }}>
                  {output ? JSON.stringify(output, null, 2) : '// Generated configuration will appear here\n// The compiler validates and repairs automatically'}
                </pre>
              )}

              {activeView === 'preview' && output && (
                <div style={{
                  background: colors.bgDark,
                  borderRadius: '12px',
                  padding: '20px',
                  border: `1px solid ${colors.border}`
                }}>
                  <h3 style={{ color: colors.accent1, margin: '0 0 4px 0', fontSize: '18px' }}>
                    {output.metadata?.appName || 'Application'}
                  </h3>
                  <p style={{ color: colors.textMuted, fontSize: '12px', marginBottom: '20px' }}>
                    Confidence: {((output.metadata?.confidence || 0.8) * 100).toFixed(0)}%
                  </p>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ color: colors.accent2, fontSize: '11px', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.5px' }}>
                      DATABASE
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {output.database?.entities?.map((entity: any, i: number) => (
                        <span key={i} style={{
                          background: `rgba(138, 154, 123, 0.15)`,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          color: colors.accent2
                        }}>
                          {entity.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: colors.accent1, fontSize: '11px', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.5px' }}>
                      API ENDPOINTS
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {output.api?.endpoints?.slice(0, 4).map((endpoint: any, i: number) => (
                        <div key={i} style={{ fontSize: '11px', color: colors.textMuted, fontFamily: 'monospace' }}>
                          <span style={{ color: endpoint.method === 'GET' ? colors.success : colors.accent1 }}>
                            {endpoint.method}
                          </span>
                          {' '}{endpoint.path}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'preview' && !output && !error && (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: colors.textMuted
                }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>👁️</span>
                  <p style={{ fontSize: '13px' }}>Generate your app to see a preview</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          padding: '20px',
          background: colors.bgCard,
          borderRadius: '16px',
          border: `1px solid ${colors.border}`
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: colors.accent1 }}>5-Stage</div>
            <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px' }}>Compilation Pipeline</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: colors.accent2 }}>Auto-Repair</div>
            <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px' }}>Intelligent Validation</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: colors.accent3 }}>Production</div>
            <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px' }}>Ready Output</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;