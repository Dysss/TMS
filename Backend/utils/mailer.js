const nodemailer = require("nodemailer")

exports.mailer = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,

    auth: {
        user: "9150559dfe654f",
        pass: "690fc34302693f"
    }
});