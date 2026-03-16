import nodemailer from 'nodemailer';

const sendCoursePurchaseEmail = async (options) => {
    let transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        // Use configured SMTP
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465, 
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } else {
        // Fallback to Ethereal for testing if no credentials are provided
        console.warn('SMTP credentials not found in environment variables. Using Ethereal Email for testing.');
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass  // generated ethereal password
            }
        });
    }

    const { email, name, courseTitle, amount, transactionId } = options;

    const mailOptions = {
        from: `"${process.env.FROM_NAME || 'LearnFlux Ecosystem'}" <${process.env.FROM_EMAIL || 'noreply@learnflux.com'}>`, // sender address
        to: email, 
        subject: `Course Purchase Confirmation: ${courseTitle}`, 
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #e53935; padding: 20px; text-align: center; color: white;">
                    <h2 style="margin: 0;">Thank you for your purchase!</h2>
                </div>
                <div style="padding: 20px; color: #333;">
                    <p>Dear ${name},</p>
                    <p>We are excited to confirm your enrollment in <strong>${courseTitle}</strong>.</p>
                    
                    <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Purchase Summary</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Course:</strong></td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${courseTitle}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Transaction ID:</strong></td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${transactionId || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;"><strong>Total Paid:</strong></td>
                            <td style="padding: 8px 0; text-align: right; font-weight: bold;">₹${amount}</td>
                        </tr>
                    </table>

                    <p style="margin-top: 30px;">You can now access your course materials from your student dashboard.</p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/dashboard" style="background-color: #e53935; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Go to Dashboard</a>
                    </div>
                </div>
                <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                    <p>If you have any questions, please reply to this email.</p>
                    <p>&copy; ${new Date().getFullYear()} LearnFlux Ecosystem</p>
                </div>
            </div>
        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    
    // Preview URL is only available when using an Ethereal account
    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
};

const sendOTPEmail = async (email, otp) => {
    let transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        // Use configured SMTP
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465, 
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } else {
        // Fallback to Ethereal for testing if no credentials are provided
        console.warn('SMTP credentials not found in environment variables. Using Ethereal Email for testing.');
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass  // generated ethereal password
            }
        });
    }

    const mailOptions = {
        from: `"${process.env.FROM_NAME || 'LearnFlux Ecosystem'}" <${process.env.FROM_EMAIL || 'noreply@learnflux.com'}>`, // sender address
        to: email, 
        subject: `Your OTP for Email Verification`, 
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #e53935; padding: 20px; text-align: center; color: white;">
                    <h2 style="margin: 0;">Email Verification</h2>
                </div>
                <div style="padding: 20px; color: #333;">
                    <p>Hello,</p>
                    <p>Your One-Time Password (OTP) for verifying your email address is:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background-color: #f5f5f5; padding: 10px 20px; border-radius: 4px;">${otp}</span>
                    </div>

                    <p>This OTP is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
                </div>
                <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                    <p>If you did not request this, please ignore this email.</p>
                    <p>&copy; ${new Date().getFullYear()} LearnFlux Ecosystem</p>
                </div>
            </div>
        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("OTP Email sent: %s", info.messageId);
    
    // Preview URL is only available when using an Ethereal account
    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
        console.log("OTP Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
};

export { sendCoursePurchaseEmail, sendOTPEmail };
export default sendCoursePurchaseEmail;
