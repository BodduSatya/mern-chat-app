// const sgMail = require("@sendgrid/mail");
// console.log(process.env.SENDGRID_API_KEY);
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// const sendSGMail = async ({
//   to,
//   subject,
//   html,
//   attachments,
//   text,
// }) => {
//   try {
//     const from = process.env.FROM_EMAIL_ID;

//     const msg = {
//       to: to, // Change to your recipient
//       from: from, // Change to your verified sender
//       subject: subject,
//       html: html,
//       // text: text,
//       attachments,
//     };

//     // console.log(msg);

//     return sgMail.send(msg);
//   } catch (error) {
//     console.log(error);
//   }
// };

// exports.sendEmail = async (args) => {
//   if (!process.env.NODE_ENV === "development") {
//     return Promise.resolve();
//   } else {
//     return sendSGMail(args);
//   }
// };


const nodeMailer = require('nodemailer');

const sendMail = async ({
  to,
  subject,
  html,
  attachments,
  text,
}) => {
  try {
    const from = process.env.FROM_EMAIL_ID;
    const msg = {
      to: to,
      from: from,
      subject: subject,
      html: html,
      attachments,
    };

    nodeMailer.createTransport({
      service: "gmail",
      auth: {
        user: from,
        pass: process.env.MAIL_PASS,
      },
      port: 465,
      host: "smtp.gmail.com"
    }).sendMail(msg, (err) => {
      if (err) {
        return console.log("Error occurred: " + err);
      } else {
        return console.log("Email Sent")
      }
    });
  } catch (error) {
    console.log(error);
  }
};

exports.sendEMail = async (args) => {
  return sendMail(args);
};