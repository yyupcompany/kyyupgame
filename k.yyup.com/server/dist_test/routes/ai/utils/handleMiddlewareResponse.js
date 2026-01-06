"use strict";
exports.__esModule = true;
exports.handleMiddlewareResponse = void 0;
var apiResponse_1 = require("../../../utils/apiResponse");
var handleMiddlewareResponse = function (res, result) {
    if (result.success) {
        apiResponse_1.ApiResponse.success(res, result.data);
    }
    else {
        // 默认错误处理
        var statusCode = 400; // Bad Request as default
        if (result.error) {
            switch (result.error.code) {
                case 'FORBIDDEN':
                    statusCode = 403;
                    break;
                case 'NOT_FOUND':
                    statusCode = 404;
                    break;
                case 'UNAUTHORIZED':
                    statusCode = 401;
                    break;
                case 'SERVER_ERROR':
                    statusCode = 500;
                    break;
            }
            apiResponse_1.ApiResponse.error(res, result.error.message, result.error.code, statusCode);
        }
        else {
            apiResponse_1.ApiResponse.serverError(res, 'An unexpected error occurred.');
        }
    }
};
exports.handleMiddlewareResponse = handleMiddlewareResponse;
