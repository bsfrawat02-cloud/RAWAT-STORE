import { CardProduct, OrderRecord, UserAccount } from '../types';

/**
 * Copies plain text to clipboard safely with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.warn('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Downloads a luxury digital card pass (.html or printable asset)
 */
export function downloadDigitalCard(
  card: CardProduct,
  order?: OrderRecord | null,
  user?: UserAccount | null
) {
  const cardNumber = card.cardNumber || (card.maskedIdentifier ? card.maskedIdentifier.replace(/•/g, '4') : '4532 8912 3456 4821');
  const expDate = card.expDate || `${card.expMonth || '12'}/${card.expYear ? card.expYear.slice(-2) : '29'}`;
  const cvv = card.cvv || '821';
  const cardPin = card.cardPin || '4821';
  const limit = card.limit ? `₹${card.limit.toLocaleString('en-IN')}` : '₹1,50,000';
  const cardHolder = card.cardHolder || user?.fullName || (user ? `@${user.username}` : 'RAWAT VIP HOLDER');
  const bankName = card.bankName || 'RAWAT RESERVE BANK';
  const orderId = order ? (order.orderNumber.startsWith('RWT-') ? order.orderNumber : `RWT-${order.orderNumber}`) : `RWT-CARD-${card.id.slice(-4).toUpperCase()}`;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${card.name} - Digital Vault Pass</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@400;600;800&family=Cinzel:wght@700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #06070a;
      color: #f1f5f9;
      font-family: 'Space Grotesk', -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .container {
      max-width: 520px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .card-wrap {
      perspective: 1000px;
      width: 100%;
    }
    .card-face {
      width: 100%;
      aspect-ratio: 1.586 / 1;
      border-radius: 20px;
      background: linear-gradient(135deg, #181926 0%, #0d0e15 50%, #050608 100%);
      border: 2px solid rgba(168, 85, 247, 0.4);
      box-shadow: 0 25px 50px -12px rgba(168, 85, 247, 0.25), 0 0 30px rgba(0,0,0,0.8);
      position: relative;
      overflow: hidden;
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .card-face::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 60% 30%, rgba(255,255,255,0.12) 0%, transparent 60%);
      pointer-events: none;
    }
    .top-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      z-index: 2;
    }
    .brand-title {
      font-family: 'Cinzel', serif;
      font-size: 16px;
      letter-spacing: 3px;
      color: #fff;
      font-weight: 700;
    }
    .brand-sub {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      letter-spacing: 2px;
      color: #a855f7;
      text-transform: uppercase;
    }
    .tier-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      padding: 4px 10px;
      border-radius: 999px;
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.4);
      color: #e9d5ff;
      font-weight: 600;
      text-transform: uppercase;
    }
    .chip-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 2;
      margin: 8px 0;
    }
    .chip {
      width: 44px;
      height: 34px;
      border-radius: 6px;
      background: linear-gradient(135deg, #d97706, #fbbf24, #b45309);
      border: 1px solid #fef08a;
      box-shadow: inset 0 0 4px rgba(0,0,0,0.4);
      position: relative;
    }
    .chip::after {
      content: '';
      position: absolute;
      inset: 4px;
      border: 1px solid rgba(0,0,0,0.3);
      border-radius: 3px;
    }
    .limit-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #34d399;
      padding: 4px 10px;
      border-radius: 8px;
      font-weight: 700;
    }
    .card-number {
      font-family: 'JetBrains Mono', monospace;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 3px;
      color: #ffffff;
      text-shadow: 0 2px 4px rgba(0,0,0,0.8);
      z-index: 2;
    }
    .bottom-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      z-index: 2;
      border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 10px;
    }
    .info-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .info-val {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: #f8fafc;
    }
    .info-mono {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 700;
      color: #c084fc;
    }
    .details-box {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 18px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .detail-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .btn-row {
      display: flex;
      gap: 12px;
    }
    .btn {
      flex: 1;
      padding: 12px;
      border-radius: 12px;
      border: none;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      text-align: center;
      text-decoration: none;
      display: inline-block;
    }
    .btn-primary {
      background: #ffffff;
      color: #000000;
    }
    .btn-secondary {
      background: rgba(255,255,255,0.1);
      color: #ffffff;
      border: 1px solid rgba(255,255,255,0.2);
    }
    @media print {
      body { background: #fff; color: #000; }
      .btn-row { display: none; }
      .card-face { box-shadow: none; border-color: #000; }
      .details-box { border-color: #ddd; color: #000; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card-wrap">
      <div class="card-face">
        <div class="top-row">
          <div>
            <div class="brand-title">RAWAT CARD STORE</div>
            <div class="brand-sub">${bankName}</div>
          </div>
          <div class="tier-badge">${card.rarity || 'RARE'} • ${card.tier}</div>
        </div>

        <div class="chip-row">
          <div class="chip"></div>
          <div class="limit-tag">LIMIT: ${limit}</div>
        </div>

        <div class="card-number">${cardNumber}</div>

        <div class="bottom-row">
          <div>
            <div class="info-label">CARDHOLDER</div>
            <div class="info-val">${cardHolder}</div>
          </div>
          <div>
            <div class="info-label">EXPIRES</div>
            <div class="info-mono">${expDate}</div>
          </div>
          <div>
            <div class="info-label">CVV</div>
            <div class="info-mono">${cvv}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="details-box">
      <div class="detail-row">
        <span style="color: #94a3b8;">Asset Name</span>
        <span style="color: #fff; font-weight: 700;">${card.name}</span>
      </div>
      <div class="detail-row">
        <span style="color: #94a3b8;">Full Card Number</span>
        <span style="color: #c084fc; font-weight: 700;">${cardNumber}</span>
      </div>
      <div class="detail-row">
        <span style="color: #94a3b8;">Expiry (MM/YY)</span>
        <span style="color: #fff;">${expDate}</span>
      </div>
      <div class="detail-row">
        <span style="color: #94a3b8;">CVV / Security Code</span>
        <span style="color: #fff;">${cvv}</span>
      </div>
      <div class="detail-row">
        <span style="color: #94a3b8;">ATM PIN</span>
        <span style="color: #fff;">${cardPin}</span>
      </div>
      <div class="detail-row">
        <span style="color: #94a3b8;">Card Limit</span>
        <span style="color: #34d399; font-weight: 700;">${limit}</span>
      </div>
      <div class="detail-row">
        <span style="color: #94a3b8;">Network / Issuer</span>
        <span style="color: #fff;">${card.network || 'RAWAT'} • ${bankName}</span>
      </div>
      <div class="detail-row">
        <span style="color: #94a3b8;">Pass Token ID</span>
        <span style="color: #a855f7;">${orderId}</span>
      </div>
    </div>

    <div class="btn-row">
      <button class="btn btn-primary" onclick="window.print()">Print / Save PDF</button>
      <button class="btn btn-secondary" onclick="window.close()">Close Window</button>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    // If popup blocked, download file directly
    const a = document.createElement('a');
    a.href = url;
    a.download = `RAWAT-CARD-${card.name.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

/**
 * Downloads a luxury official tax invoice & purchase receipt
 */
export function downloadReceiptHtml(
  order: OrderRecord,
  card?: CardProduct | null,
  user?: UserAccount | null
) {
  const orderId = order.orderNumber.startsWith('RWT-') ? order.orderNumber : `RWT-${order.orderNumber}`;
  const price = `₹${order.finalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const originalPrice = `₹${order.originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const discount = order.discountAmount ? `₹${order.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00';
  const customerName = user?.fullName || (user ? `@${user.username}` : (order.username ? `@${order.username}` : 'Customer'));
  const customerEmail = user?.email || 'customer@rawatcards.store';
  const cardNumber = order.cardNumber || card?.cardNumber || order.maskedIdentifier || '•••• •••• •••• 4821';
  const limit = (order.limit || card?.limit) ? `₹${(order.limit || card?.limit)!.toLocaleString('en-IN')}` : '₹1,50,000';
  const expDate = order.expDate || card?.expDate || `${card?.expMonth || '12'}/${card?.expYear ? card?.expYear.slice(-2) : '29'}`;
  const cvv = order.cvv || card?.cvv || '821';

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt ${orderId} - RAWAT CARD STORE</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@400;600;700&family=Cinzel:wght@700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #090a10;
      color: #f1f5f9;
      font-family: 'Space Grotesk', -apple-system, sans-serif;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
    }
    .receipt {
      max-width: 600px;
      width: 100%;
      background: #11121c;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 24px;
      padding: 36px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 20px;
    }
    .brand-name {
      font-family: 'Cinzel', serif;
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 2px;
    }
    .brand-sub {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #a855f7;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .receipt-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #10b981;
      font-weight: 700;
      text-transform: uppercase;
      text-align: right;
    }
    .order-id {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      color: #ffffff;
      font-weight: 700;
      text-align: right;
      margin-top: 2px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      background: rgba(255,255,255,0.02);
      padding: 16px;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .meta-item p:first-child {
      color: #64748b;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 2px;
    }
    .meta-item p:last-child {
      color: #f1f5f9;
      font-weight: 600;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
    }
    .items-table th {
      text-align: left;
      color: #64748b;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .items-table td {
      padding: 14px 0;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      color: #f8fafc;
    }
    .total-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 16px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      color: #94a3b8;
    }
    .total-row.grand {
      font-size: 16px;
      font-weight: 700;
      color: #10b981;
      margin-top: 4px;
      padding-top: 8px;
      border-top: 1px dashed rgba(255,255,255,0.15);
    }
    .card-specs {
      background: linear-gradient(135deg, rgba(168,85,247,0.1), rgba(56,189,248,0.05));
      border: 1px solid rgba(168,85,247,0.3);
      border-radius: 16px;
      padding: 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .spec-title {
      font-size: 10px;
      color: #c084fc;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 1.5px;
      margin-bottom: 4px;
    }
    .footer {
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #64748b;
      line-height: 1.6;
    }
    .btn-row {
      display: flex;
      gap: 12px;
      margin-top: 10px;
    }
    .btn {
      flex: 1;
      padding: 12px;
      border-radius: 12px;
      border: none;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      text-align: center;
    }
    .btn-primary {
      background: #ffffff;
      color: #000000;
    }
    .btn-secondary {
      background: rgba(255,255,255,0.08);
      color: #ffffff;
      border: 1px solid rgba(255,255,255,0.15);
    }
    @media print {
      body { background: #fff; color: #000; padding: 0; }
      .receipt { background: #fff; color: #000; border: none; box-shadow: none; padding: 20px; }
      .brand-name, .order-id, .total-row.grand, .items-table td { color: #000 !important; }
      .btn-row { display: none; }
      .card-specs { border-color: #ddd; background: #f8fafc; color: #000; }
      .meta-grid { border-color: #ddd; background: #f8fafc; color: #000; }
      .meta-item p:last-child { color: #000; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div>
        <div class="brand-name">RAWAT CARD STORE</div>
        <div class="brand-sub">Vault Asset Certificate</div>
      </div>
      <div>
        <div class="receipt-title">PAYMENT COMPLETED</div>
        <div class="order-id">${orderId}</div>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-item">
        <p>Customer Name</p>
        <p>${customerName}</p>
      </div>
      <div class="meta-item">
        <p>Customer Email</p>
        <p>${customerEmail}</p>
      </div>
      <div class="meta-item">
        <p>Purchase Timestamp</p>
        <p>${order.purchaseDate}</p>
      </div>
      <div class="meta-item">
        <p>Transaction Reference</p>
        <p>${order.transactionRef}</p>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Item Description</th>
          <th style="text-align: center;">Tier</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${order.cardName}</strong><br>
            <span style="color: #94a3b8; font-size: 10px;">Token: ${order.vaultTokenId}</span>
          </td>
          <td style="text-align: center;">${order.cardTier}</td>
          <td style="text-align: right; font-weight: 700;">${price}</td>
        </tr>
      </tbody>
    </table>

    <div class="card-specs">
      <div class="spec-title">Allocated Card Credentials (Customer Vault)</div>
      <div style="display: flex; justify-content: space-between;">
        <span>Card Number:</span>
        <strong style="color: #fff;">${cardNumber}</strong>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>Expiry & CVV:</span>
        <span>${expDate} • CVV: ${cvv}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>Credit / Spending Limit:</span>
        <span style="color: #34d399; font-weight: 700;">${limit}</span>
      </div>
    </div>

    <div class="total-section">
      <div class="total-row">
        <span>Original Price:</span>
        <span>${originalPrice}</span>
      </div>
      ${order.discountAmount ? `<div class="total-row"><span>Discount (${order.couponUsed || 'Promo'}):</span><span style="color: #34d399;">-${discount}</span></div>` : ''}
      <div class="total-row">
        <span>Taxes & Vault Protocol Fees:</span>
        <span>₹0.00 (Included)</span>
      </div>
      <div class="total-row grand">
        <span>Total Paid:</span>
        <span>${price}</span>
      </div>
    </div>

    <div class="footer">
      <p>Cryptographically secured by RAWAT Store Vault protocol.</p>
      <p>Certificate Token ID: ${order.vaultTokenId} • Status: VERIFIED</p>
    </div>

    <div class="btn-row">
      <button class="btn btn-primary" onclick="window.print()">Print Official Receipt</button>
      <button class="btn btn-secondary" onclick="window.close()">Close Window</button>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `RAWAT-RECEIPT-${orderId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
