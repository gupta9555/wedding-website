// Custom Error class that carries an HTTP status code.
// Lets controllers do: throw new ErrorResponse('Invalid credentials', 401)
// and have it flow straight into the centralized errorHandler.
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;
