module.exports = (env, argv) => {
  console.log('env: ', env);
  const mode = env.TARGET_ENV === 'development' ? 'development' : 'production';
  const config = require(`./webpack.${mode}.js`);

  return config(env, argv);
};
