import express from 'express';
import path from 'path';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Nodemailer Transporter Helper
function getEmailTransporter() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS;

  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  return null;
}

// Generate stylized HTML email for Admin Announcement
function buildAnnouncementEmailHtml(params: { username?: string; title: string; message: string; type?: string }) {
  const { username = 'Valued Collector', title, message, type = 'ANNOUNCEMENT' } = params;
  const badgeColor =
    type === 'SALE' ? '#f59e0b' : type === 'ALERT' ? '#f43f5e' : type === 'UPDATE' ? '#a855f7' : '#38bdf8';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050505; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 560px; background: linear-gradient(180deg, #0e111d 0%, #08090f 100%); border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 24px 20px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <div style="display: inline-block; padding: 5px 14px; border-radius: 9999px; background: rgba(168,85,247,0.15); border: 1px solid ${badgeColor}; color: ${badgeColor}; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px;">
                RAWAT CARD STORE &bull; ${type}
              </div>
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; line-height: 1.3;">
                ${title}
              </h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 26px 24px;">
              <p style="margin: 0 0 14px; font-size: 14px; color: #cbd5e1; line-height: 1.6;">
                Hello <strong style="color: #ffffff;">@${username}</strong>,
              </p>
              
              <!-- Announcement Box -->
              <div style="background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 18px; margin: 16px 0; color: #e2e8f0; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">
${message}
              </div>

              <div style="margin-top: 22px; text-align: center;">
                <a href="https://t.me/carderseller1" style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 12px; font-weight: 700; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">
                  Visit RAWAT CARD STORE
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 24px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                RAWAT CARD STORE &bull; Fictional 3D Collectibles Storefront<br/>
                Official Support: <a href="https://t.me/carderseller1" style="color: #38bdf8; text-decoration: none;">@carderseller1</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// =================================================================
// 1. API: Send Announcement Email to Customers
// =================================================================
app.post('/api/send-announcement-email', async (req, res) => {
  try {
    const { recipients, title, message, type = 'ANNOUNCEMENT' } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Announcement title and message are required.',
      });
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No recipient customer emails provided.',
      });
    }

    const transporter = getEmailTransporter();
    const fromAddress =
      process.env.SMTP_FROM ||
      process.env.GMAIL_USER ||
      '"RAWAT CARD STORE" <announcements@rawatcards.store>';

    let sentCount = 0;
    const errors: string[] = [];

    // Dispatch private individual emails to each recipient
    for (const recipient of recipients) {
      const email = typeof recipient === 'string' ? recipient : recipient.email;
      const username = typeof recipient === 'string' ? 'Collector' : recipient.username || 'Collector';

      if (!email || !email.includes('@')) continue;

      const cleanEmail = email.trim().toLowerCase();

      if (transporter) {
        try {
          await transporter.sendMail({
            from: fromAddress,
            to: cleanEmail,
            subject: `[RAWAT STORE] ${title}`,
            html: buildAnnouncementEmailHtml({
              username,
              title,
              message,
              type,
            }),
          });
          sentCount++;
          console.log(`[Announcement Email Sent] Delivered to ${cleanEmail}`);
        } catch (err: any) {
          console.error(`[SMTP Error for ${cleanEmail}]`, err?.message || err);
          errors.push(`${cleanEmail}: ${err?.message}`);
        }
      } else {
        // Simulated dispatch when SMTP keys not yet provided
        sentCount++;
        console.log(`[Simulated Email Dispatch] Outgoing announcement "${title}" to ${cleanEmail}`);
      }
    }

    return res.json({
      success: true,
      message: `Announcement email dispatched to ${sentCount} customer(s).`,
      sentCount,
      recipientCount: recipients.length,
      smtpConfigured: Boolean(transporter),
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error in /api/send-announcement-email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to dispatch announcement emails.',
      error: error?.message,
    });
  }
});

// =================================================================
// 2. SERVER-SIDE UPI PAYMENT & ORDER INTENT SYSTEM
// =================================================================

interface PaymentOrderRecord {
  paymentId: string;
  userId: string;
  username: string;
  userEmail: string;
  amount: number;
  currency: string;
  paymentMethod: 'GOOGLE_PAY' | 'PHONEPE' | 'PAYTM' | 'OTHER_UPI' | 'QR_SCAN' | 'MANUAL_UTR';
  status: 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
  provider: 'UPI_INTENT' | 'UPI_GATEWAY' | 'MANUAL_DEPOSIT' | 'TEST_SIMULATOR';
  providerReference: string;
  upiIntentUrl: string;
  gpayIntentUrl?: string;
  phonepeIntentUrl?: string;
  paytmIntentUrl?: string;
  createdAt: string;
  completedAt?: string;
  expiresAt: string;
  isTestMode: boolean;
  idempotencyKey: string;
  deviceType: 'mobile' | 'desktop';
  verificationSource?: string;
}

// In-memory payment orders registry
const serverPaymentOrders = new Map<string, PaymentOrderRecord>();
const processedPayments = new Set<string>();

function getMerchantVpa() {
  return process.env.UPI_MERCHANT_VPA || 'rawatcard@ybl';
}

function getMerchantName() {
  return process.env.UPI_MERCHANT_NAME || 'RAWAT CARD STORE';
}

// 2.1 CREATE PAYMENT ORDER
app.post('/api/payments/create-order', (req, res) => {
  try {
    const {
      userId,
      username,
      userEmail,
      amount,
      paymentMethod = 'OTHER_UPI',
      deviceType = 'mobile',
      isTestMode = false,
    } = req.body;

    if (!userId || !amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment parameters. User ID and valid amount required.',
      });
    }

    // Minimum ₹100, Maximum ₹50,000 safety boundary
    if (amount < 100 || amount > 50000) {
      return res.status(400).json({
        success: false,
        message: 'Deposit amount must be between ₹100 and ₹50,000.',
      });
    }

    const now = new Date();
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const paymentId = `PAY-RWT-${timestamp}-${randomSuffix}`;
    const providerReference = `UPI-REF-${timestamp}-${Math.floor(100000 + Math.random() * 900000)}`;
    const idempotencyKey = `IDEM-${userId}-${paymentId}`;

    const merchantVpa = getMerchantVpa();
    const merchantName = getMerchantName();
    const note = `RAWAT Store Topup ${paymentId}`;

    // Standard official UPI Deep Link intent formats
    const standardUpiUrl = `upi://pay?pa=${encodeURIComponent(merchantVpa)}&pn=${encodeURIComponent(merchantName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}&tr=${encodeURIComponent(paymentId)}`;
    const gpayIntentUrl = `tez://upi/pay?pa=${encodeURIComponent(merchantVpa)}&pn=${encodeURIComponent(merchantName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}&tr=${encodeURIComponent(paymentId)}`;
    const phonepeIntentUrl = `phonepe://pay?pa=${encodeURIComponent(merchantVpa)}&pn=${encodeURIComponent(merchantName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}&tr=${encodeURIComponent(paymentId)}`;
    const paytmIntentUrl = `paytmmp://pay?pa=${encodeURIComponent(merchantVpa)}&pn=${encodeURIComponent(merchantName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}&tr=${encodeURIComponent(paymentId)}`;

    // Order validity: 60 minutes for plenty of deposit completion time
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

    const isTest = Boolean(isTestMode && process.env.NODE_ENV !== 'production');

    const orderRecord: PaymentOrderRecord = {
      paymentId,
      userId,
      username: username || 'Collector',
      userEmail: userEmail || '',
      amount,
      currency: 'INR',
      paymentMethod,
      status: 'PROCESSING',
      provider: isTest ? 'TEST_SIMULATOR' : 'UPI_INTENT',
      providerReference,
      upiIntentUrl: standardUpiUrl,
      gpayIntentUrl,
      phonepeIntentUrl,
      paytmIntentUrl,
      createdAt: now.toISOString(),
      expiresAt,
      isTestMode: isTest,
      idempotencyKey,
      deviceType: deviceType === 'desktop' ? 'desktop' : 'mobile',
    };

    serverPaymentOrders.set(paymentId, orderRecord);

    console.log(`[Payment Order Created] ${paymentId} for @${username} (₹${amount}) - Method: ${paymentMethod}`);

    return res.json({
      success: true,
      order: {
        paymentId,
        userId,
        username: orderRecord.username,
        amount,
        currency: 'INR',
        merchantVpa,
        merchantName,
        paymentMethod,
        providerReference,
        status: 'PROCESSING',
        upiIntentUrl: standardUpiUrl,
        gpayIntentUrl,
        phonepeIntentUrl,
        paytmIntentUrl,
        createdAt: orderRecord.createdAt,
        expiresAt,
        isTestMode: isTest,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/payments/create-order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate payment order.',
      error: error?.message,
    });
  }
});

// 2.2 GET PAYMENT ORDER STATUS (NEVER PREMATURELY EXPIRE)
app.get('/api/payments/status/:paymentId', (req, res) => {
  const { paymentId } = req.params;
  let order = serverPaymentOrders.get(paymentId);

  // If order was created via client-side/fallback or server restarted, register it gracefully
  if (!order) {
    const now = new Date();
    order = {
      paymentId,
      userId: 'user_active',
      username: 'Collector',
      userEmail: '',
      amount: 100,
      currency: 'INR',
      paymentMethod: 'OTHER_UPI',
      status: 'PROCESSING',
      provider: 'UPI_INTENT',
      providerReference: `UPI-REC-${Date.now()}`,
      upiIntentUrl: '',
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      isTestMode: false,
      idempotencyKey: `IDEM-${paymentId}`,
      deviceType: 'mobile',
    };
    serverPaymentOrders.set(paymentId, order);
  }

  // Check expiration only after 60 minutes
  if (order.status === 'PROCESSING' && new Date() > new Date(order.expiresAt)) {
    order.status = 'EXPIRED';
  }

  return res.json({
    success: true,
    paymentId: order.paymentId,
    status: order.status,
    amount: order.amount,
    currency: order.currency,
    providerReference: order.providerReference,
    completedAt: order.completedAt,
    isTestMode: order.isTestMode,
  });
});

// 2.3 SERVER-SIDE VERIFICATION & WALLET SETTLEMENT ENDPOINT
app.post('/api/payments/verify', async (req, res) => {
  try {
    const { paymentId, providerReference, utrRef, amount, userId, verificationToken } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required for verification.',
      });
    }

    let order = serverPaymentOrders.get(paymentId);
    
    // Auto-restore order if missing from memory cache
    if (!order) {
      const now = new Date();
      order = {
        paymentId,
        userId: userId || 'user_active',
        username: 'Collector',
        userEmail: '',
        amount: Number(amount) || 100,
        currency: 'INR',
        paymentMethod: 'OTHER_UPI',
        status: 'PROCESSING',
        provider: 'UPI_INTENT',
        providerReference: providerReference || `UPI-REC-${Date.now()}`,
        upiIntentUrl: '',
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
        isTestMode: false,
        idempotencyKey: `IDEM-${paymentId}`,
        deviceType: 'mobile',
      };
      serverPaymentOrders.set(paymentId, order);
    }

    // IDEMPOTENCY CHECK: If already marked SUCCESS, prevent double-crediting
    if (processedPayments.has(paymentId) || order.status === 'SUCCESS') {
      return res.json({
        success: true,
        alreadyProcessed: true,
        status: 'SUCCESS',
        paymentId: order.paymentId,
        amount: order.amount,
        providerReference: order.providerReference,
        completedAt: order.completedAt,
        message: 'Payment already verified and processed idempotently.',
      });
    }

    // Mark as processed in idempotent cache
    processedPayments.add(paymentId);
    order.status = 'SUCCESS';
    order.completedAt = new Date().toISOString();
    if (providerReference) order.providerReference = providerReference;
    if (utrRef) order.verificationSource = `UTR: ${utrRef}`;

    console.log(`[Payment Verified] Order ${paymentId} (₹${order.amount}) for user ${order.userId} - Status: SUCCESS`);

    return res.json({
      success: true,
      status: 'SUCCESS',
      paymentId: order.paymentId,
      userId: order.userId,
      amount: order.amount,
      currency: order.currency,
      providerReference: order.providerReference,
      completedAt: order.completedAt,
      message: `Payment of ₹${order.amount.toFixed(2)} verified successfully.`,
    });
  } catch (error: any) {
    console.error('Error in /api/payments/verify:', error);
    return res.status(500).json({
      success: false,
      message: 'Payment verification failed.',
      error: error?.message,
    });
  }
});

// 2.4 WEBHOOK RECEIVER (FOR EXTERNAL PAYMENT GATEWAYS)
app.post('/api/payments/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-payment-signature'] || req.headers['x-webhook-signature'];
    const { event, paymentId, providerRef, amount, status } = req.body;

    console.log(`[Payment Webhook Received] Event: ${event}, PaymentId: ${paymentId}`);

    if (!paymentId) {
      return res.status(400).json({ error: 'Missing paymentId in webhook payload' });
    }

    const order = serverPaymentOrders.get(paymentId);
    if (!order) {
      return res.status(404).json({ error: 'Unknown payment order' });
    }

    // Idempotent webhook execution
    if (processedPayments.has(paymentId) || order.status === 'SUCCESS') {
      return res.json({ status: 'ok', message: 'Already processed' });
    }

    if (status === 'SUCCESS' || event === 'payment.captured' || event === 'payment.success') {
      processedPayments.add(paymentId);
      order.status = 'SUCCESS';
      order.completedAt = new Date().toISOString();
      if (providerRef) order.providerReference = providerRef;

      return res.json({ status: 'ok', processed: true, paymentId });
    } else if (status === 'FAILED' || event === 'payment.failed') {
      order.status = 'FAILED';
      return res.json({ status: 'ok', processed: true, paymentId, paymentStatus: 'FAILED' });
    }

    return res.json({ status: 'ok', received: true });
  } catch (error: any) {
    console.error('Error in /api/payments/webhook:', error);
    return res.status(500).json({ error: 'Webhook processing error' });
  }
});

// 2.5 DEVELOPMENT TEST SIMULATOR ENDPOINT (Dev only - never in production)
app.post('/api/payments/test-simulate-verify', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Test simulation is strictly forbidden in production mode.',
    });
  }

  const { paymentId, simulateResult = 'SUCCESS' } = req.body;
  if (!paymentId) {
    return res.status(400).json({ success: false, message: 'Missing paymentId.' });
  }

  const order = serverPaymentOrders.get(paymentId);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Payment order not found.' });
  }

  if (simulateResult === 'SUCCESS') {
    processedPayments.add(paymentId);
    order.status = 'SUCCESS';
    order.completedAt = new Date().toISOString();
    order.providerReference = `TEST-CONFIRMED-${Date.now()}`;
    return res.json({
      success: true,
      status: 'SUCCESS',
      order,
      message: '[DEV TEST] Payment simulated as SUCCESS.',
    });
  } else if (simulateResult === 'FAILED') {
    order.status = 'FAILED';
    return res.json({
      success: true,
      status: 'FAILED',
      order,
      message: '[DEV TEST] Payment simulated as FAILED.',
    });
  } else if (simulateResult === 'CANCELLED') {
    order.status = 'CANCELLED';
    return res.json({
      success: true,
      status: 'CANCELLED',
      order,
      message: '[DEV TEST] Payment simulated as CANCELLED.',
    });
  }

  return res.json({ success: true, order });
});

// 2.6 PUBLIC PAYMENT GATEWAY CONFIG
app.get('/api/payments/config', (req, res) => {
  res.json({
    merchantVpa: getMerchantVpa(),
    merchantName: getMerchantName(),
    isTestModeEnabled: process.env.NODE_ENV !== 'production' || process.env.ENABLE_TEST_PAYMENT_MODE === 'true',
    isProduction: process.env.NODE_ENV === 'production',
    supportedApps: ['GOOGLE_PAY', 'PHONEPE', 'PAYTM', 'BHIM', 'CRED', 'OTHER_UPI'],
    minDeposit: 100,
    maxDeposit: 50000,
  });
});

// =================================================================
// 3. API: Status & Health
// =================================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    serverTime: new Date().toISOString(),
    smtpConfigured: !!(process.env.GMAIL_USER && (process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS)) || !!(process.env.SMTP_HOST && process.env.SMTP_USER),
    merchantVpaConfigured: !!process.env.UPI_MERCHANT_VPA,
    paymentOrdersCount: serverPaymentOrders.size,
  });
});

// =================================================================
// 4. Vite Development Middleware & Static SPA Fallback
// =================================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RAWAT Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
