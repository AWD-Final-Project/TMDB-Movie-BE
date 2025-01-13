// src/utils/mongoose.util.ts
import { Types, Error } from 'mongoose';

export class MongooseUtil {
    // Map of all mongoose error names with descriptions.
    // Documentation: https://mongoosejs.com/docs/api/error.html
    private static readonly MONGOOSE_ERROR_MAP = new Map<string, string>([
        ['MongoError', 'General Mongoose error'],
        ['CastError', 'Mongoose could not convert a value to the type defined in the schema path'],
        [
            'DivergentArrayError',
            'Attempted to save() an array that was modified after loading it with $elemMatch or similar projection',
        ],
        ['MissingSchemaError', 'Tried to access a model with mongoose.model() that was not defined'],
        ['DocumentNotFoundError', 'The document you tried to save() was not found'],
        ['ValidatorError', "Error from an individual schema path's validator"],
        [
            'ValidationError',
            'Error returned from validate() or validateSync(), contains ValidatorError instances in .errors property',
        ],
        ['ObjectExpectedError', 'Thrown when setting a nested path to a non-object value in strict mode'],
        ['ObjectParameterError', 'Thrown when passing a non-object value to a function expecting an object'],
        ['OverwriteModelError', 'Thrown when calling mongoose.model() to redefine an already defined model'],
        ['ParallelSaveError', 'Thrown when calling save() on a document that is already being saved'],
        ['StrictModeError', 'Thrown when setting a path not defined in the schema while strict mode is set to throw'],
        ['VersionError', 'Thrown when the document is out of sync due to concurrent modification'],
    ]);

    // Method to check if the error is a known Mongoose error
    static isMongooseError(error: Error): boolean {
        return this.MONGOOSE_ERROR_MAP.has(error.name);
    }

    // Method to get a description for the Mongoose error
    static getMongooseErrorDescription(error: Error): string {
        return this.MONGOOSE_ERROR_MAP.get(error.name) ?? 'Something went wrong';
    }

    // Convert an id to a Mongoose ObjectId type
    static convertToMongooseObjectIdType(id: string): Types.ObjectId {
        return new Types.ObjectId(id);
    }
}
