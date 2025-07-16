import 'dotenv/config';

export default {
  stripe: {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  },
};
