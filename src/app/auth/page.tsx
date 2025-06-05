"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import { 
  FaMicrosoft, 
  FaGoogle, 
  FaGithub, 
  FaLinkedin 
} from 'react-icons/fa';
import styles from './page.module.scss';

interface FormField {
  type: string;
  placeholder: string;
  icon: React.ReactNode;
  name: string;
}

const loginFields: FormField[] = [
  {
    type: 'email',
    placeholder: 'Email Address',
    icon: <FiMail className={styles.fieldIcon} />,
    name: 'email'
  },
  {
    type: 'password',
    placeholder: 'Password',
    icon: <FiLock className={styles.fieldIcon} />,
    name: 'password'
  }
];

const signupFields: FormField[] = [
  {
    type: 'text',
    placeholder: 'Full Name',
    icon: <FiUser className={styles.fieldIcon} />,
    name: 'name'
  },
  ...loginFields
];

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.name, formData.email, formData.password);
      }
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const toggleMode = () => {
    setIsLogin(prev => !prev);
    setError(null);
    setFormData({
      name: '',
      email: '',
      password: ''
    });
  };

  return (
    <main className={styles.authPage}>
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <div className={styles.formSection}>
            <div className={styles.formWrapper}>
              <h1>{isLogin ? 'Welcome back' : 'Create account'}</h1>
              <h2>{isLogin ? 'Sign in to continue' : 'Get started with Unnamed Project'}</h2>

              {error && (
                <div className={styles.error}>
                  {error}
                </div>
              )}

              <div className={styles.socialButtons}>
                <button 
                  className={`${styles.socialButton} ${styles.microsoft}`}
                  disabled={isLoading}
                >
                  <FaMicrosoft className={styles.icon} />
                  Continue with Microsoft
                </button>
                <button 
                  className={`${styles.socialButton} ${styles.google}`}
                  disabled={isLoading}
                >
                  <FaGoogle className={styles.icon} />
                  Continue with Google
                </button>
                <button 
                  className={`${styles.socialButton} ${styles.github}`}
                  disabled={isLoading}
                >
                  <FaGithub className={styles.icon} />
                  Continue with GitHub
                </button>
                <button 
                  className={`${styles.socialButton} ${styles.linkedin}`}
                  disabled={isLoading}
                >
                  <FaLinkedin className={styles.icon} />
                  Continue with LinkedIn
                </button>
              </div>

              <div className={styles.divider}>
                <span>or continue with email</span>
              </div>

              <form onSubmit={handleSubmit}>
                {(isLogin ? loginFields : signupFields).map((field, index) => (
                  <div key={index} className={styles.field}>
                    {field.icon}
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      name={field.name}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                ))}

                {isLogin && (
                  <div className={styles.forgotPassword}>
                    <a href="/auth/reset-password">Forgot password?</a>
                  </div>
                )}

                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                </button>
              </form>

              <div className={styles.switchMode}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button onClick={toggleMode} disabled={isLoading}>
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            </div>
          </div>

          <div className={styles.infoSection}>
            <div className={styles.infoContent}>
              <h2>Why choose Unnamed Project?</h2>
              <p>
                Join thousands of researchers, journalists, and analysts who use our platform
                to gain deeper insights from news video transcripts.
              </p>
              <ul>
                <li>Advanced sentiment analysis</li>
                <li>Real-time trend detection</li>
                <li>Comprehensive data visualization</li>
                <li>Secure and reliable platform</li>
                <li>Integration with popular tools</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 