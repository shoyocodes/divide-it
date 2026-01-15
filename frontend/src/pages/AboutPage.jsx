import { useState } from 'react';

export default function AboutPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate form submission
        console.log('Form submitted:', formData);
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>About Divide It</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Simplifying expense splitting for everyone.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', maxWidth: '700px', margin: '0 auto' }}>

                {/* Developer Info */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>Developer Contact</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Email</p>
                            <a href="mailto:beingrasya@gmail.com" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '1.1rem' }}>beingrasya@gmail.com</a>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Location</p>
                            <p style={{ margin: 0, fontSize: '1.1rem' }}>Kochi, India</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Socials</p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <a href="https://github.com/shoyocodes" target="_blank" rel="noreferrer" style={{ color: 'var(--text)', opacity: 0.8 }}>GitHub</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#fff' }}>Send a Message</h2>

                    {submitted ? (
                        <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#34d399' }}>
                            <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Message Sent!</p>
                            <p>We'll get back to you soon.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="label">Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Your Name"
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="label">Email</label>
                                <input
                                    type="email"
                                    className="input"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="label">Message</label>
                                <textarea
                                    className="input"
                                    required
                                    rows="4"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="How can we help?"
                                    style={{ resize: 'vertical', minHeight: '100px' }}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                Send Message
                            </button>
                        </form>
                    )}
                </div>

            </div>
        </div>
    );
}
