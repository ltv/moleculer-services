const dotenv = require('dotenv');

const setupDotEnv = () => {
  dotenv.config({ path: './.env.test' });
};

setupDotEnv();
