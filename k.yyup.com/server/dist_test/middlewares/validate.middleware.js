"use strict";
exports.__esModule = true;
exports.validateRequest = void 0;
var validateRequest = function (schema) {
    return function (req, res, next) {
        var error = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        }).error;
        if (error) {
            var errorMessage = error.details.map(function (detail) { return detail.message; }).join(', ');
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: errorMessage
                }
            });
            return;
        }
        next();
    };
};
exports.validateRequest = validateRequest;
