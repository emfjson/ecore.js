var root = this;
var Bench = {};

/**
 * Figure out how long it takes for a method to execute.
 *
 * @param {func} method to test
 * @param {int} iterations number of executions.
 * @param {Array} args to pass in.
 * @param {T} context the context to call the method in.
 * @return {int} the time it took, in milliseconds to execute.
 */
Bench.bench = function(method, iterations, args, context) {

    var time = 0;
    var timer = function (action) {
        var d = +(new Date);
        if (time < 1 || action === 'start') {
            time = d;
            return 0;
        } else if (action === 'stop') {
            var t = d - time;
            time = 0;
            return t;
        } else {
            return d - time;
        }
    };

    var result = [];
    var i = 0;
    timer('start');
    while (i < iterations) {
        result.push(method.apply(context, args));
        i++;
    }

    var execTime = timer('stop');

    if ( typeof console === "object") {
        console.log("Mean execution time was: ", execTime / iterations);
        console.log("Sum execution time was: ", execTime);
        console.log("Result of the method call was:", result[0]);
    }

    return execTime;
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Bench;
    }
    exports.Bench = Bench;
} else {
    root.Bench = Bench;
}

