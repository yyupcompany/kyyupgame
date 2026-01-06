declare module 'joi' {
  export interface StringSchema extends Joi.StringSchema {}
  export interface NumberSchema extends Joi.NumberSchema {}
  export interface BooleanSchema extends Joi.BooleanSchema {}
  export interface ObjectSchema extends Joi.ObjectSchema {}
  export interface ArraySchema extends Joi.ArraySchema {}
  export interface DateSchema extends Joi.DateSchema {}
  export interface FunctionSchema extends Joi.FunctionSchema {}
  export interface AlternativesSchema extends Joi.AlternativesSchema {}
  export interface BinarySchema extends Joi.BinarySchema {}
  export interface AnySchema extends Joi.AnySchema {}
  export interface SchemaLike extends Joi.SchemaLike {}
} 