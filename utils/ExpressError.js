// Defining App class object which extends the native built in express error class
// error is like a parent class that has a lot of properties which my custom error classes are likely to includeso we use extend to extend the functionality from Error to our class AppError
class ExpressError extends Error {
     // using constructor method to construct AppError class
    constructor(message, statusCode){
        // using super to reference the class that we are extending from and calls that constructr to use  its own constructor
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}



module.exports = ExpressError;