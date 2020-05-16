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
            intro: 'Welcome to VPublish! We\'re very excited to have you on board.',
            action: {
                instructions: 'To get started with VPublish, please click here:',
                button: {
                    color: '#22BC66',
                    text: 'Confirm your account',
                    link: 'http:\/\/' + req.headers.host + req.baseUrl + '\/confirmation\/' + token,
                }
            },
            outro: 'This link will expire in 12 hours.'
        },
    };

    const emailTemplate = mailGenerator.generate(email);

    const msg = {
        to: user.email,
        from: 'no-reply@vpublish.com',
        subject: 'Confirm your account',
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

