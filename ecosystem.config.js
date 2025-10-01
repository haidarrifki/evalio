module.exports = {
  apps: [
    {
      name: 'evalio-api',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'evalio-worker',
      script: 'dist/jobs/worker.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
