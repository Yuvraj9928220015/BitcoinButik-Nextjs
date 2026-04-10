'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { BsPencil } from 'react-icons/bs';
import { TbTruckDelivery } from 'react-icons/tb';
import { RiCoupon3Line } from 'react-icons/ri';
import { CiLock } from 'react-icons/ci';
import { useCart } from '../Context/CartContext';
import { useRouter } from 'next/navigation';
import { Country, State } from 'country-state-city';
import './checkout.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.bitcoinbutik.com';
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': { color: '#aab7c4' },
      padding: '10px 12px',
    },
    invalid: { color: '#fa755a', iconColor: '#fa755a' },
  },
};

const CheckoutForm = () => {
  const router = useRouter();
  const { cartItems, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const allCountries = Country.getAllCountries();

  const [formData, setFormData] = useState({
    email: '', firstName: '', lastName: '', country: 'US',
    streetAddress1: '', streetAddress2: '', city: '', state: '', zip: '', phone: '', paymentMethod: 'card',
  });

  const [activeModal, setActiveModal] = useState(null);
  const [note, setNote] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({ country: 'US', state: '', city: '', zip: '' });
  const [billingStates, setBillingStates] = useState([]);
  const [shippingModalStates, setShippingModalStates] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/api/coupons/active`).then(res => {
      if (res.data.success) setActiveCoupons(res.data.coupons);
    }).catch(err => console.error('Coupons fetch error:', err));
  }, []);

  useEffect(() => {
    const states = State.getStatesOfCountry(formData.country);
    setBillingStates(states);
    if (states.length > 0) {
      if (!states.some(s => s.isoCode === formData.state))
        setFormData(prev => ({ ...prev, state: states[0].isoCode }));
    } else {
      setFormData(prev => ({ ...prev, state: '' }));
    }
  }, [formData.country]);

  useEffect(() => {
    const states = State.getStatesOfCountry(shippingInfo.country);
    setShippingModalStates(states);
    if (states.length > 0) {
      if (!states.some(s => s.isoCode === shippingInfo.state))
        setShippingInfo(prev => ({ ...prev, state: states[0].isoCode }));
    } else {
      setShippingInfo(prev => ({ ...prev, state: '' }));
    }
  }, [shippingInfo.country]);

  const shippingCost = 0;
  const taxRate = 0;
  const calculatedTax = (subtotal + shippingCost) * taxRate;
  const total = subtotal + shippingCost + calculatedTax;
  const finalTotal = appliedCoupon ? total - appliedCoupon.discountAmount : total;

  const handleFormChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleShippingInfoChange = (e) => setShippingInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const openModal = (name) => setActiveModal(name);
  const closeModal = () => setActiveModal(null);

  const handleSaveNote = (e) => { e.preventDefault(); closeModal(); alert('Note saved!'); };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) { alert('Please enter a coupon code'); return; }
    setCouponLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/coupons/validate`, { code: couponCode, orderAmount: subtotal });
      if (res.data.success) {
        const c = res.data.coupon;
        let disc = 0;
        if (c.discountType === 'percentage') {
          disc = (subtotal * c.discountValue) / 100;
          if (c.maxDiscountAmount && disc > c.maxDiscountAmount) disc = c.maxDiscountAmount;
        } else if (c.discountType === 'fixed') {
          disc = Math.min(c.discountValue, subtotal);
        }
        setAppliedCoupon({ ...c, discountAmount: disc });
        alert(`Coupon "${c.code}" applied! You saved $${disc.toFixed(2)}`);
        setCouponCode(''); closeModal();
      }
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || 'Invalid coupon code'}`);
      setAppliedCoupon(null);
    } finally { setCouponLoading(false); }
  };

  const handleCalculateShipping = (e) => {
    e.preventDefault();
    let cost = 15;
    const country = allCountries.find(c => c.isoCode === shippingInfo.country);
    const state = State.getStateByCodeAndCountry(shippingInfo.state, shippingInfo.country);
    if (shippingInfo.country === 'US' && state?.name === 'California') cost = 10;
    else if (shippingInfo.country === 'CA') cost = 25;
    else if (shippingInfo.country === 'GB') cost = 30;
    alert(`Shipping: $${cost.toFixed(2)} for ${shippingInfo.city}, ${state?.name || country?.name}`);
    closeModal();
  };

  const validateForm = () => {
    for (let f of ['firstName','lastName','email','streetAddress1','city','zip','phone']) {
      if (!formData[f].trim()) { alert(`Please fill in the ${f.replace(/([A-Z])/g,' $1').toLowerCase()} field.`); return false; }
    }
    if (billingStates.length > 0 && !formData.state) { alert('Please select a state.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { alert('Please enter a valid email.'); return false; }
    if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) { alert('Please enter a valid phone number.'); return false; }
    return true;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) { alert('❌ Your cart is empty!'); return; }
    if (!validateForm()) return;
    if (!stripe || !elements) { alert('❌ Payment system loading. Please wait.'); return; }

    setIsProcessing(true);
    setPaymentStatus(null);

    try {
      const selCountry = allCountries.find(c => c.isoCode === formData.country);
      const selState = State.getStateByCodeAndCountry(formData.state, formData.country);
      const cardEl = elements.getElement(CardNumberElement);

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card', card: cardEl,
        billing_details: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email, phone: formData.phone,
          address: { line1: formData.streetAddress1, line2: formData.streetAddress2 || null, city: formData.city, state: selState?.isoCode || formData.state, postal_code: formData.zip, country: formData.country },
        },
      });

      if (error) { setPaymentStatus({ status: 'error', message: error.message }); setIsProcessing(false); return; }

      const amountInCents = Math.round(parseFloat(finalTotal) * 100);
      if (!amountInCents || amountInCents <= 0) { alert('❌ Invalid payment amount.'); setIsProcessing(false); return; }

      const browserId = (typeof window !== 'undefined' && (localStorage.getItem('browserId') || sessionStorage.getItem('browserId'))) || `browser_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;

      const response = await axios.post(`${API_URL}/api/payment`, {
        amount: amountInCents, id: paymentMethod.id, paymentMethodId: paymentMethod.id, browserId,
        items: cartItems.map(item => ({ id: item.id || item.productId || item.cartId, productId: item.productId || item.id || item.cartId, name: item.name, image: item.image, price: parseFloat(item.price) || 0, quantity: parseInt(item.quantity) || 1, size: item.size })),
        customerInfo: { firstName: formData.firstName, lastName: formData.lastName, email: formData.email, country: formData.country, streetAddress1: formData.streetAddress1, streetAddress2: formData.streetAddress2 || '', city: formData.city, state: formData.state, zip: formData.zip, phone: formData.phone, countryName: selCountry?.name || 'Unknown', stateName: selState?.name || formData.state },
        note: note || '', appliedCoupon,
      }, { headers: { 'Content-Type': 'application/json' } });

      if (response.data.success) {
        alert(`Payment Successful!\n\nPayment ID: ${response.data.paymentId}\nOrder ID: ${response.data.orderId}\nConfirmation: ${response.data.customerEmail || formData.email}\n\nThank you!`);
        setPaymentStatus({ status: 'success', paymentId: response.data.paymentId, amount: response.data.amount, customerEmail: response.data.customerEmail || formData.email, orderId: response.data.orderId });
        clearCart(); setAppliedCoupon(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (response.data.requiresAction && response.data.clientSecret) {
        const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(response.data.clientSecret);
        if (confirmError) {
          setPaymentStatus({ status: 'error', message: confirmError.message });
        } else if (paymentIntent.status === 'succeeded') {
          setPaymentStatus({ status: 'success', paymentId: paymentIntent.id, amount: paymentIntent.amount, customerEmail: formData.email, orderId: response.data.orderId });
          clearCart(); setAppliedCoupon(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setPaymentStatus({ status: 'error', message: `Payment failed: ${paymentIntent.status}` });
        }
      } else {
        setPaymentStatus({ status: 'error', message: response.data.message || 'Payment failed. Please try again.' });
      }
    } catch (serverError) {
      setPaymentStatus({ status: 'error', message: serverError.response?.data?.message || 'A server error occurred.' });
    }
    setIsProcessing(false);
  };

  if (paymentStatus?.status === 'success') {
    return (
      <div className="checkout-container">
        <div className="payment-success-message">
          <h2>🎉 Order Complete!</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Thank you for your purchase!</p>
          <div className="success-details-box">
            <p><strong>Payment ID:</strong> {paymentStatus.paymentId}</p>
            <p><strong>Order ID:</strong> {paymentStatus.orderId || 'N/A'}</p>
            <p><strong>Amount:</strong> ${(paymentStatus.amount / 100).toFixed(2)} USD</p>
            <p><strong>📧 Confirmation:</strong> {paymentStatus.customerEmail}</p>
            <p><strong>📅 Date:</strong> {new Date().toLocaleDateString()}</p>
          </div>
          <p style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '1.5rem' }}>A confirmation email has been sent.</p>
          <button className="continue-btn" onClick={() => router.push('/')}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <form className="checkout-form" onSubmit={handlePlaceOrder}>

        <div className="billing-details">
          <h1>Billing details</h1>
          <div className="form-row-split">
            <div className="form-group">
              <label htmlFor="firstName">First name *</label>
              <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleFormChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last name *</label>
              <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleFormChange} required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email address *</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleFormChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="country">Country / Region *</label>
            <select id="country" name="country" value={formData.country} onChange={handleFormChange} required>
              {allCountries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="streetAddress1">Street address *</label>
            <input type="text" id="streetAddress1" name="streetAddress1" placeholder="House number and street name" value={formData.streetAddress1} onChange={handleFormChange} required />
            <input type="text" id="streetAddress2" name="streetAddress2" placeholder="Apartment, suite, unit, etc. (optional)" value={formData.streetAddress2} onChange={handleFormChange} style={{ marginTop: '10px' }} />
          </div>
          <div className="form-group">
            <label htmlFor="city">Town / City *</label>
            <input type="text" id="city" name="city" value={formData.city} onChange={handleFormChange} required />
          </div>
          <div className="form-row-split">
            <div className="form-group">
              <label htmlFor="state">State / Province *</label>
              {billingStates.length > 0 ? (
                <select id="state" name="state" value={formData.state} onChange={handleFormChange} required>
                  <option value="">Select a state</option>
                  {billingStates.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                </select>
              ) : (
                <input type="text" id="state" name="state" value={formData.state} onChange={handleFormChange} placeholder="Enter state/province" required />
              )}
            </div>
            <div className="form-group">
              <label htmlFor="zip">ZIP Code *</label>
              <input type="text" id="zip" name="zip" value={formData.zip} onChange={handleFormChange} required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone *</label>
            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleFormChange} required />
          </div>
        </div>

        <div className="order-details">
          <div className="order-items">
            <h2>Your Order</h2>
            {cartItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', background: '#f8f9fa', borderRadius: '10px', color: '#6c757d' }}>
                <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>🛒 Your cart is empty</p>
                <p>Add some items to get started!</p>
              </div>
            ) : (
              cartItems.map(item => (
                <div key={item.cartId} className="checkout-cart-item">
                  <img src={item.image} alt={item.name} className="checkout-item-image" onError={e => { e.target.src = '/default-image.jpg'; }} />
                  <div className="checkout-item-details">
                    <h4>{item.name}</h4>
                    {item.size && <p>Size: {item.size}</p>}
                    <div className="checkout-quantity-controls">
                      <span>Qty:</span>
                      <button type="button" onClick={() => updateQuantity(item.cartId, -1)} disabled={item.quantity <= 1}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.cartId, 1)}>+</button>
                    </div>
                  </div>
                  <div className="checkout-item-price-section">
                    <p className="checkout-item-price">${(item.price * item.quantity).toFixed(2)}</p>
                    <button type="button" onClick={() => removeFromCart(item.cartId)} className="remove-item-btn">Remove</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="order-summary-box">
            <div className="order-summary-header">
              <div className="summary-icon-item" onClick={() => openModal('note')}><BsPencil /><span>Note</span></div>
              <div className="summary-icon-item" onClick={() => openModal('shipping')}><TbTruckDelivery /><span>Shipping</span></div>
              <div className="summary-icon-item" onClick={() => openModal('coupon')}><RiCoupon3Line /><span>Coupon</span></div>
            </div>
            <div className="order-summary-line"><span>Subtotal ({cartItems.length} items)</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="order-summary-line"><span>Shipping</span><span>${shippingCost.toFixed(2)}</span></div>
            <div className="order-summary-line"><span>Tax ({taxRate * 100}%)</span><span>${calculatedTax.toFixed(2)}</span></div>
            {appliedCoupon && (
              <div className="order-summary-line coupon-discount" style={{ color: '#28a745' }}>
                <span>💰 Discount ({appliedCoupon.code})</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>-${appliedCoupon.discountAmount.toFixed(2)}</span>
                  <button type="button" onClick={() => { setAppliedCoupon(null); alert('Coupon removed'); }} style={{ background: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}>Remove</button>
                </div>
              </div>
            )}
            <div className="order-summary-line total" style={{ borderTop: '2px solid #dee2e6', paddingTop: '1rem', marginTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
              <span>Total</span><span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="payment-information">
            <h2>Payment information</h2>
            <div className={`payment-method ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
              <input type="radio" id="card" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleFormChange} />
              <label htmlFor="card">💳 Credit / Debit Card</label>
            </div>
            {formData.paymentMethod === 'card' && (
              <div className="card-details-form">
                <div className="form-group">
                  <label>Card Details</label>
                  <div className="card-input-container">
                    <div className="card-input-row"><CardNumberElement options={CARD_ELEMENT_OPTIONS} /></div>
                    <div className="card-input-row-split">
                      <div className="card-input-half"><CardExpiryElement options={CARD_ELEMENT_OPTIONS} /></div>
                      <div className="card-input-half"><CardCvcElement options={CARD_ELEMENT_OPTIONS} /></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {paymentStatus?.status === 'error' && (
              <div className="payment-error-message" style={{ background: '#f8d7da', color: '#721c24', padding: '1rem', borderRadius: '5px', margin: '1rem 0', border: '1px solid #f5c6cb' }}>
                ❌ {paymentStatus.message}
              </div>
            )}
            <p className="privacy-notice">
              <CiLock /> Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">privacy policy</a>.
            </p>
            <button type="submit" className="place-order-btn" disabled={isProcessing || !stripe || !elements || cartItems.length === 0} style={{ opacity: (isProcessing || !stripe || !elements || cartItems.length === 0) ? 0.6 : 1, cursor: (isProcessing || !stripe || !elements || cartItems.length === 0) ? 'not-allowed' : 'pointer' }}>
              {isProcessing ? '🔄 Processing Payment...' : cartItems.length === 0 ? 'Add items to cart' : !stripe || !elements ? 'Loading payment system...' : `💳 Place order $${finalTotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      </form>

      {activeModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>×</button>
            {activeModal === 'note' && (
              <form onSubmit={handleSaveNote}>
                <h2>📝 Add a Note</h2>
                <textarea className="modal-textarea" value={note} onChange={e => setNote(e.target.value)} placeholder="Add special instructions..." rows="5" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '5px', resize: 'vertical' }} />
                <button type="submit" className="modal-btn">Save Note</button>
              </form>
            )}
            {activeModal === 'shipping' && (
              <form onSubmit={handleCalculateShipping}>
                <h2>🚛 Calculate Shipping</h2>
                <select name="country" value={shippingInfo.country} onChange={handleShippingInfoChange} className="modal-input" style={{ marginBottom: '1rem' }}>
                  {allCountries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                </select>
                {shippingModalStates.length > 0 ? (
                  <select name="state" value={shippingInfo.state} onChange={handleShippingInfoChange} className="modal-input" style={{ marginBottom: '1rem' }}>
                    <option value="">Select a state</option>
                    {shippingModalStates.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                  </select>
                ) : (
                  <input type="text" name="state" value={shippingInfo.state} onChange={handleShippingInfoChange} placeholder="State/Province" className="modal-input" style={{ marginBottom: '1rem' }} />
                )}
                <input type="text" name="city" value={shippingInfo.city} onChange={handleShippingInfoChange} placeholder="City" className="modal-input" style={{ marginBottom: '1rem' }} />
                <input type="text" name="zip" value={shippingInfo.zip} onChange={handleShippingInfoChange} placeholder="ZIP / Postal Code" className="modal-input" style={{ marginBottom: '1rem' }} />
                <button type="submit" className="modal-btn">Update Shipping</button>
              </form>
            )}
            {activeModal === 'coupon' && (
              <form onSubmit={handleApplyCoupon}>
                <h2>🎫 Enter Coupon Code</h2>
                <input type="text" className="modal-input" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter your coupon code" disabled={couponLoading} style={{ marginBottom: '1rem', textTransform: 'uppercase' }} />
                {activeCoupons.length > 0 && (
                  <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '5px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    <p><strong>Available Coupons:</strong></p>
                    {activeCoupons.map(c => <p key={c.code}>• {c.code} - {c.discountType === 'percentage' ? `${c.discountValue}% off` : `$${c.discountValue} off`}{c.description && ` (${c.description})`}</p>)}
                  </div>
                )}
                <button type="submit" className="modal-btn" disabled={couponLoading}>{couponLoading ? 'Validating...' : 'Apply Coupon'}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}