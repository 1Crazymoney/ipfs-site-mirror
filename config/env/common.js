/*
  This file is used to store unsecure, application-specific data common to all
  environments.
*/

module.exports = {
  port: process.env.PORT || 3210,
  BCHADDR: `bitcoincash:qzx5w7zqm5geykxaydvfpctxf9qklv4ylg7wwxckkg`,
  stateFileName: `state.json`,
  ipfsPort1: 4002,
  ipfsPort2: 4003
}
