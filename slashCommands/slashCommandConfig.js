const {
  handleAsk,
  handleNotifications,
  handleLearningPlans
} = require('./slashCommands');

const commands = {
  ask: handleAsk,
  notifications: handleNotifications,
  learning: handleLearningPlans
};

module.exports = commands;
