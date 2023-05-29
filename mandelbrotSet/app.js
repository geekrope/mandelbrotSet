class ComplexNumber {
    constructor(real, imaginary) {
        this._real = real;
        this._imaginary = imaginary;
    }
    get real() {
        return this._real;
    }
    get imaginary() {
        return this._imaginary;
    }
    get absoluteValue() {
        return Math.sqrt(this._real * this._real + this._imaginary * this._imaginary);
    }
    static sum(z1, z2) {
        return new ComplexNumber(z1.real + z2.real, z1.imaginary + z2.imaginary);
    }
    static multiply(z1, z2) {
        return new ComplexNumber(z1.real * z2.real - z1.imaginary * z2.imaginary, z1.real * z2.imaginary + z1.imaginary * z2.real);
    }
    static square(z) {
        return new ComplexNumber(z.real * z.real - z.imaginary * z.imaginary, 2 * z.real * z.imaginary);
    }
}
class Settings {
}
Settings.mandelbrotSet = (itterations, point) => {
    let z = new ComplexNumber(0, 0);
    let belongs = true;
    for (let itteration = 0; itteration < itterations && belongs; itteration++) {
        z = ComplexNumber.sum(ComplexNumber.square(z), point);
        if (z.absoluteValue > 2) {
            belongs = false;
        }
    }
    return belongs;
};
Settings.mandelbrotSetDomain = { x: -2, y: -2, x2: 2, y2: 2 };
class Utils {
    static rectanglesIntersection(rect1, rect2) {
        const x = Math.max(rect1.x, rect2.x);
        const y = Math.max(rect1.y, rect2.y);
        const x2 = Math.min(rect1.x2, rect2.x2);
        const y2 = Math.min(rect1.y2, rect2.y2);
        return { x: x, y: y, x2: x2, y2: y2 };
    }
    static getCroppedFractalDomain(domain, viewport, transform) {
        const transformed = Utils.rectanglesIntersection(Transform.transformRectangle(domain, transform), viewport);
        return Transform.computeRectangleFromMatrix(transformed, transform);
    }
}
class Transform {
    static computePointFromMatrix(transformedPoint, matrix) {
        const x = (-matrix.c * matrix.f + matrix.c * transformedPoint.y + matrix.d * matrix.e - matrix.d * transformedPoint.x) / (matrix.b * matrix.c - matrix.a * matrix.d);
        const y = (-matrix.b * matrix.e + matrix.b * transformedPoint.x + matrix.a * matrix.f - matrix.a * transformedPoint.y) / (matrix.b * matrix.c - matrix.a * matrix.d);
        return new DOMPoint(x, y);
    }
    static computeRectangleFromMatrix(transformedRectangle, matrix) {
        const edge1 = Transform.computePointFromMatrix(new DOMPoint(transformedRectangle.x, transformedRectangle.y), matrix);
        const edge2 = Transform.computePointFromMatrix(new DOMPoint(transformedRectangle.x2, transformedRectangle.y2), matrix);
        return { x: edge1.x, y: edge1.y, x2: edge2.x, y2: edge2.y };
    }
    static computeScaleMatrix(relativePoint, previousTransform, scale) {
        const originalPoint = Transform.computePointFromMatrix(relativePoint, previousTransform);
        return new DOMMatrix([scale, 0, 0, scale, originalPoint.x * (1 - scale) + relativePoint.x, originalPoint.y * (1 - scale) + relativePoint.y]);
    }
    static transformRectangle(rectangle, matrix) {
        const edge1 = matrix.transformPoint(new DOMPoint(rectangle.x, rectangle.y));
        const edge2 = matrix.transformPoint(new DOMPoint(rectangle.x2, rectangle.y2));
        return { x: edge1.x, y: edge1.y, x2: edge2.x, y2: edge2.y };
    }
}
class ComputingEngine {
    static computeFractalPoints(belongsToFractal, step, itterations, domain) {
        const points = [];
        for (let x = domain.x; x < domain.x2; x += step) {
            for (let y = domain.y; y < domain.y2; y += step) {
                const point = new ComplexNumber(x, y);
                if (belongsToFractal(itterations, point)) {
                    points.push(point);
                }
            }
        }
        return points;
    }
}
class VisualEngine {
    constructor(viewport, context) {
        this._viewport = viewport;
        this._context = context;
    }
    get viewport() {
        return this._viewport();
    }
    get context() {
        return this._context;
    }
    clearCanvas() {
        this._context.clearRect(this.viewport.x, this.viewport.y, this.viewport.x2 - this.viewport.x, this.viewport.y2 - this.viewport.y);
    }
    drawFractal(points, transform) {
        this._context.save();
        this._context.setTransform(transform);
        points.forEach((point) => { this._context.fillRect(point.real, point.imaginary, 1 / transform.a, 1 / transform.d); });
        this._context.restore();
    }
}
function drawMandelbrotSet(scale, transform, visualEngine, itterations) {
    const points = ComputingEngine.computeFractalPoints(Settings.mandelbrotSet, 1 / scale, itterations, Utils.getCroppedFractalDomain(Settings.mandelbrotSetDomain, visualEngine.viewport, transform));
    visualEngine.drawFractal(points, transform);
}
window.onload = () => {
    const cnvs = document.getElementById("cnvs");
    const ctx = cnvs.getContext("2d");
    const visualEngine = new VisualEngine(() => { return { x: 0, y: 0, x2: innerWidth, y2: innerHeight }; }, ctx);
    const itterations = 50;
    let scale = 100;
    let transform = new DOMMatrix([scale, 0, 0, scale, 500, 500]);
    let lastPoint;
    let pressed;
    drawMandelbrotSet(scale, transform, visualEngine, itterations);
    cnvs.addEventListener("wheel", (e) => {
        scale *= 1 + Math.sign(e.deltaY) * 0.5;
        transform = Transform.computeScaleMatrix(new DOMPoint(e.offsetX, e.offsetY), transform, scale);
        visualEngine.clearCanvas();
        drawMandelbrotSet(scale, transform, visualEngine, itterations);
    });
    cnvs.onmousedown = (e) => {
        lastPoint = new DOMPoint(e.offsetX, e.offsetY);
        pressed = true;
    };
    cnvs.onmousemove = (e) => {
        if (pressed) {
            const point = new DOMPoint(e.offsetX, e.offsetY);
            transform.e += point.x - lastPoint.x;
            transform.f += point.y - lastPoint.y;
            lastPoint = point;
            visualEngine.clearCanvas();
            drawMandelbrotSet(scale, transform, visualEngine, itterations);
        }
    };
    cnvs.onmouseup = () => {
        pressed = false;
    };
};
//# sourceMappingURL=app.js.map