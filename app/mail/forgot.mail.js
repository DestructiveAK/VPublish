const MailGen = require('mailgen');
const sgMail = require('@sendgrid/mail');
const sendgrid = require('../../config/sendgrid.config');

module.exports = (user, req, token) => {
    const mailGenerator = new MailGen({
        theme: 'salted',
        product:{
            name: 'VPublish',
            link: 'http:\/\/' + req.headers.host,
        }
    });

    const email = {
        body: {
            name: user.firstname,
            intro: 'You have received this email because a password reset request for your account was received.',
            action: {
                instructions: 'Click the button below to reset your password.' +
                    'This link can only be used once.',
                button: {
                    color: '#DC4D2F',
                    text: 'Reset your Password',
                    link: 'http:\/\/' + req.headers.host + '\/reset\/' + token,
                }
            },
            outro: 'This link will expire in 12 hours.' +
                '\nIf you did not request a password reset, no further action is required on your part.'
        },
    };

    const emailTemplate = mailGenerator.generate(email);

    const msg = {
        to: user.email,
        from: 'no-reply@vpublish.com',
        subject: 'Reset your password',
        html: emailTemplate,
    };

    sgMail.setApiKey(sendgrid.API_KEY);
    sgMail.send(msg)
        .then(() => {console.log(`Email sent to ${user.email}`)})
        .catch(error => {
            console.error(error);
            if (error.response) {
                console.error(error.message);
            }
        })
};

