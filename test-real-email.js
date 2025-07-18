import nodemailer from 'nodemailer';

async function testRealEmailDelivery() {
  console.log('=== TESTING REAL EMAIL DELIVERY ===');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Missing EMAIL_USER or EMAIL_PASS environment variables');
    return false;
  }
  
  console.log(`Email: ${process.env.EMAIL_USER}`);
  console.log(`Password configured: ${!!process.env.EMAIL_PASS}`);
  
  const emailDomain = process.env.EMAIL_USER.toLowerCase();
  const isGmail = emailDomain.includes('@gmail.com');
  
  if (isGmail) {
    console.log('📧 Detected Gmail account - trying Gmail configurations...');
    
    // Gmail Service method
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      
      const result = await transporter.sendMail({
        from: `"B2B Market Test" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // Send to self for testing
        subject: 'B2B Market Email System Test',
        html: `
          <h2>✅ Email System Working!</h2>
          <p>This is a test email from the B2B Market platform.</p>
          <p>If you received this email, the forgot password system is working correctly.</p>
          <p>Test time: ${new Date().toISOString()}</p>
        `
      });
      
      console.log('🎉 SUCCESS: Gmail email sent successfully!');
      console.log(`Message ID: ${result.messageId}`);
      console.log('✅ Check your inbox - you should receive this test email');
      return true;
      
    } catch (error) {
      console.log(`❌ Gmail failed: ${error.message}`);
      
      if (error.code === 'EAUTH') {
        console.log('');
        console.log('🔧 SOLUTION: Gmail App Password Required');
        console.log('1. Go to https://myaccount.google.com/security');
        console.log('2. Enable 2-Step Verification');
        console.log('3. Generate an App Password for "Mail"');
        console.log('4. Use the 16-character app password as EMAIL_PASS');
        console.log('');
      }
      return false;
    }
  } else {
    console.log('📧 Non-Gmail account detected - trying generic SMTP...');
    // Add other email provider logic here
    return false;
  }
}

testRealEmailDelivery();