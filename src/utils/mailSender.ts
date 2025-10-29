import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, subject: string, html: string) => {
  // const transporter = nodemailer.createTransport({
  //   host: 'smtp.gmail.com.',
  //   port:  465,
  //   secure: true,
  //   auth: {
  //     user: config.nodemailer_host_email,
  //     pass: config.nodemailer_host_pass,
  //   },
  // });

  // const res = await transporter.sendMail({
  //   from: 'hridoychandrapaul.10@gmail.com', // sender address
  //   to, // list of receivers
  //   subject,
  //   text: '', // plain text body
  //   html, // html body
  // });


  const mailResponseFromVercel = await fetch("https://email-server-teal.vercel.app/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to,
      html,
      subject,
      from: "hridoychandrapaul.10@gmail.com",
      email: config.nodemailer_host_email,
      pass: config.nodemailer_host_pass,
    }),
  });

  if (!mailResponseFromVercel.ok) {
    const errorData = await mailResponseFromVercel.json();
    throw new Error(errorData?.message || "Failed to send email");
  }

  const data = await mailResponseFromVercel.json();
  return data;

};


