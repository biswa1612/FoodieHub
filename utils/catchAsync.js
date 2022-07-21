//it is for all async functions
module.exports = func => {
    return (req,res,next) => {  //this returns new function which has func executed(function passed) and it catches error if any and passes on to next
        func(req,res,next).catch(next);
    }
}