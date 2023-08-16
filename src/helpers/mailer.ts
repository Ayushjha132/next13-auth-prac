// TODO: goal is to verify token through mail (that also verify user/mail by default)
// ? Using node module "nodemailer" to send mails BUT require host here using "mailtrap"
// now there are two waus of doing verification i) from backend ii) on client side.
// TODO: From Backend -> domain.com/verifytoken/asssskjsfjaasfhaf  (little complex)
// TODO: From Frontend -> domain.com/verifytoken?token=asdkasjdasdalkdja

import nodemailer from "nodemailer";
import User from "@/models/userModel";
import bcryptjs from "bcryptjs";

export const sendEmail = async ({ email, emailType, userId }: any) => {
  try {
    //create hashed token
    const hashedToken = await bcryptjs.hash(userId.toString(), 10);

    // updating db with verfication token
    if (emailType === "VERIFY") {
      await User.findOneAndUpdate(userId, {
        verifyToken: hashedToken,
        verifyTokenExpiry: Date.now() + 3600000,
      });
    } else if (emailType === "RESET") {
      await User.findOneAndUpdate(userId, {
        forgetpasswordToken: hashedToken,
        forgetpasswordTokenExpiry: Date.now() + 3600000,
      });
    }

    // setup nodemailer with host
    var transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: "ayush@gmail.com", //not my mail
      to: email,
      subject:
        emailType === "VERIFY" ? "Verify your email" : "Reset your password",
      html: `<p>Click <a href="${
        process.env.DOMAIN
      }/verifyemail?token=${hashedToken}">here</a> to ${
        emailType === "VERIFY" ? "verify your email" : "reset your password"
      } <br> Or, copy and paste the link below in your.<hr> href="${
        process.env.DOMAIN
      }/verifyemail?token=${hashedToken}" </p>`,
    };

    const mailRespnse = await transport.sendMail(mailOptions);
    return mailRespnse;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
