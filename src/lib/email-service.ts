// Resend API configuration
const RESEND_API_URL = 'https://api.resend.com/emails';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

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
  <title>You've been invited to join ${companyName}</title>
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
          You have been invited to join <strong>${companyName}</strong> as an employee.
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
              <p style="margin: 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">${name}</p>
            </td>
          </tr>
          <tr><td style="height: 12px;"></td></tr>
          <tr>
            <td style="padding: 16px; background-color: #f7fafc; border-left: 4px solid #667eea;">
              <p style="margin: 0 0 4px 0; color: #718096; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
              <p style="margin: 0;">
                <a href="mailto:${email}" style="color: #667eea; font-size: 16px; text-decoration: none;">${email}</a>
              </p>
            </td>
          </tr>
        </table>

        <div style="margin-bottom: 30px;">
          <p style="margin: 0 0 12px 0; color: #718096; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
          <div style="padding: 20px; background-color: #f7fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #2d3748; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
          </div>
        </div>

        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align: center;">
              <a href="mailto:${email}?subject=Re: Your inquiry to Atenra" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
                Reply to ${name}
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
