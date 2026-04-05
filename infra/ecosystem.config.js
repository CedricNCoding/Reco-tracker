module.exports = {
  apps: [{
    name: 'recomp-tracker',
    script: 'server/index.js',
    cwd: '/opt/recomp-tracker',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATA_DIR: '/opt/recomp-tracker/data'
    },
    max_memory_restart: '128M',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};
