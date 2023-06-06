type Rectangle = { x: number, y: number, x2: number, y2: number };
type BelongsToFractal = (itterations: number, point: ComplexNumber) => boolean;
type DynamicProperty<T> = () => T;

class ComplexNumber
{
	private _real: number;
	private _imaginary: number;

	public get real(): number
	{
		return this._real;
	}
	public get imaginary(): number
	{
		return this._imaginary;
	}
	public get absoluteValue(): number
	{
		return Math.sqrt(this._real * this._real + this._imaginary * this._imaginary)
	}

	public static sum(z1: ComplexNumber, z2: ComplexNumber): ComplexNumber
	{
		return new ComplexNumber(z1.real + z2.real, z1.imaginary + z2.imaginary);
	}
	public static multiply(z1: ComplexNumber, z2: ComplexNumber): ComplexNumber
	{
		return new ComplexNumber(z1.real * z2.real - z1.imaginary * z2.imaginary, z1.real * z2.imaginary + z1.imaginary * z2.real);
	}
	public static square(z: ComplexNumber): ComplexNumber
	{
		return new ComplexNumber(z.real * z.real - z.imaginary * z.imaginary, 2 * z.real * z.imaginary);
	}

	public constructor(real: number, imaginary: number)
	{
		this._real = real;
		this._imaginary = imaginary;
	}
}

class Settings
{
	public static readonly mandelbrotSet: BelongsToFractal = (itterations: number, point: ComplexNumber) =>
	{
		let z = new ComplexNumber(0, 0);
		let belongs = true;

		for (let itteration = 0; itteration < itterations && belongs; itteration++)
		{
			z = ComplexNumber.sum(ComplexNumber.square(z), point);

			if (z.absoluteValue > 2)
			{
				belongs = false;
			}
		}

		return belongs;
	}
	public static readonly mandelbrotSetDomain: Rectangle = { x: - 2, y: -2, x2: 2, y2: 2 };
}

class Utils
{
	public static rectanglesIntersection(rect1: Rectangle, rect2: Rectangle): Rectangle
	{
		const x = Math.max(rect1.x, rect2.x);
		const y = Math.max(rect1.y, rect2.y);
		const x2 = Math.min(rect1.x2, rect2.x2);
		const y2 = Math.min(rect1.y2, rect2.y2);

		return { x: x, y: y, x2: x2, y2: y2 };
	}
	public static getCroppedFractalDomain(domain: Rectangle, viewport: Rectangle, transform: DOMMatrix): Rectangle
	{
		const transformed = Utils.rectanglesIntersection(Transform.transformRectangle(domain, transform), viewport);

		return Transform.computeRectangleFromMatrix(transformed, transform);
	}
}

class Transform
{
	public static computePointFromMatrix(transformedPoint: DOMPoint, matrix: DOMMatrix): DOMPoint
	{
		const x = (-matrix.c * matrix.f + matrix.c * transformedPoint.y + matrix.d * matrix.e - matrix.d * transformedPoint.x) / (matrix.b * matrix.c - matrix.a * matrix.d);
		const y = (-matrix.b * matrix.e + matrix.b * transformedPoint.x + matrix.a * matrix.f - matrix.a * transformedPoint.y) / (matrix.b * matrix.c - matrix.a * matrix.d)

		return new DOMPoint(x, y);
	}
	public static computeRectangleFromMatrix(transformedRectangle: Rectangle, matrix: DOMMatrix): Rectangle
	{
		const edge1 = Transform.computePointFromMatrix(new DOMPoint(transformedRectangle.x, transformedRectangle.y), matrix);
		const edge2 = Transform.computePointFromMatrix(new DOMPoint(transformedRectangle.x2, transformedRectangle.y2), matrix);

		return { x: edge1.x, y: edge1.y, x2: edge2.x, y2: edge2.y };
	}
	public static computeScaleMatrix(relativePoint: DOMPoint, previousTransform: DOMMatrix, scale: number): DOMMatrix
	{
		const originalPoint = Transform.computePointFromMatrix(relativePoint, previousTransform);

		return new DOMMatrix([scale, 0, 0, scale, originalPoint.x * (1 - scale) + relativePoint.x, originalPoint.y * (1 - scale) + relativePoint.y]);
	}

	public static transformRectangle(rectangle: Rectangle, matrix: DOMMatrix): Rectangle
	{
		const edge1 = matrix.transformPoint(new DOMPoint(rectangle.x, rectangle.y));
		const edge2 = matrix.transformPoint(new DOMPoint(rectangle.x2, rectangle.y2));

		return { x: edge1.x, y: edge1.y, x2: edge2.x, y2: edge2.y };
	}
}

class ComputingEngine
{
	public static computeFractalPoints(belongsToFractal: BelongsToFractal, step: number, itterations: number, domain: Rectangle)
	{
		const points: ComplexNumber[] = [];

		for (let x = domain.x; x < domain.x2; x += step)
		{
			for (let y = domain.y; y < domain.y2; y += step)
			{
				const point = new ComplexNumber(x, y);

				if (belongsToFractal(itterations, point))
				{
					points.push(point);
				}
			}
		}

		return points;
	}
}

class VisualEngine
{
	private _viewport: DynamicProperty<Rectangle>;
	private _context: CanvasRenderingContext2D;

	public get viewport()
	{
		return this._viewport();
	}
	public get context()
	{
		return this._context;
	}

	public clearCanvas()
	{
		this._context.clearRect(this.viewport.x, this.viewport.y, this.viewport.x2 - this.viewport.x, this.viewport.y2 - this.viewport.y);
	}
	public drawFractal(points: ComplexNumber[], transform: DOMMatrix)
	{
		this._context.save();
		this._context.setTransform(transform);

		points.forEach((point) => { this._context.fillRect(point.real, point.imaginary, 1 / transform.a, 1 / transform.d) });

		this._context.restore();
	}

	public constructor(viewport: DynamicProperty<Rectangle>, context: CanvasRenderingContext2D)
	{
		this._viewport = viewport;
		this._context = context;
	}
}

function drawMandelbrotSet(scale: number, transform: DOMMatrix, visualEngine: VisualEngine, itterations: number)
{
	const points = ComputingEngine.computeFractalPoints(Settings.mandelbrotSet, 1 / scale, itterations, Utils.getCroppedFractalDomain(Settings.mandelbrotSetDomain, visualEngine.viewport, transform));

	visualEngine.drawFractal(points, transform);
}

window.onload = () =>
{
	const cnvs: HTMLCanvasElement = document.getElementById("cnvs") as HTMLCanvasElement;
	const ctx = cnvs.getContext("2d");
	const visualEngine = new VisualEngine(() => { return { x: 0, y: 0, x2: innerWidth, y2: innerHeight } }, ctx);
	const itterations = 50;

	let scale = 100;
	let transform = new DOMMatrix([scale, 0, 0, scale, 500, 500]);
	let lastPoint: DOMPoint | undefined;
	let pressed: boolean;

	drawMandelbrotSet(scale, transform, visualEngine, itterations);

	cnvs.addEventListener("wheel", (e) =>
	{
		scale *= 1 + Math.sign(e.deltaY) * 0.5;
		transform = Transform.computeScaleMatrix(new DOMPoint(e.offsetX, e.offsetY), transform, scale);
		visualEngine.clearCanvas();
		drawMandelbrotSet(scale, transform, visualEngine, itterations);
	});

	cnvs.onmousedown = (e) =>
	{
		lastPoint = new DOMPoint(e.offsetX, e.offsetY);
		pressed = true;
	}

	cnvs.onmousemove = (e) =>
	{
		if (pressed)
		{
			const point = new DOMPoint(e.offsetX, e.offsetY);

			transform.e += point.x - lastPoint.x;
			transform.f += point.y - lastPoint.y;

			lastPoint = point;

			visualEngine.clearCanvas();
			drawMandelbrotSet(scale, transform, visualEngine, itterations);
		}
	}

	cnvs.onmouseup = () =>
	{
		pressed = false;
	}
}
