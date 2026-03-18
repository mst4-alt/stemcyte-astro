import { useState } from 'react';

/*
 * PaymentForm — Client payment form with credit card formatting.
 *
 * Props:
 *   onSubmit: function(formData) — called on form submit (defaults to alert)
 */

const styles = {
  formCard: {
    background: '#fff',
    borderRadius: 16,
    padding: 40,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
    maxWidth: 640,
    margin: '0 auto',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: '#6C1A55',
    marginBottom: 16,
    marginTop: 32,
  },
  sectionLabelFirst: {
    marginTop: 0,
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 12,
  },
  formRowSingle: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    marginBottom: 12,
  },
  cardRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 12,
    marginBottom: 12,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: '#6B665D',
    marginBottom: 4,
    fontFamily: "'Lato', sans-serif",
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #E8E2DC',
    borderRadius: 8,
    fontFamily: "'Lato', sans-serif",
    fontSize: 14,
    color: '#2C2A26',
    background: '#fff',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #E8E2DC',
    borderRadius: 8,
    fontFamily: "'Lato', sans-serif",
    fontSize: 14,
    color: '#2C2A26',
    background: '#fff',
    appearance: 'none',
    boxSizing: 'border-box',
  },
  amountWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  dollar: {
    position: 'absolute',
    left: 16,
    fontSize: 14,
    color: '#8A857A',
    fontWeight: 700,
    pointerEvents: 'none',
  },
  amountInput: {
    width: '100%',
    padding: '12px 16px 12px 28px',
    border: '1px solid #E8E2DC',
    borderRadius: 8,
    fontFamily: "'Lato', sans-serif",
    fontSize: 14,
    color: '#2C2A26',
    background: '#fff',
    boxSizing: 'border-box',
  },
  secureNote: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    fontSize: 12,
    color: '#B0AB9E',
    lineHeight: 1.5,
  },
  secureIcon: {
    width: 16,
    height: 16,
    flexShrink: 0,
  },
  submitRow: {
    marginTop: 32,
    textAlign: 'center',
  },
  btnSubmit: {
    background: '#6C1A55',
    color: '#fff',
    padding: '16px 48px',
    borderRadius: 100,
    fontSize: 15,
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Lato', sans-serif",
    transition: 'background 0.2s',
    display: 'inline-block',
  },
  helpBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    background: '#F3F0F8',
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 32,
    maxWidth: 640,
    margin: '0 auto 32px',
  },
  helpIcon: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: '#6C1A55',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  helpText: {
    flex: 1,
  },
  helpH3: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 2,
    margin: 0,
  },
  helpP: {
    fontSize: 13,
    color: '#8A857A',
    margin: 0,
    lineHeight: 1.5,
  },
  helpLink: {
    color: '#6C1A55',
    textDecoration: 'none',
    fontWeight: 600,
  },
};

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
    <div>
      <div style={styles.helpBox}>
        <div style={styles.helpIcon}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        <div style={styles.helpText}>
          <h3 style={styles.helpH3}>Questions about your account?</h3>
          <p style={styles.helpP}>
            Contact our billing team at <a href="mailto:AR@stemcyte.com" style={styles.helpLink}>AR@stemcyte.com</a> or call <a href="tel:6266462520" style={styles.helpLink}>(626) 646-2520</a>.
          </p>
        </div>
      </div>

      <div style={styles.formCard}>
        <form onSubmit={handleSubmit}>
          <div style={{ ...styles.sectionLabel, ...styles.sectionLabelFirst }}>Account information</div>

          <div style={styles.formRow}>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="pay-first">First name</label>
              <input style={styles.input} type="text" id="pay-first" placeholder="Jane" required />
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="pay-last">Last name</label>
              <input style={styles.input} type="text" id="pay-last" placeholder="Smith" required />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="pay-email">Email</label>
              <input style={styles.input} type="email" id="pay-email" placeholder="jane@email.com" required />
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="pay-phone">Phone</label>
              <input style={styles.input} type="tel" id="pay-phone" placeholder="(555) 555-5555" required />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="pay-account">Account or invoice number (if known)</label>
              <input style={styles.input} type="text" id="pay-account" placeholder="e.g. SC-10045 or INV-2026-001" />
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="pay-reason">Payment reason</label>
              <select style={styles.select} id="pay-reason" required defaultValue="">
                <option value="" disabled>Select…</option>
                <option value="annual-storage">Annual storage fee</option>
                <option value="processing">Processing fee</option>
                <option value="installment">Installment payment</option>
                <option value="add-on">Add-on service</option>
                <option value="balance">Outstanding balance</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div style={styles.sectionLabel}>Payment details</div>

          <div style={styles.formRowSingle}>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="pay-amount">Payment amount</label>
              <div style={styles.amountWrap}>
                <span style={styles.dollar}>$</span>
                <input style={styles.amountInput} type="number" id="pay-amount" placeholder="0.00" min="1" step="0.01" required />
              </div>
            </div>
          </div>

          <div style={styles.formRowSingle}>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="pay-card">Card number</label>
              <input
                style={styles.input}
                type="text"
                id="pay-card"
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                required
                value={cardNumber}
                onChange={handleCardChange}
              />
            </div>
          </div>
          <div style={styles.cardRow}>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="pay-name">Name on card</label>
              <input style={styles.input} type="text" id="pay-name" placeholder="Jane Smith" required />
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="pay-exp">Expiry</label>
              <input
                style={styles.input}
                type="text"
                id="pay-exp"
                placeholder="MM/YY"
                maxLength="5"
                required
                value={expiry}
                onChange={handleExpiryChange}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="pay-cvc">CVC</label>
              <input style={styles.input} type="text" id="pay-cvc" placeholder="123" maxLength="4" required />
            </div>
          </div>

          <div style={styles.secureNote}>
            <svg style={styles.secureIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Your payment information is encrypted and secure. This form will be replaced by Stripe checkout.</span>
          </div>

          <div style={styles.submitRow}>
            <button type="submit" style={styles.btnSubmit}>Submit payment</button>
          </div>
        </form>
      </div>
    </div>
  );
}
