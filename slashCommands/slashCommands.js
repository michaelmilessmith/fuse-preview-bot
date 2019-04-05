const {
  submitQuestion,
  getNotifications,
  getLearningPlans
} = require('../apiService');

const handleAsk = async (text) => {
  try {
    const question = text.substring(text.indexOf(' ') + 1);
    await submitQuestion({ question });
    return 'Your question was posted to Fuse successfully!';
  } catch (err) {
    return "Sorry, your question couldn't be posted";
  }
};

const handleNotifications = async () => {
  try {
    const res = await getNotifications();
    const result = {
      text: `
    _*Here are your latest Fuse notifications:*_
    `
    };

    res.body.notifications.forEach((notification) => {
      const {
        message: { template },
        message
      } = notification;
      const interpolatedMessage = template.replace(/(%{\w+})/g, (match) => {
        const strippedVar = match.substr(2, match.length - 3);
        return message.data[strippedVar];
      });

      result.text += `
      - ${interpolatedMessage}`;
    });

    result.text += `
    
    _See more on Fuse: ${process.env.FUSE_URL}/notifications _
    `;

    return result;
  } catch (err) {
    console.log(err);
    return 'Sorry, your notifications could not be obtained';
  }
};

const handleLearningPlans = async () => {
  try {
    const res = await getLearningPlans();
    const result = {
      text: `
      _*Here are the Fuse Learning plans you're working on:*_
      `
    };

    res.body.learning_plans.forEach((learningPlan) => {
      result.text += `
        - *${learningPlan.title}* - Progress: ${learningPlan.progress}`;
    });

    result.text += `
    
    _See more on Fuse: ${process.env.FUSE_URL}/learning/plans _
    `;

    return result;

  } catch (err) {
    console.log(err);
    return 'There was a problem getting your learning plans';
  }
};

module.exports = {
  handleAsk,
  handleNotifications,
  handleLearningPlans
};
