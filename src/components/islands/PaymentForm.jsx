import { useState } from 'react';

/*
 * PaymentForm — Client payment form with credit card formatting.
 * Uses placeholder-as-label pattern matching PricingForm.
 */

const CSS = `
.cpf-wrap{max-width:640px;margin:0 auto}
.cpf-help{display:flex;align-items:center;gap:16px;background:#F3F0F8;border-radius:12px;padding:20px 24px;margin-bottom:32px}
.cpf-help-icon{width:40px;height:40px;border-radius:50%;background:#6C1A55;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.cpf-help h3{font-size:14px;font-weight:700;margin:0 0 2px}
.cpf-help p{font-size:13px;color:#8A857A;margin:0;line-height:1.5}
.cpf-help a{color:#6C1A55;text-decoration:none;font-weight:600}
.cpf-help a:hover{color:#8B3572}
.cpf-card{background:#fff;border-radius:16px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 1px 2px rgba(0,0,0,0.03)}
.cpf-sec{font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#6C1A55;margin-bottom:16px;margin-top:32px}
.cpf-sec:first-child{margin-top:0}
.cpf-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
.cpf-row-single{margin-bottom:12px}
.cpf-row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px}
.cpf-input{width:100%;padding:16px;border:1px solid #E8E2DC;border-radius:10px;font-family:'Lato',sans-serif;font-size:14px;outline:none;background:#fff;transition:border-color 0.2s;box-sizing:border-box;color:#2C2A26}
.cpf-input::placeholder{color:#8A857A;font-weight:400;font-size:14px}
.cpf-input:focus::placeholder{opacity:0}
.cpf-input:focus{border-color:#6C1A55}
.cpf-select{width:100%;padding:16px;border:1px solid #E8E2DC;border-radius:10px;font-family:'Lato',sans-serif;font-size:14px;outline:none;background:#fff;transition:border-color 0.2s;box-sizing:border-box;color:#8A857A;appearance:none;cursor:pointer}
.cpf-select:focus{border-color:#6C1A55}
.cpf-amount-wrap{position:relative}
.cpf-amount-dollar{position:absolute;left:16px;top:50%;transform:translateY(-50%);font-size:14px;color:#8A857A;font-weight:700;pointer-events:none}
.cpf-amount-input{width:100%;padding:16px 16px 16px 28px;border:1px solid #E8E2DC;border-radius:10px;font-family:'Lato',sans-serif;font-size:14px;outline:none;background:#fff;transition:border-color 0.2s;box-sizing:border-box;color:#2C2A26}
.cpf-amount-input::placeholder{color:#8A857A;font-weight:400}
.cpf-amount-input:focus::placeholder{opacity:0}
.cpf-amount-input:focus{border-color:#6C1A55}
.cpf-secure{display:flex;align-items:center;gap:8px;margin-top:16px;font-size:12px;color:#B0AB9E;line-height:1.5}
.cpf-secure svg{width:16px;height:16px;flex-shrink:0}
.cpf-submit{margin-top:32px;text-align:center}
.cpf-btn{background:#6C1A55;color:#fff;padding:16px 48px;border-radius:100px;font-size:15px;font-weight:700;border:none;cursor:pointer;font-family:'Lato',sans-serif;transition:background 0.2s;display:inline-block}
.cpf-btn:hover{background:#8B3572}
@media(max-width:600px){.cpf-card{padding:24px}.cpf-row{grid-template-columns:1fr}.cpf-row-3{grid-template-columns:1fr}}
`;

export default function PaymentForm({ onSubmit }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');

  function handleCardChange(e) {
    const v = e.target.value.replace(/\D/g, '').substring(0, 16);
    setCardNumber(v.replace(/(\d{4})(?=\d)/g, '$1 '));
  }

  function handleExpiryChange(e) {
    let v = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2);
    setExpiry(v);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ cardNumber, expiry });
    } else {
      alert('This is a placeholder. Stripe payment integration coming soon. Please contact AR@stemcyte.com for payment assistance.');
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="cpf-wrap">
        <div className="cpf-help">
          <div className="cpf-help-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <h3>Questions about your account?</h3>
            <p>Contact our billing team at <a href="mailto:AR@stemcyte.com">AR@stemcyte.com</a> or call <a href="tel:6266462520">(626) 646-2520</a>.</p>
          </div>
        </div>

        <div className="cpf-card">
          <form onSubmit={handleSubmit}>
            <div className="cpf-sec" style={{ marginTop: 0 }}>Account information</div>

            <div className="cpf-row">
              <div><input className="cpf-input" type="text" placeholder="First name" autoComplete="given-name" required /></div>
              <div><input className="cpf-input" type="text" placeholder="Last name" autoComplete="family-name" required /></div>
            </div>
            <div className="cpf-row">
              <div><input className="cpf-input" type="email" placeholder="Email address" autoComplete="email" required /></div>
              <div><input className="cpf-input" type="tel" placeholder="Phone number" autoComplete="tel" required /></div>
            </div>
            <div className="cpf-row">
              <div><input className="cpf-input" type="text" placeholder="Account or invoice number" /></div>
              <div>
                <select className="cpf-select" required defaultValue="">
                  <option value="" disabled>Payment reason</option>
                  <option value="annual-storage">Annual storage fee</option>
                  <option value="processing">Processing fee</option>
                  <option value="installment">Installment payment</option>
                  <option value="add-on">Add-on service</option>
                  <option value="balance">Outstanding balance</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="cpf-sec">Payment details</div>

            <div className="cpf-row-single">
              <div className="cpf-amount-wrap">
                <span className="cpf-amount-dollar">$</span>
                <input className="cpf-amount-input" type="number" placeholder="Payment amount" min="1" step="0.01" required />
              </div>
            </div>

            <div className="cpf-row-single">
              <input
                className="cpf-input"
                type="text"
                placeholder="Card number"
                maxLength="19"
                required
                value={cardNumber}
                onChange={handleCardChange}
                autoComplete="cc-number"
              />
            </div>
            <div className="cpf-row-3">
              <div><input className="cpf-input" type="text" placeholder="Name on card" autoComplete="cc-name" required /></div>
              <div>
                <input
                  className="cpf-input"
                  type="text"
                  placeholder="MM/YY"
                  maxLength="5"
                  required
                  value={expiry}
                  onChange={handleExpiryChange}
                  autoComplete="cc-exp"
                />
              </div>
              <div><input className="cpf-input" type="text" placeholder="CVC" maxLength="4" required autoComplete="cc-csc" /></div>
            </div>

            <div className="cpf-secure">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Your payment information is encrypted and secure. This form will be replaced by Stripe checkout.</span>
            </div>

            <div className="cpf-submit">
              <button type="submit" className="cpf-btn">Submit payment</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
