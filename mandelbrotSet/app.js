var ComplexNumber = /** @class */ (function () {
    function ComplexNumber(real, imaginary) {
        this._real = real;
        this._imaginary = imaginary;
    }
    Object.defineProperty(ComplexNumber.prototype, "real", {
        get: function () {
            return this._real;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ComplexNumber.prototype, "imaginary", {
        get: function () {
            return this._imaginary;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ComplexNumber.prototype, "absoluteValue", {
        get: function () {
            return Math.sqrt(this._real * this._real + this._imaginary * this._imaginary);
        },
        enumerable: false,
        configurable: true
    });
    ComplexNumber.sum = function (z1, z2) {
        return new ComplexNumber(z1.real + z2.real, z1.imaginary + z2.imaginary);
    };
    ComplexNumber.multiply = function (z1, z2) {
        return new ComplexNumber(z1.real * z2.real - z1.imaginary * z2.imaginary, z1.real * z2.imaginary + z1.imaginary * z2.real);
    };
    ComplexNumber.square = function (z) {
        return new ComplexNumber(z.real * z.real - z.imaginary * z.imaginary, 2 * z.real * z.imaginary);
    };
    return ComplexNumber;
}());
var ComputingEngine = /** @class */ (function () {
    function ComputingEngine() {
    }
    ComputingEngine.computeFractalPoints = function (belongsToFractal, step, itterations, scope) {
        var points = [];
        for (var x = scope.x; x < scope.x2; x += step) {
            for (var y = scope.y; y < scope.y2; y += step) {
                var point = new ComplexNumber(x, y);
                if (belongsToFractal(itterations, point)) {
                    points.push(point);
                }
            }
        }
        return points;
    };
    return ComputingEngine;
}());
var Transform = /** @class */ (function () {
    function Transform() {
    }
    Transform.computePointFromMatrix = function (transformedPoint, matrix) {
        var x = (-matrix.c * matrix.f + matrix.c * transformedPoint.y + matrix.d * matrix.e - matrix.d * transformedPoint.x) / (matrix.b * matrix.c - matrix.a * matrix.d);
        var y = (-matrix.b * matrix.e + matrix.b * transformedPoint.x + matrix.a * matrix.f - matrix.a * transformedPoint.y) / (matrix.b * matrix.c - matrix.a * matrix.d);
        return new DOMPoint(x, y);
    };
    Transform.computeRectangleFromMatrix = function (transformedRectangle, matrix) {
        var edge1 = Transform.computePointFromMatrix(new DOMPoint(transformedRectangle.x, transformedRectangle.y), matrix);
        var edge2 = Transform.computePointFromMatrix(new DOMPoint(transformedRectangle.x2, transformedRectangle.y2), matrix);
        return { x: edge1.x, y: edge1.y, x2: edge2.x, y2: edge2.y };
    };
    Transform.computeMatrix = function (relativePoint, previousTransform, scale) {
        var originalPoint = Transform.computePointFromMatrix(relativePoint, previousTransform);
        return new DOMMatrix([scale, 0, 0, scale, originalPoint.x * (1 - scale) + relativePoint.x, originalPoint.y * (1 - scale) + relativePoint.y]);
    };
    return Transform;
}());
var mandelbrotSet = function (itterations, point) {
    var z = new ComplexNumber(0, 0);
    var belongs = true;
    for (var itteration = 0; itteration < itterations && belongs; itteration++) {
        z = ComplexNumber.sum(ComplexNumber.square(z), point);
        if (z.absoluteValue > 2) {
            belongs = false;
        }
    }
    return belongs;
};
function draw(ctx, points, transform) {
    var frame = Transform.computeRectangleFromMatrix({ x: 0, y: 0, x2: 1920, y2: 1080 }, transform);
    ctx.clearRect(frame.x, frame.y, frame.x2 - frame.x, frame.y2 - frame.y);
    points.forEach(function (point) { ctx.fillRect(point.real, point.imaginary, 1 / transform.a, 1 / transform.d); });
}
window.onload = function () {
    var cnvs = document.getElementById("cnvs");
    var ctx = cnvs.getContext("2d");
    var scale = 100;
    var transform = new DOMMatrix([scale, 0, 0, scale, 500, 500]);
    var points = ComputingEngine.computeFractalPoints(mandelbrotSet, 1 / scale, 10, { x: -2, y: -2, x2: 2, y2: 2 });
    ctx.setTransform(transform);
    draw(ctx, points, transform);
    cnvs.onmousedown = function (e) {
        scale += 100;
        transform = Transform.computeMatrix(new DOMPoint(e.x, e.y), transform, scale);
        points = ComputingEngine.computeFractalPoints(mandelbrotSet, 1 / scale, 10, { x: -2, y: -2, x2: 2, y2: 2 });
        ctx.setTransform(transform);
        draw(ctx, points, transform);
    };
};
//# sourceMappingURL=app.js.map