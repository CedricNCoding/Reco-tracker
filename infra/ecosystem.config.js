module.exports = {
  apps: [{
    name: 'recomp-tracker',
    script: 'npm',
    args: 'start',
    cwd: '/opt/recomp-tracker',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '512M',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};
