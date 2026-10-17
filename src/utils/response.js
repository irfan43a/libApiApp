/**
 * Standardized API Response Helpers
 */

const successResponse = (res, message = 'Success', data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const paginatedResponse = (res, message = 'Success', data = [], pagination = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination,
  });
};

const errorResponse = (res, message = 'An error occurred', error = null, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error && typeof error === 'object' && error.message ? error.message : error,
  });
};

module.exports = {
  successResponse,
  paginatedResponse,
  errorResponse,
};
