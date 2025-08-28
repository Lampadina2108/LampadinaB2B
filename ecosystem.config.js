module.exports = {
  apps: [
    {
      name: 'lampadina-backend',
      script: './backend/dist/server.js',   // Pfad prüfen! (dist liegt im backend)
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      watch: ['backend/dist'],
      ignore_watch: ['node_modules', 'uploads', 'logs'],

      env: {
        NODE_ENV: 'production',
        PORT: '3001',
        FRONTEND_URL: 'https://www.lampadina.icu',

        DB_HOST: '82.112.254.14',
        DB_PORT: '3306',
        DB_USER: 'admin',
        DB_PASSWORD: 'Mark@Net2108',
        DB_NAME: 'lampadina',
        JWT_SECRET: 'deinSehrGeheimesJWTSecret',

        // Google SMTP Relay (ohne Auth)
        SMTP_HOST: 'smtp-relay.gmail.com',
        SMTP_PORT: '587',
        SMTP_SECURE: 'false',
        SMTP_USER: '',
        SMTP_PASS: '',
        MAIL_FROM: 'Lampadina B2B <no-reply@lampadina.icu>',
        MAIL_DEBUG: 'true',
		NODE_OPTIONS: '--dns-result-order=ipv4first',

        ADMIN_EMAIL: 'vertrieb@lampadina.icu',
        PUBLIC_BASE_URL: 'https://www.lampadina.icu',

      },
    },
  ],
};
