var admin = require("firebase-admin");

var serviceAccount = require('../startup/taxi-2550b-firebase-adminsdk-9ck1m-3a632cfed8.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const pushNotification = async (token, title, body) => {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: token,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully sent notification:", response);
  } catch (err) {
    console.error("Error sending notification:", err);
  }
};

const pushNotificationToMany = (message) => {
  
  admin.messaging().sendMulticast(message)
  .then((response) => {
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  })
};

const pushNotificationWithMessage = async (message) => {
  

  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully sent notification:", response);
  } catch (err) {
    console.error("Error sending notification:", err);
  }
};

module.exports.pushNotification=pushNotification;
module.exports.pushNotificationToMany=pushNotificationToMany;
module.exports.pushNotificationWithMessage = pushNotificationWithMessage