const nodemailer = require("nodemailer");
var hbs = require("nodemailer-express-handlebars");

module.exports = async (email, subject, text, template, context) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: Number(process.env.EMAIL_PORT),
      secure: Boolean(process.env.SECURE),
      auth: {
        type: process.env.TYPE,
        user: process.env.AUTH_EMAIL,
        clientId: process.env.AUTH_CLIENT_ID,
        clientSecret: process.env.AUTH_CLIENT_SECRET,
        refreshToken: process.env.AUTH_REFRESH_TOKEN,
      },
    });
    transporter.use(
      "compile",
      hbs({
        viewEngine: {
          extName: ".hbs",
          partialsDir: "./views/partials",
          layoutsDir: "./views/layouts",
          defaultLayout: "",
        },
        viewPath: "./views/",
        extName: ".hbs",
      })
    );
    transporter.sendMail({
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: subject,
      text: text,
      template: template,
      context: context,
    });
    console.log("Email Sent Successfully");
  } catch (err) {
    console.error(err);
  }
};
