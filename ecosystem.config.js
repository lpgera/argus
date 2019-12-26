module.exports = {
  apps: [
    {
      name: 'sdc',
      script: './packages/sdc2-server/src/index.js',
      env: {
        NODE_ENV: 'production',
        NODE_CONFIG_DIR: './packages/sdc2-server/config',
      },
      wait_ready: true,
      instances: 2,
      exec_mode: 'cluster',
    },
    {
      name: 'bme280',
      script: './packages/sdc2-client-bme280/index.js',
      env: {
        NODE_ENV: 'production',
        NODE_CONFIG_DIR: './packages/sdc2-client-bme280/config',
      },
    },
    {
      name: 'dht22',
      script: './packages/sdc2-client-dht22/index.js',
      env: {
        NODE_ENV: 'production',
        NODE_CONFIG_DIR: './packages/sdc2-client-dht22/config',
      },
    },
    {
      name: 'hcsr501',
      script: './packages/sdc2-client-hcsr501/index.js',
      env: {
        NODE_ENV: 'production',
        NODE_CONFIG_DIR: './packages/sdc2-client-hcsr501/config',
      },
    },
    {
      name: 'mijia',
      script: './packages/sdc2-client-mijia/index.js',
      env: {
        NODE_ENV: 'production',
        NODE_CONFIG_DIR: './packages/sdc2-client-mijia/config',
      },
    },
    {
      name: 'weather',
      script: './packages/sdc2-client-weather/index.js',
      env: {
        NODE_ENV: 'production',
        NODE_CONFIG_DIR: './packages/sdc2-client-weather/config',
      },
    },
  ],
}
