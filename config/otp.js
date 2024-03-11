require('dotenv').config(); // Load environment variables from .env file
const nodemailer = require('nodemailer')


  const sendverifyemail = async (email,req) => {
    try {
 
      const otp = generateOTP(4); 
      console.log(otp,"kkkkkk");
      console.log(email);
      req.session.otp = otp;
      req.session.otpGeneratedTime = Date.now();
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        service:"gmail",
        auth: {
          user: process.env.email,
          pass: process.env.password,
        },
      });
     
   
      const mailOptions = {
        from: 'convo881@gmail.com',
        to: email,
        subject: 'For verification purpose',
        html: `<p>Hello , please enter this OTP: <strong>${otp}</strong> to verify your email.</p>`,
      };
      console.log(mailOptions)
       const information=await  transporter.sendMail( mailOptions);
      //  console.log('shinto');
    } catch (error) {
      console.log(error);
    }
  };

  function generateOTP(length) {
      const characters = '0123456789'; // The characters to use for the OTP
      let otp = '';
    
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        otp += characters[randomIndex];
      }
    
      return otp;
    }
  module.exports= {sendverifyemail}