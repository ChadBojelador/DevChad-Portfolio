import { useState, useRef, useEffect, useCallback } from 'react';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID  = 'service_x5r909u';
const EMAILJS_TEMPLATE_ID = 'template_51utv48';
const EMAILJS_PUBLIC_KEY  = 'get6yrAd5TK6qXwQf';
const RECIPIENT_EMAIL     = 'slsuls.chadbojelador@gmail.com';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const timeoutRef = useRef(null);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Basic client-side validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { ...formData, reply_to: formData.email, to_email: RECIPIENT_EMAIL },
        EMAILJS_PUBLIC_KEY
      );

      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setIsSubmitted(false);
        setIsSubmitting(false);
      }, 3000);
    } catch (err) {
      console.error('Email failed to send:', err);
      setError('Failed to send message. Please try again.');
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="page contact-page">
      <header className="page-header">
        <p className="page-eyebrow">Start a conversation</p>
        <h1>Let&apos;s build something useful.</h1>
        <p className="page-lede">For questions, opportunities, or a thoughtful exchange, use the form or reach out directly.</p>
      </header>

      <div className="contact-content">
        <section className="contact-info" aria-label="Contact details">
            <div className="contact-method">
              <div className="contact-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
              </div>
              <div className="contact-details">
                <h3>Email</h3>
                <p>slsuls.chadbojelador@gmail.com</p>
              </div>
            </div>

            <div className="contact-method">
              <div className="contact-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="contact-details">
                <h3>Phone</h3>
                <p>(+63) 9090255388</p>
              </div>
            </div>

            <div className="social-links">
              <h3>Connect with me</h3>
              <div className="social-icons">
                <a href="https://github.com/ChadBojelador" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <i className="fi fi-brands-github"></i>
                </a>
                <a href="https://www.instagram.com/_itschd/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <i className="fi fi-brands-instagram"></i>
                </a>
                <a href="https://www.linkedin.com/in/chad-laurence-bojelador-869139354/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <i className="fi fi-brands-linkedin"></i>
                </a>
                <a href="https://www.facebook.com/chad.bojelador" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <i className="fi fi-brands-facebook"></i>
                </a>
              </div>
            </div>
        </section>

        <div className="contact-form-container">
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="input-animate"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="input-animate"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="input-animate"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="input-animate"
                ></textarea>
              </div>

              <button
                type="submit"
                className={`submit-btn ${isSubmitting ? 'pulse-animation' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>

              {isSubmitted && (
                <div className="success-message" role="alert" aria-live="polite">
                  Message sent successfully! I'll get back to you soon.
                </div>
              )}

              {error && (
                <div className="error-message" role="alert" aria-live="assertive">
                  {error}
                </div>
              )}
            </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
