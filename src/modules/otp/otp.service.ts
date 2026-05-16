import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import moment from 'moment';
import { sendEmail } from '../../utils/mailSender';
import config from '../../config';
import { User } from '../user/user.models';
import fs from 'fs';
import path from 'path';
import { generateOtp } from '../../utils/otpGenerator';
import { emailQueue } from '../../queues/email.queue';

const verifyOtp = async (token: string, otp: string | number) => {

  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Authentication required. Please try again to continue.');
  }
  let decode;

  try {
    decode = jwt.verify(
      token,
      config.jwt_access_secret as Secret,
    ) as JwtPayload;
  } catch (err) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Your session has expired. Please request a new OTP and try again.'
    );
  }

  const user = await User.findById(decode?.userId).select(
    'verification status ',
  );

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User does not exist');
  }
  if (new Date() > user?.verification?.expiresAt) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Your OTP session has expired. Please request a new OTP.'
    );
  }

  if (user?.verification?.status) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are already verified. Please sign in to continue.');
  }

  if (Number(otp) !== Number(user?.verification?.otp)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'The OTP you entered is incorrect. Please try again.');
  }

  const updateUser = await User.findByIdAndUpdate(
    user?._id,
    {
      $set: {
        verification: {
          otp: 0,
          expiresAt: moment().add(3, 'minute'),
          status: true,
        },
        isverified: true
      },
    },
    { new: true },
  ).select('email _id name role');

  const jwtPayload = {
    email: updateUser?.email,
    role: updateUser?.role,
    userId: updateUser?._id,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
    expiresIn: '7d', //7 days
  });

  return { user: updateUser, accessToken: accessToken };
};

const resendOtp = async (email: string) => {
  const user = await User.findOne({ email })

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  const otp = generateOtp();
  const expiresAt = moment().add(3, 'minute');

  const updateOtp = await User.findByIdAndUpdate(
    user?._id,
    {
      $set: {
        verification: {
          otp,
          expiresAt,
          status: false,
        },
      },
    },
    { new: true },
  );

  if (!updateOtp) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Unable to send OTP. Please try again later.'
    );
  }

  const jwtPayload = {
    email: user?.email,
    userId: user?._id,
    role: user?.role
  };
  const token = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
    expiresIn: '3m',
  });

  const otpEmailPath = path.join(
    process.cwd(),
    'public',
    'view',
    'otp_mail.html'
  );

  if (user) {

    await emailQueue.add(
      "email",
      {
        to: user?.email,
        subject: "Your One Time OTP",
        html: fs
          .readFileSync(otpEmailPath, 'utf8')
          .replace('{{otp}}', otp)
          .replace('{{email}}', user?.email)
      },
      {
        delay: 0,
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000, // 2s → 4s → 6s
        },
      }
    );

  }

  return { token };
};

export const otpServices = {
  verifyOtp,
  resendOtp,
};
