import nodemailer from 'nodemailer';

async function testEmail() {
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Missing email credentials');
    return;
  }
  
  try {
    // Try Gmail service
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    const result = await transporter.sendMail({
      from: `"B2B Market Test" <${process.env.EMAIL_USER}>`,
      to: 'test@example.com',
      subject: 'Test Email from B2B Market',
      html: '<h1>Test Email</h1><p>This is a test email from B2B Market platform.</p>'
    });
    
    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log('Message ID:', result.messageId);
    
  } catch (error) {
    console.log('❌ Email failed:', error.message);
    
    // Try generic SMTP
    try {
      const transporter2 = nodemailer.createTransporter({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      
      const result2 = await transporter2.sendMail({
        from: `"B2B Market Test" <${process.env.EMAIL_USER}>`,
        to: 'test@example.com',
        subject: 'Test Email from B2B Market',
        html: '<h1>Test Email</h1><p>This is a test email from B2B Market platform.</p>'
      });
      
      console.log('✅ EMAIL SENT VIA SMTP!');
      console.log('Message ID:', result2.messageId);
      
    } catch (error2) {
      console.log('❌ SMTP also failed:', error2.message);
    }
  }
}

testEmail();