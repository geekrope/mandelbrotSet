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
    Object.defineProperty(ComplexNumber.prototype, "absolute", {
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
        return ComplexNumber.multiply(z, z);
    };
    return ComplexNumber;
}());
var scope = { x: -2, y: -2, width: 4, height: 4 };
var z_0 = new ComplexNumber(0, 0);
function isInSet(itters, point) {
    var z = new ComplexNumber(0, 0);
    var belongs = true;
    for (var itter = 0; itter < itters && belongs; itter++) {
        z = ComplexNumber.sum(ComplexNumber.square(z), point);
        if (z.absolute > 2) {
            belongs = false;
        }
    }
    return belongs;
}
function draw(ctx) {
    var d = 0.001;
    var itters = 100;
    var points = [];
    for (var x = scope.x; x < scope.width + scope.x; x += d) {
        for (var y = scope.y; y < scope.height + scope.y; y += d) {
            var point = new ComplexNumber(x, y);
            if (isInSet(itters, point)) {
                points.push(point);
            }
        }
    }
    points.forEach(function (point) { ctx.fillRect(point.real * 200 + 500, point.imaginary * 200 + 500, 1, 1); });
}
window.onload = function () {
    var cnvs = document.getElementById("cnvs");
    var ctx = cnvs.getContext("2d");
    draw(ctx);
};
//# sourceMappingURL=app.js.map