class ApiResponse {
  constructor(statusCode, data = null, message = "success") {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}

module.exports = ApiResponse;
