module.exports = func => {
    // accepts a function (which may return a promise and have different parameters) and returns a new function that executes the accepted func and adds a catch
    return (req, res, next) => {
        // executes that function with an added catch to pass the error off
        func(req, res, next).catch(next);
    }
}