exports.consumeMessages = async (messages) => {
    messages.forEach((message) => {
      console.log("Processing message", message);
    });
  };