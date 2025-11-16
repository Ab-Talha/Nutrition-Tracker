export const profileStyles = {
  container: {
    marginLeft: '100px',
    padding: '40px',
    background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)',
    minHeight: '100vh',
    color: '#fff'
  },

  header: {
    marginBottom: '40px'
  },

  title: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 10px 0',
    background: 'linear-gradient(135deg, #85cc17 0%, #b8e986 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },

  subtitle: {
    fontSize: '16px',
    color: '#aaa',
    margin: 0
  },

  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px'
  },

  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },

  fullWidth: {
    gridColumn: '1 / -1'
  },

  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '24px'
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },

  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
    margin: 0
  },

  editButton: {
    background: '#85cc17',
    color: '#000',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  },

  input: {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease'
  },

  label: {
    display: 'block',
    fontSize: '13px',
    color: '#aaa',
    marginBottom: '8px',
    fontWeight: '500'
  },

  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },

  grid3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '16px'
  },

  saveButton: {
    width: '100%',
    marginTop: '16px',
    padding: '10px',
    background: '#85cc17',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },

  loadingState: {
    fontSize: '16px',
    color: '#aaa',
    textAlign: 'center',
    padding: '60px 20px'
  },

  errorState: {
    fontSize: '16px',
    color: '#ef4444',
    textAlign: 'center',
    padding: '60px 20px',
    background: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(239, 68, 68, 0.3)'
  }
};