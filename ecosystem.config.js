module.exports = {
  apps: [
    {
      name: 'TMS',
      script: './dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',

      env_development_local: {
        NODE_ENV: 'development',
        env_file: '.env.development.local',
      },
      env_production: {
        NODE_ENV: 'production',
        env_file: '.env',
      },

      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2/error.log',
      out_file: './logs/pm2/out.log',
    },
  ],
};
