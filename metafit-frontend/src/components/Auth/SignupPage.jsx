import React, { useState } from 'react';

const SignupWizard = ({ onSignupComplete }) => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Step 1: Name
  const [name, setName] = useState('');
  
  // Step 2: Email & Username
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [usernameMessage, setUsernameMessage] = useState('');
  const [emailValid, setEmailValid] = useState(null);
  const [emailNotDuplicate, setEmailNotDuplicate] = useState(null);
  const [emailMessage, setEmailMessage] = useState('');
  
  // Step 3: Password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    upper: false,
    lower: false,
    digit: false,
    special: false,
    match: false
  });
  
  // Step 4: Birthdate
  const [dob, setDob] = useState('');
  const [age, setAge] = useState(null);
  
  // Step 5: Health Info
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [healthErrors, setHealthErrors] = useState({});
  
  // Step 6: Goals & Activity
  const [goal, setGoal] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const checkUsername = async (usr) => {
    if (!usr || usr.length === 0) {
      setUsernameAvailable(null);
      setUsernameMessage('');
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/api/users/check-username/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usr })
      });
      const data = await response.json();
      setUsernameAvailable(data.available);
      setUsernameMessage(data.message || '');
    } catch (err) {
      console.error('Username check error:', err);
      setUsernameAvailable(null);
      setUsernameMessage('Error checking username');
    }
  };

  const checkEmail = async (email) => {
    if (!email) {
      setEmailValid(null);
      setEmailNotDuplicate(null);
      setEmailMessage('');
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/api/users/check-email/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      });
      const data = await response.json();
      setEmailValid(data.valid);
      setEmailNotDuplicate(data.available);
      setEmailMessage(data.message || '');
    } catch (err) {
      console.error('Email check error:', err);
      setEmailValid(null);
      setEmailNotDuplicate(null);
      setEmailMessage('Error checking email');
    }
  };

  const validatePassword = (pwd) => {
    const rules = {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      digit: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      match: pwd === confirmPassword && pwd.length > 0
    };
    setPasswordRules(rules);
  };

  const calculateAge = (dateString) => {
    const birthDate = new Date(dateString);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge;
  };

  const validateHealthInfo = () => {
    const errors = {};
    if (!gender) errors.gender = 'Please select a gender';
    if (!height || isNaN(height) || height < 2 || height > 8) {
      errors.height = 'Enter valid height (2-8 feet)';
    }
    if (!weight || isNaN(weight) || weight < 30 || weight > 300) {
      errors.weight = 'Enter valid weight (30-300 kg)';
    }
    setHealthErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const step1Complete = name.trim().length > 0;
  const step2Complete = usernameAvailable && emailValid && emailNotDuplicate;
  const step3Complete = Object.values(passwordRules).every(v => v === true);
  const step4Complete = dob && age && age >= 13;
  const step5Complete = gender && height && weight && Object.keys(healthErrors).length === 0;
  const step6Complete = goal && goal !== '' && activityLevel && activityLevel !== '';

  const handleNext = () => {
    if (step === 2) checkEmail(email);
    if (step === 4) {
      const calculatedAge = calculateAge(dob);
      setAge(calculatedAge);
    }
    if (step === 5) {
      if (!validateHealthInfo()) return;
    }
    setStep(step + 1);
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    setError('');
    try {
      const userData = {
        name,
        username,
        email,
        password,
        dob,
        gender,
        height: parseFloat(height),
        weight: parseFloat(weight),
        goal,
        activityLevel
      };

      const response = await fetch('http://localhost:8000/api/users/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      if (data.success) {
        // Show success message
        setSuccessMessage(`Welcome ${data.data.Name}! Your account has been created successfully.`);
        setShowSuccessMessage(true);
        
        // Redirect to login after 2.5 seconds
        setTimeout(() => {
          // Call the callback to redirect to login page
          if (onSignupComplete) {
            onSignupComplete(data.data);
          }
        }, 2500);
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Failed to create account: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    overflow: 'auto'
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '500px',
    background: 'rgba(30, 41, 59, 0.95)',
    border: '1px solid rgba(51, 65, 85, 1)',
    borderRadius: '12px',
    padding: '50px 40px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '12px',
    color: '#ffffff'
  };

  const subtitleStyle = {
    fontSize: '13px',
    textAlign: 'center',
    color: '#a1a1aa',
    marginBottom: '28px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: '8px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    backgroundColor: '#1a2847',
    color: 'white',
    border: '2px solid #333',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: 'Arial, sans-serif',
    boxSizing: 'border-box',
    marginBottom: '16px',
    outline: 'none',
    transition: 'border-color 0.3s'
  };

  const selectStyle = {
    width: '100%',
    padding: '12px 14px',
    backgroundColor: '#1a2847',
    color: 'white',
    border: '2px solid #333',
    borderRadius: '8px',
    fontSize: '13px',
    boxSizing: 'border-box',
    marginBottom: '16px',
    outline: 'none',
    cursor: 'pointer'
  };

  const buttonStyle = {
    padding: '12px 16px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '13px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#4ade80',
    color: 'black',
    flex: 1
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#4a7ba7',
    color: 'white',
    flex: 1
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#9ca3af',
    color: '#6b7280',
    cursor: 'not-allowed',
    flex: 1
  };

  const validationItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
    fontSize: '11px'
  };

  const progressDotsStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '24px'
  };

  const dotStyle = (isActive) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: isActive ? '#4ade80' : '#475569',
    transition: 'background-color 0.3s'
  });

  // Success message modal style
  const successModalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const successCardStyle = {
    background: 'rgba(30, 41, 59, 0.98)',
    border: '2px solid #4ade80',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center',
    maxWidth: '400px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7)'
  };

  const successIconStyle = {
    fontSize: '64px',
    marginBottom: '16px',
    animation: 'scaleIn 0.5s ease-out'
  };

  const successTitleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: '12px'
  };

  const successTextStyle = {
    fontSize: '14px',
    color: '#e2e8f0',
    marginBottom: '20px',
    lineHeight: '1.6'
  };

  const loadingTextStyle = {
    fontSize: '12px',
    color: '#a1a1aa',
    marginTop: '12px'
  };

  // Success Modal Component
  const SuccessModal = () => (
    <div style={successModalStyle}>
      <style>{`
        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      <div style={successCardStyle}>
        <div style={successIconStyle}>✓</div>
        <div style={successTitleStyle}>Registration Successful!</div>
        <div style={successTextStyle}>{successMessage}</div>
        <div style={loadingTextStyle} className="pulse">Redirecting to login...</div>
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      {showSuccessMessage && <SuccessModal />}
      
      <div style={cardStyle}>
        {/* Step 1: Name */}
        {step === 1 && (
          <>
            <h1 style={titleStyle}>Welcome!</h1>
            <p style={subtitleStyle}>Step 1 of 6</p>
            <label style={labelStyle}>Enter your full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Full Name"
              style={inputStyle}
            />
            {name && (
              <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '16px', fontWeight: 'bold', color: '#4ade80' }}>
                Hello, {name}! 👋
              </p>
            )}
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button 
                onClick={() => onSignupComplete?.(null)}
                style={secondaryButtonStyle}
              >
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!step1Complete}
                style={step1Complete ? primaryButtonStyle : disabledButtonStyle}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 2: Email & Username */}
        {step === 2 && (
          <>
            <h1 style={titleStyle}>Account Details</h1>
            <p style={subtitleStyle}>Step 2 of 6</p>
            
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                const value = e.target.value;
                setUsername(value);
                checkUsername(value);
              }}
              placeholder="your_username"
              style={inputStyle}
            />
            {username.length > 0 && (
              <div style={validationItemStyle}>
                <span style={{ color: usernameAvailable ? '#4ade80' : '#f87171' }}>
                  {usernameAvailable ? '✓ ' : '✗ '}{usernameMessage}
                </span>
              </div>
            )}

            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                const value = e.target.value;
                setEmail(value);
                checkEmail(value);
              }}
              placeholder="example@domain.com"
              style={inputStyle}
            />
            {email.length > 0 && (
              <>
                <div style={validationItemStyle}>
                  <span style={{ color: emailValid ? '#4ade80' : '#f87171' }}>
                    {emailValid ? '✓ ' : '✗ '}{emailMessage}
                  </span>
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px', marginTop: 'auto' }}>
              <button onClick={() => setStep(1)} style={secondaryButtonStyle}>Back</button>
              <button
                onClick={() => setStep(3)}
                disabled={!step2Complete}
                style={step2Complete ? primaryButtonStyle : disabledButtonStyle}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 3: Password */}
        {step === 3 && (
          <>
            <h1 style={titleStyle}>Create Password</h1>
            <p style={subtitleStyle}>Step 3 of 6</p>

            <label style={labelStyle}>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              placeholder="Enter password"
              style={inputStyle}
            />

            <label style={labelStyle}>Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                validatePassword(password);
              }}
              placeholder="Confirm password"
              style={inputStyle}
            />

            <div style={{ marginTop: '12px', marginBottom: '16px' }}>
              {[
                { key: 'length', label: 'At least 8 characters' },
                { key: 'upper', label: 'At least one uppercase letter' },
                { key: 'lower', label: 'At least one lowercase letter' },
                { key: 'digit', label: 'At least one number' },
                { key: 'special', label: 'At least one special character' },
                { key: 'match', label: 'Passwords must match' }
              ].map(({ key, label }) => (
                <div key={key} style={validationItemStyle}>
                  <span style={{ color: passwordRules[key] ? '#4ade80' : '#f87171' }}>
                    {passwordRules[key] ? '✓' : '✗'} {label}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button onClick={() => setStep(2)} style={secondaryButtonStyle}>Back</button>
              <button
                onClick={() => setStep(4)}
                disabled={!step3Complete}
                style={step3Complete ? primaryButtonStyle : disabledButtonStyle}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 4: Birthdate */}
        {step === 4 && (
          <>
            <h1 style={titleStyle}>Date of Birth</h1>
            <p style={subtitleStyle}>Step 4 of 6</p>

            <label style={labelStyle}>Select your date of birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => {
                const selectedDate = e.target.value;
                setDob(selectedDate);
                if (selectedDate) {
                  const calculatedAge = calculateAge(selectedDate);
                  setAge(calculatedAge);
                }
              }}
              style={inputStyle}
            />

            {age !== null && (
              <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '16px', fontWeight: 'bold', color: '#4ade80' }}>
                Age: {age}
              </p>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button onClick={() => setStep(3)} style={secondaryButtonStyle}>Back</button>
              <button
                onClick={() => setStep(5)}
                disabled={!(dob && age && age >= 13)}
                style={dob && age && age >= 13 ? primaryButtonStyle : disabledButtonStyle}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 5: Health Info */}
        {step === 5 && (
          <>
            <h1 style={titleStyle}>Health Information</h1>
            <p style={subtitleStyle}>Step 5 of 6</p>

            <label style={labelStyle}>Gender</label>
            <select
              value={gender}
              onChange={(e) => {
                setGender(e.target.value);
                validateHealthInfo();
              }}
              style={selectStyle}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <label style={labelStyle}>Height (feet, e.g., 5.8)</label>
            <input
              type="number"
              step="0.1"
              value={height}
              onChange={(e) => {
                setHeight(e.target.value);
                validateHealthInfo();
              }}
              placeholder="Enter height"
              style={inputStyle}
            />

            <label style={labelStyle}>Weight (kg, e.g., 70)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                validateHealthInfo();
              }}
              placeholder="Enter weight"
              style={inputStyle}
            />

            {Object.keys(healthErrors).length > 0 && (
              <div style={{ marginTop: '12px', marginBottom: '12px' }}>
                {Object.values(healthErrors).map((err, i) => (
                  <div key={i} style={validationItemStyle}>
                    <span style={{ color: '#f87171' }}>✗ {err}</span>
                  </div>
                ))}
              </div>
            )}

            {step5Complete && (
              <p style={{ textAlign: 'center', marginTop: '12px', color: '#4ade80', fontSize: '11px' }}>✓ All information valid!</p>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button onClick={() => setStep(4)} style={secondaryButtonStyle}>Back</button>
              <button
                onClick={() => setStep(6)}
                disabled={!step5Complete}
                style={step5Complete ? primaryButtonStyle : disabledButtonStyle}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 6: Goals & Activity */}
        {step === 6 && (
          <>
            <h1 style={titleStyle}>Fitness Goals</h1>
            <p style={subtitleStyle}>Step 6 of 6</p>

            <label style={labelStyle}>Fitness Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              style={selectStyle}
            >
              <option value="">Select Goal</option>
              <option value="Weight Gain">Weight Gain</option>
              <option value="Weight Loss">Weight Loss</option>
              <option value="Maintain Weight">Maintain Weight</option>
              <option value="Muscle Gain">Muscle Gain</option>
            </select>

            <label style={labelStyle}>Activity Level</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              style={selectStyle}
            >
              <option value="">Select Activity Level</option>
              <option value="Sedentary">Sedentary</option>
              <option value="Lightly Active">Lightly Active</option>
              <option value="Moderately Active">Moderately Active</option>
              <option value="Very Active">Very Active</option>
              <option value="Extremely Active">Extremely Active</option>
            </select>

            {step6Complete && (
              <p style={{ textAlign: 'center', marginTop: '12px', color: '#4ade80', fontSize: '11px' }}>✓ All information valid!</p>
            )}

            {error && (
              <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#7f1d1d', borderRadius: '6px', color: '#fca5a5', fontSize: '11px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button onClick={() => setStep(5)} style={secondaryButtonStyle}>Back</button>
              <button
                onClick={handleCreateAccount}
                disabled={!step6Complete || loading}
                style={step6Complete && !loading ? primaryButtonStyle : disabledButtonStyle}
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </>
        )}

        {/* Progress indicator */}
        <div style={progressDotsStyle}>
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} style={dotStyle(s <= step)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignupWizard;