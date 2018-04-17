const Config = function() {
  let config = {
    maxPoolSize: 20,
    port: 3000,
    dbHost: process.env.DB_HOST || '127.0.0.1',
    dbName: process.env.DB_NAME || 'bitcore',
    numWorkers: require('os').cpus().length,
    chains: {}
  };

  let options;
  try {
    options = require('../config.json');
  } catch (e) {
    options = {};
  }

  Object.assign(config, options);
  if (!Object.keys(config.chains).length) {
    config.chains.BTC = {
      mainnet: {
        chainSource: 'p2p',
        trustedPeers: [{ host: '127.0.0.1', port: 7933 }],
        rpc: {
          host: '127.0.0.1',
          port: 7932,
          username: 'bitcoin',
          password: 'bitcoin'
        }
      }
    };
  }
  for (let [chain, chainObj] of Object.entries(config.chains)) {
    for (let network of Object.keys(chainObj)) {
      let env = process.env;
      if (env[`TRUSTED_${chain}_PEER`]) {
        let peers = config.chains[chain][network].trustedPeers || [];
        peers.push({
          host: env[`TRUSTED_${chain}_PEER`],
          port: env[`TRUSTED_${chain}_PEER_PORT`]
        });
        config.chains[chain][network].trustedPeers = peers;
      }
    }
  }
  return config;
};

module.exports = new Config();
