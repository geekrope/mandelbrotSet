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
    Transform.computeFromMatrix = function (transformedPoint, matrix) {
        var x = (-matrix.c * matrix.f + matrix.c * transformedPoint.y + matrix.d * matrix.e - matrix.d * transformedPoint.x) / (matrix.b * matrix.c - matrix.a * matrix.d);
        var y = (-matrix.b * matrix.e + matrix.b * transformedPoint.x + matrix.a * matrix.f - matrix.a * transformedPoint.y) / (matrix.b * matrix.c - matrix.a * matrix.d);
        return new DOMPoint(x, y);
    };
    Transform.computeMatrix = function (relativePoint, scale) {
        return new DOMMatrix([scale, 0, 0, scale, relativePoint.x * (1 - scale), relativePoint.y * (1 - scale)]);
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
function draw(ctx, transform, scale) {
    var frameEdge1 = Transform.computeFromMatrix(new DOMPoint(0, 0), transform);
    var frameEdge2 = Transform.computeFromMatrix(new DOMPoint(1920, 1080), transform);
    ctx.clearRect(frameEdge1.x, frameEdge1.y, frameEdge2.x - frameEdge1.x, frameEdge2.y - frameEdge1.y);
    var points = ComputingEngine.computeFractalPoints(mandelbrotSet, 1 / scale, 10, { x: -2, y: -2, x2: 2, y2: 2 });
    points.forEach(function (point) { ctx.fillRect(point.real, point.imaginary, 1 / scale, 1 / scale); });
}
window.onload = function () {
    var cnvs = document.getElementById("cnvs");
    var ctx = cnvs.getContext("2d");
    var scale = 100;
    var transform = new DOMMatrix([scale, 0, 0, scale, 500, 500]);
    ctx.setTransform(transform);
    draw(ctx, transform, scale);
    cnvs.onmousedown = function (e) {
        scale += 100;
        transform = Transform.computeMatrix(Transform.computeFromMatrix(new DOMPoint(e.x, e.y), transform), scale);
        transform.e += e.x;
        transform.f += e.y;
        ctx.setTransform(transform);
        draw(ctx, transform, scale);
    };
};
//# sourceMappingURL=app.js.map