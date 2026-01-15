import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
}

// Simple Icon Components to avoid extra deps
const CardIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
        <line x1="1" y1="10" x2="23" y2="10"></line>
    </svg>
);

const ShieldIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
);

export default function OrderPage() {
    const location = useLocation();
    const { amount: initialAmount, description: initialDesc } = location.state || {};

    const [name, setName] = useState(initialDesc || 'Premium Subscription');
    const [amount, setAmount] = useState(initialAmount || '999');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    async function handlePayment() {
        setLoading(true);
        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            setLoading(false);
            return;
        }

        try {
            const result = await axios.post('http://localhost:8000/api/create-order/', {
                name: name,
                amount: amount
            });

            const { payment } = result.data;

            const options = {
                key: 'rzp_test_YOUR_KEY_ID',
                amount: payment.amount,
                currency: payment.currency,
                name: 'Razorpay Demo',
                description: 'Secure Payment',
                image: 'https://cdn.razorpay.com/logos/GhRQcyean79PqE_medium.png',
                order_id: payment.id,
                handler: async function (response) {
                    const data = {
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature
                    };

                    try {
                        const verifyRes = await axios.post('http://localhost:8000/api/verify-payment/', data);
                        if (verifyRes.data.status === 'Payment Verified') {
                            setStep(3);
                        } else {
                            alert('Payment Verification Failed');
                        }
                    } catch (error) {
                        console.error(error);
                        alert('Payment verification failed in backend');
                    }
                },
                prefill: {
                    name: "John Doe",
                    email: "john@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#4f46e5"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
            setLoading(false);

        } catch (error) {
            console.error(error);
            setLoading(false);
            alert('Server error. Check console.');
        }
    }

    return (
        <div className="animate-fade-in" style={{ padding: '2rem 1rem' }}>
            <h1 className="page-title">Secure Checkout</h1>
            <p className="page-subtitle">Complete your purchase securely with divideit</p>

            <div className="card" style={{ maxWidth: '480px', margin: '0 auto' }}>

                {step === 1 && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '12px', borderRadius: '12px', color: '#818cf8' }}>
                                <CardIcon />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'white' }}>Payment Details</h3>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Encrypted & Secure</span>
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="label">Product / Service</label>
                            <input
                                type="text"
                                className="input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="E.g. Annual Plan"
                            />
                        </div>

                        <div className="input-group">
                            <label className="label">Amount (INR)</label>
                            <input
                                type="number"
                                className="input"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={handlePayment}
                            disabled={loading}
                            style={{ width: '100%', marginTop: '1rem', height: '54px' }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Processing...
                                </span>
                            ) : (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Pay ₹{amount} Now <ShieldIcon />
                                </span>
                            )}
                        </button>
                    </>
                )}

                {/* Success State */}
                {step === 3 && (
                    <div className="animate-pop-in" style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div style={{
                            background: 'rgba(34, 197, 94, 0.1)',
                            padding: '16px',
                            borderRadius: '50%',
                            display: 'inline-flex',
                            marginBottom: '1.5rem',
                            color: '#22c55e'
                        }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-8.93"></path>
                                <path d="M22 4L12 14.01l-3-3"></path>
                            </svg>
                        </div>
                        <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '1.875rem', color: 'white' }}>Payment Successful!</h2>
                        <p style={{ margin: '0 0 2rem 0', fontSize: '1rem', color: 'var(--text-muted)' }}>
                            Thank you for your purchase. Your transaction has been completed.
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={() => setStep(1)} // Reset to step 1 or navigate
                            style={{ width: 'auto', padding: '0.75rem 2rem' }}
                        >
                            Go Back
                        </button>
                    </div>
                )}

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
                    <p style={{ margin: 0 }}>Powered by Razorpay</p>
                </div>
            </div>
        </div>
    );
}
