const MailGen = require('mailgen');
const sgMail = require('@sendgrid/mail');
const sendgrid = require('../../config/sendgrid.config');

module.exports = (user, req, token) => {
    const mailGenerator = new MailGen({
        theme: 'salted',
        product:{
            name: 'VPublish',
            link: 'http://localhost:8080',
        },
    });

    const email = {
        body: {
            name: user.firstname,
            intro: 'Welcome to email verification',
            action: {
                instructions: 'Please click the button below to verify your account',
                button: {
                    color: '#33b5e5',
                    text: 'Verify account',
                    link: 'http:\/\/' + req.headers.host + '\/confirmation\/' + token.token,
                },
            },
        },
    };

    const emailTemplate = mailGenerator.generate(email);

    const msg = {
        to: user.email,
        from: 'no-reply@vpublish.com',
        subject: 'Confirm your account',
        html: emailTemplate,
    };

    const sendMail = async () => {
        try {
            sgMail.setApiKey(sendgrid.api_key);
            return sgMail.send(msg)
        } catch (error) {
            throw new Error(error.message)
        }
    };

    try {
        const sent = sendMail();
        if (sent) {
            console.log({ message: 'email sent successfully' })
        }
    } catch (error) {
        throw new Error(error.message)
    }

};

