import nodemailer from 'nodemailer';

export default async function sendEmail(to, subject, text) {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.SMPT_HOST,
            port: process.env.SMPT_PORT,
            service: process.env.SMPT_SERVICE,
            auth: {
                user: process.env.SMPT_MAIL,
                pass: process.env.SMPT_PASSWORD
            }
        });

        // Send mail with defined transport object
        let info = await transporter.sendMail({
            from: process.env.SMPT_MAIL, // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            text: text // plain text body
        });

        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}
