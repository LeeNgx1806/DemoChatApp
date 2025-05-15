export const errorHandler = (error, context) => {
  console.error(`Error [${context}]:`, error);
  return {
    statusCode: error.statusCode || 500,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      error: error.message || 'Internal Server Error',
      context: context
    })
  };
};
