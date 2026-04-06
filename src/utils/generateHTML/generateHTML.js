export const generateHTMLFormEmail = ({otp, name = "User"}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code</title>
  <style>
    /* CSS Reset for Email Clients */
    body, p, h1, h2, h3, h4, h5, h6 {
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f4f7fa;
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: none;
      width: 100% !important;
      height: 100% !important;
    }
    .wrapper {
      width: 100%;
      background-color: #f4f7fa;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    }
    .header {
      background-color: #4F46E5; /* Indigo / Primary Brand Color */
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      font-size: 24px;
      font-weight: 600;
      letter-spacing: 1px;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .greeting {
      font-size: 18px;
      color: #111827;
      font-weight: 600;
      margin-bottom: 15px;
      text-align: left;
    }
    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #4B5563;
      margin-bottom: 30px;
      text-align: left;
    }
    .otp-container {
      background-color: #F3F4F6;
      border: 2px dashed #D1D5DB;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
      text-align: center;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 700;
      color: #111827;
      letter-spacing: 8px;
      margin: 0;
    }
    .validity {
      font-size: 14px;
      color: #6B7280;
      margin-top: 25px;
      font-style: italic;
    }
    .divider {
      height: 1px;
      background-color: #E5E7EB;
      margin: 30px 0;
    }
    .footer {
      padding: 0 30px 30px 30px;
      text-align: center;
    }
    .footer p {
      font-size: 13px;
      color: #9CA3AF;
      line-height: 1.5;
      margin-bottom: 10px;
    }
    .support-link {
      color: #4F46E5;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="container" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td>
          <div class="header">
            <h1>Verification Code</h1>
          </div>
          
          <div class="content">
            <p class="greeting">Hello ${name},</p>
            <p class="message">
              Thank you for using our service. To complete your verification process, please use the One-Time Password (OTP) below. 
            </p>
            
            <div class="otp-container">
              <p class="otp-code">${otp}</p>
            </div>
            
            <p class="message" style="margin-bottom: 0;">
              Please make sure you never share this code with anyone. Our team will never ask you for your password or OTP.
            </p>
            
            <p class="validity">
              *This code is valid for the next 10 minutes.
            </p>

            <div class="divider"></div>

            <p class="message" style="font-size: 14px; color: #6B7280; text-align: center;">
              If you did not request this code, you can safely ignore this email or contact our <a href="#" class="support-link">Support Team</a> if you have concerns.
            </p>
          </div>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} HireBridge. All rights reserved.</p>
            <p>123 Tech Avenue, Innovation City, Cairo</p>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;