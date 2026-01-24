// Resend API configuration
const RESEND_API_URL = 'https://api.resend.com/emails';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * Escape HTML special characters to prevent XSS in email templates
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface SendInvitationEmailParams {
  email: string;
  companyName: string;
  invitationToken: string;
  expiresInHours?: number;
}

/**
 * Generate HTML email template for employee invitation
 */
function generateInvitationEmailHtml({
  companyName,
  invitationToken,
  expiresInHours = 24,
}: Omit<SendInvitationEmailParams, 'email'>): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const acceptUrl = `${baseUrl}/accept-invitation?token=${invitationToken}`;

  // Use absolute URL for production, base64 fallback for email client compatibility
  const logoUrl = `${baseUrl}/logos/Horizontal_FullWhite.png`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've been invited to join ${escapeHtml(companyName)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="margin-bottom: 20px;">
          <img src="${logoUrl}" alt="Atenra" style="max-width: 250px; height: auto; display: inline-block;" />
        </div>
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
          Employee Invitation
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
          You've been invited!
        </h2>
        <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
          You have been invited to join <strong>${escapeHtml(companyName)}</strong> as an employee.
          Click the button below to accept the invitation and create your account.
        </p>
        <p style="margin: 0 0 30px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
          This invitation will expire in <strong>${expiresInHours} hours</strong>.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align: center; padding: 0 0 30px 0;">
              <a href="${acceptUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
                Accept Invitation
              </a>
            </td>
          </tr>
        </table>
        <p style="margin: 0 0 10px 0; color: #718096; font-size: 14px; line-height: 1.5;">
          Or copy and paste this link into your browser:
        </p>
        <p style="margin: 0 0 30px 0; padding: 12px; background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 6px; word-break: break-all;">
          <a href="${acceptUrl}" style="color: #667eea; text-decoration: none; font-size: 14px;">
            ${acceptUrl}
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="margin: 0; color: #a0aec0; font-size: 12px; line-height: 1.5;">
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px; text-align: center; background-color: #f7fafc; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #a0aec0; font-size: 12px;">
          This is an automated message, please do not reply.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send invitation email to a new employee
 */
export async function sendInvitationEmail(params: SendInvitationEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { email, companyName, invitationToken, expiresInHours } = params;

    console.log('📧 ========== EMAIL SERVICE CALLED ==========');
    console.log('📧 Parameters:', {
      email,
      companyName,
      invitationToken: invitationToken.substring(0, 8) + '...',
      expiresInHours,
    });

    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not configured in environment variables');
      console.error('❌ Available env keys:', Object.keys(process.env).filter(k => k.includes('RESEND')));
      return { success: false, error: 'Email service not configured - missing RESEND_API_KEY' };
    }

    console.log('✅ RESEND_API_KEY found:', RESEND_API_KEY ? `${RESEND_API_KEY.substring(0, 10)}...` : 'undefined');

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    console.log(`📧 Email configuration:`, {
      from: fromEmail,
      to: email,
      apiUrl: RESEND_API_URL,
    });

    const htmlContent = generateInvitationEmailHtml({
      companyName,
      invitationToken,
      expiresInHours,
    });

    console.log('📝 HTML content generated, length:', htmlContent.length, 'characters');

    const requestBody = {
      from: fromEmail,
      to: email, // Resend accepts string (not array) for single recipient
      subject: `You've been invited to join ${companyName}`,
      html: htmlContent,
    };

    console.log('📤 Request body prepared:', {
      from: requestBody.from,
      to: requestBody.to,
      subject: requestBody.subject,
      htmlLength: requestBody.html.length,
    });

    console.log('🌐 Making fetch request to Resend API...');

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Resend API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      return {
        success: false,
        error: (errorData as { message?: string }).message || `Failed to send email: ${response.statusText} (${response.status})`
      };
    }

    const data = await response.json();
    console.log('✅ ========== EMAIL SENT SUCCESSFULLY ==========');
    console.log('✅ Response data:', data);
    return { success: true };
  } catch (error) {
    console.error('❌ ========== UNEXPECTED ERROR ==========');
    console.error('❌ Error details:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send invitation reminder email (for resend functionality)
 */
export async function sendInvitationReminderEmail(params: SendInvitationEmailParams): Promise<{ success: boolean; error?: string }> {
  // For now, use the same template but could be customized later
  return sendInvitationEmail(params);
}

// ============================================================
// Contact Form Email
// ============================================================

interface SendContactEmailParams {
  name: string;
  email: string;
  message: string;
}

const CONTACT_NOTIFICATION_EMAIL = 'info@atenra.com';

/**
 * Generate HTML email template for contact form submission
 */
function generateContactEmailHtml({ name, email, message }: SendContactEmailParams): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const logoUrl = `${baseUrl}/logos/Horizontal_FullWhite.png`;
  const timestamp = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="margin-bottom: 20px;">
          <img src="${logoUrl}" alt="Atenra" style="max-width: 250px; height: auto; display: inline-block;" />
        </div>
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
          New Contact Form Submission
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <p style="margin: 0 0 20px 0; color: #718096; font-size: 14px;">
          Received on ${timestamp}
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
          <tr>
            <td style="padding: 16px; background-color: #f7fafc; border-left: 4px solid #667eea; margin-bottom: 16px;">
              <p style="margin: 0 0 4px 0; color: #718096; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">From</p>
              <p style="margin: 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">${escapeHtml(name)}</p>
            </td>
          </tr>
          <tr><td style="height: 12px;"></td></tr>
          <tr>
            <td style="padding: 16px; background-color: #f7fafc; border-left: 4px solid #667eea;">
              <p style="margin: 0 0 4px 0; color: #718096; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
              <p style="margin: 0;">
                <a href="mailto:${escapeHtml(email)}" style="color: #667eea; font-size: 16px; text-decoration: none;">${escapeHtml(email)}</a>
              </p>
            </td>
          </tr>
        </table>

        <div style="margin-bottom: 30px;">
          <p style="margin: 0 0 12px 0; color: #718096; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
          <div style="padding: 20px; background-color: #f7fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #2d3748; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${escapeHtml(message)}</p>
          </div>
        </div>

        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align: center;">
              <a href="mailto:${escapeHtml(email)}?subject=Re: Your inquiry to Atenra" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
                Reply to ${escapeHtml(name)}
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px; text-align: center; background-color: #f7fafc; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #a0aec0; font-size: 12px;">
          This message was sent from the Atenra website contact form.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send contact form submission email to the team
 */
export async function sendContactEmail(params: SendContactEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { name, email, message } = params;

    console.log('📧 ========== CONTACT FORM EMAIL ==========');
    console.log('📧 From:', name, `<${email}>`);

    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const htmlContent = generateContactEmailHtml({ name, email, message });

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: CONTACT_NOTIFICATION_EMAIL,
        reply_to: email,
        subject: `Contact Form: Message from ${name}`,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Resend API Error:', errorData);
      return {
        success: false,
        error: (errorData as { message?: string }).message || `Failed to send email: ${response.statusText}`
      };
    }

    const data = await response.json();
    console.log('✅ Contact email sent successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('❌ Contact email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// ============================================================
// Support Ticket Emails
// ============================================================

interface SendTicketCreatedEmailParams {
  ticketId: string;
  subject: string;
  urgency: 'minor' | 'urgent' | 'critical';
  userName: string;
  userEmail: string;
  companyName?: string | null;
}

interface SendTicketStatusUpdateEmailParams {
  ticketId: string;
  subject: string;
  oldStatus: string;
  newStatus: string;
  userEmail: string;
  userName: string;
}

const SUPPORT_NOTIFICATION_EMAIL = 'support@atenra.com';

function getUrgencyColor(urgency: 'minor' | 'urgent' | 'critical'): string {
  switch (urgency) {
    case 'critical': return '#dc2626';
    case 'urgent': return '#d97706';
    case 'minor': return '#2563eb';
    default: return '#6b7280';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'open': return 'Open';
    case 'in_progress': return 'In Progress';
    case 'resolved': return 'Resolved';
    case 'closed': return 'Closed';
    default: return status;
  }
}

/**
 * Generate HTML email template for new ticket notification (to admins)
 */
function generateTicketCreatedAdminEmailHtml(params: SendTicketCreatedEmailParams): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const logoUrl = `${baseUrl}/logos/Horizontal_FullWhite.png`;
  const ticketUrl = `${baseUrl}/admindashboard/support`;
  const urgencyColor = getUrgencyColor(params.urgency);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Support Ticket #${params.ticketId}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="margin-bottom: 20px;">
          <img src="${logoUrl}" alt="Atenra" style="max-width: 250px; height: auto; display: inline-block;" />
        </div>
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
          New Support Ticket
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <div style="display: inline-block; padding: 6px 12px; background-color: ${urgencyColor}; color: white; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 20px; text-transform: uppercase;">
          ${params.urgency}
        </div>

        <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 20px; font-weight: 600;">
          Ticket #${params.ticketId}: ${escapeHtml(params.subject)}
        </h2>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
          <tr>
            <td style="padding: 12px 16px; background-color: #f7fafc; border-left: 4px solid #667eea;">
              <p style="margin: 0 0 4px 0; color: #718096; font-size: 12px; text-transform: uppercase;">From</p>
              <p style="margin: 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">${escapeHtml(params.userName)}</p>
              <p style="margin: 4px 0 0 0; color: #667eea; font-size: 14px;">${escapeHtml(params.userEmail)}</p>
              ${params.companyName ? `<p style="margin: 4px 0 0 0; color: #718096; font-size: 14px;">${escapeHtml(params.companyName)}</p>` : ''}
            </td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align: center;">
              <a href="${ticketUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
                View Ticket
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px; text-align: center; background-color: #f7fafc; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #a0aec0; font-size: 12px;">
          This is an automated notification from Atenra Support.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate HTML email template for ticket status update (to user)
 */
function generateTicketStatusUpdateEmailHtml(params: SendTicketStatusUpdateEmailParams): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const logoUrl = `${baseUrl}/logos/Horizontal_FullWhite.png`;
  const supportUrl = `${baseUrl}/support`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticket #${params.ticketId} Status Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="margin-bottom: 20px;">
          <img src="${logoUrl}" alt="Atenra" style="max-width: 250px; height: auto; display: inline-block;" />
        </div>
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
          Ticket Status Updated
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <p style="margin: 0 0 10px 0; color: #4a5568; font-size: 16px;">
          Hi ${escapeHtml(params.userName)},
        </p>
        <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
          Your support ticket has been updated.
        </p>

        <div style="padding: 20px; background-color: #f7fafc; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px;">
            Ticket #${params.ticketId}: ${escapeHtml(params.subject)}
          </h3>
          <p style="margin: 0; color: #4a5568; font-size: 14px;">
            Status changed from <strong>${getStatusLabel(params.oldStatus)}</strong> to <strong>${getStatusLabel(params.newStatus)}</strong>
          </p>
        </div>

        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align: center;">
              <a href="${supportUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
                View My Tickets
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px; text-align: center; background-color: #f7fafc; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #a0aec0; font-size: 12px;">
          This is an automated notification from Atenra Support.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send notification email to admins when a new support ticket is created
 */
export async function sendTicketCreatedAdminEmail(params: SendTicketCreatedEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('📧 ========== NEW TICKET NOTIFICATION ==========');
    console.log('📧 Ticket ID:', params.ticketId);

    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const htmlContent = generateTicketCreatedAdminEmailHtml(params);

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: SUPPORT_NOTIFICATION_EMAIL,
        subject: `[${params.urgency.toUpperCase()}] New Support Ticket #${params.ticketId}: ${params.subject}`,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Resend API Error:', errorData);
      return {
        success: false,
        error: (errorData as { message?: string }).message || `Failed to send email: ${response.statusText}`
      };
    }

    const data = await response.json();
    console.log('✅ Admin notification sent successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('❌ Admin notification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send notification email to user when their ticket status changes
 */
export async function sendTicketStatusUpdateEmail(params: SendTicketStatusUpdateEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('📧 ========== TICKET STATUS UPDATE ==========');
    console.log('📧 Ticket ID:', params.ticketId, 'Status:', params.oldStatus, '->', params.newStatus);

    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const htmlContent = generateTicketStatusUpdateEmailHtml(params);

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: params.userEmail,
        subject: `Your Support Ticket #${params.ticketId} - Status: ${getStatusLabel(params.newStatus)}`,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Resend API Error:', errorData);
      return {
        success: false,
        error: (errorData as { message?: string }).message || `Failed to send email: ${response.statusText}`
      };
    }

    const data = await response.json();
    console.log('✅ Status update email sent successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('❌ Status update email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// ============================================================
// Email Verification
// ============================================================

interface SendEmailVerificationParams {
  email: string;
  verificationToken: string;
  userName?: string;
  expiresInHours?: number;
}

/**
 * Generate HTML email template for email verification
 */
function generateEmailVerificationHtml({
  verificationToken,
  userName,
  expiresInHours = 24,
}: Omit<SendEmailVerificationParams, 'email'>): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verifyUrl = `${baseUrl}/api/auth/verify?token=${verificationToken}`;
  const logoUrl = `${baseUrl}/logos/Horizontal_FullWhite.png`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email address</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="margin-bottom: 20px;">
          <img src="${logoUrl}" alt="Atenra" style="max-width: 250px; height: auto; display: inline-block;" />
        </div>
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
          Email Verification
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
          Welcome${userName ? `, ${escapeHtml(userName)}` : ''}!
        </h2>
        <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
          Thank you for registering with Atenra. Please verify your email address by clicking the button below.
        </p>
        <p style="margin: 0 0 30px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
          This link will expire in <strong>${expiresInHours} hours</strong>.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align: center; padding: 0 0 30px 0;">
              <a href="${verifyUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
                Verify Email Address
              </a>
            </td>
          </tr>
        </table>
        <p style="margin: 0 0 10px 0; color: #718096; font-size: 14px; line-height: 1.5;">
          Or copy and paste this link into your browser:
        </p>
        <p style="margin: 0 0 30px 0; padding: 12px; background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 6px; word-break: break-all;">
          <a href="${verifyUrl}" style="color: #667eea; text-decoration: none; font-size: 14px;">
            ${verifyUrl}
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="margin: 0; color: #a0aec0; font-size: 12px; line-height: 1.5;">
          If you didn't create an account with us, you can safely ignore this email.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px; text-align: center; background-color: #f7fafc; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #a0aec0; font-size: 12px;">
          This is an automated message, please do not reply.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send email verification email to a new user
 */
export async function sendEmailVerificationEmail(params: SendEmailVerificationParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { email, verificationToken, userName, expiresInHours } = params;

    console.log('📧 ========== EMAIL VERIFICATION ==========');
    console.log('📧 Email:', email);

    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not configured');
      return { success: false, error: 'Email service not configured - missing RESEND_API_KEY' };
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const htmlContent = generateEmailVerificationHtml({
      verificationToken,
      userName,
      expiresInHours,
    });

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject: 'Verify your email address - Atenra',
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Resend API Error:', errorData);
      return {
        success: false,
        error: (errorData as { message?: string }).message || `Failed to send email: ${response.statusText}`
      };
    }

    const data = await response.json();
    console.log('✅ Email verification sent successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('❌ Email verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// ============================================================
// Password Reset Email
// ============================================================

interface SendPasswordResetParams {
  email: string;
  resetToken: string;
  userName?: string;
  expiresInHours?: number;
}

/**
 * Generate HTML email template for password reset
 */
function generatePasswordResetHtml({
  resetToken,
  userName,
  expiresInHours = 24,
}: Omit<SendPasswordResetParams, 'email'>): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  const logoUrl = `${baseUrl}/logos/Horizontal_FullWhite.png`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="margin-bottom: 20px;">
          <img src="${logoUrl}" alt="Atenra" style="max-width: 250px; height: auto; display: inline-block;" />
        </div>
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
          Password Reset
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
          Reset your password${userName ? `, ${escapeHtml(userName)}` : ''}
        </h2>
        <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
          We received a request to reset your password. Click the button below to create a new password.
        </p>
        <p style="margin: 0 0 30px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
          This link will expire in <strong>${expiresInHours} hours</strong>.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align: center; padding: 0 0 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
                Reset Password
              </a>
            </td>
          </tr>
        </table>
        <p style="margin: 0 0 10px 0; color: #718096; font-size: 14px; line-height: 1.5;">
          Or copy and paste this link into your browser:
        </p>
        <p style="margin: 0 0 30px 0; padding: 12px; background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 6px; word-break: break-all;">
          <a href="${resetUrl}" style="color: #667eea; text-decoration: none; font-size: 14px;">
            ${resetUrl}
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="margin: 0; color: #a0aec0; font-size: 12px; line-height: 1.5;">
          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px; text-align: center; background-color: #f7fafc; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #a0aec0; font-size: 12px;">
          This is an automated message, please do not reply.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(params: SendPasswordResetParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { email, resetToken, userName, expiresInHours } = params;

    console.log('📧 ========== PASSWORD RESET EMAIL ==========');
    console.log('📧 Email:', email);

    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not configured');
      return { success: false, error: 'Email service not configured - missing RESEND_API_KEY' };
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const htmlContent = generatePasswordResetHtml({
      resetToken,
      userName,
      expiresInHours,
    });

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject: 'Reset your password - Atenra',
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Resend API Error:', errorData);
      return {
        success: false,
        error: (errorData as { message?: string }).message || `Failed to send email: ${response.statusText}`
      };
    }

    const data = await response.json();
    console.log('✅ Password reset email sent successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('❌ Password reset email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
