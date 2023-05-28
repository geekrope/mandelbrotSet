type rectangle = { x: number, y: number, x2: number, y2: number };
type belongsToFractal = (itterations: number, point: ComplexNumber) => boolean;

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

class ComputingEngine
{
	public static computeFractalPoints(belongsToFractal: belongsToFractal, step: number, itterations: number, scope: rectangle)
	{
		const points: ComplexNumber[] = [];

		for (let x = scope.x; x < scope.x2; x += step)
		{
			for (let y = scope.y; y < scope.y2; y += step)
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

class Transform
{
	public static computePointFromMatrix(transformedPoint: DOMPoint, matrix: DOMMatrix): DOMPoint
	{
		const x = (-matrix.c * matrix.f + matrix.c * transformedPoint.y + matrix.d * matrix.e - matrix.d * transformedPoint.x) / (matrix.b * matrix.c - matrix.a * matrix.d);
		const y = (-matrix.b * matrix.e + matrix.b * transformedPoint.x + matrix.a * matrix.f - matrix.a * transformedPoint.y) / (matrix.b * matrix.c - matrix.a * matrix.d)

		return new DOMPoint(x, y);
	}
	public static computeRectangleFromMatrix(transformedRectangle: rectangle, matrix: DOMMatrix)
	{
		const edge1 = Transform.computePointFromMatrix(new DOMPoint(transformedRectangle.x, transformedRectangle.y), matrix);
		const edge2 = Transform.computePointFromMatrix(new DOMPoint(transformedRectangle.x2, transformedRectangle.y2), matrix);

		return { x: edge1.x, y: edge1.y, x2: edge2.x, y2: edge2.y };
	}
	public static computeMatrix(relativePoint: DOMPoint, previousTransform: DOMMatrix, scale: number)
	{
		const originalPoint = Transform.computePointFromMatrix(relativePoint, previousTransform);

		return new DOMMatrix([scale, 0, 0, scale, originalPoint.x * (1 - scale) + relativePoint.x, originalPoint.y * (1 - scale) + relativePoint.y]);
	}
}

const mandelbrotSet: belongsToFractal = (itterations: number, point: ComplexNumber) =>
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

function draw(ctx: CanvasRenderingContext2D, points: ComplexNumber[], transform: DOMMatrix)
{
	const frame = Transform.computeRectangleFromMatrix({ x: 0, y: 0, x2: 1920, y2: 1080 }, transform);

	ctx.clearRect(frame.x, frame.y, frame.x2 - frame.x, frame.y2 - frame.y);

	points.forEach((point) => { ctx.fillRect(point.real, point.imaginary, 1 / transform.a, 1 / transform.d) });
}

window.onload = () =>
{
	const cnvs: HTMLCanvasElement = document.getElementById("cnvs") as HTMLCanvasElement;
	const ctx = cnvs.getContext("2d");

	let scale = 100;
	let transform = new DOMMatrix([scale, 0, 0, scale, 500, 500]);
	let points = ComputingEngine.computeFractalPoints(mandelbrotSet, 1 / scale, 10, { x: - 2, y: -2, x2: 2, y2: 2 });

	ctx.setTransform(transform);

	draw(ctx, points, transform);

	cnvs.onmousedown = (e) =>
	{
		scale += 100;

		transform = Transform.computeMatrix(new DOMPoint(e.x, e.y), transform, scale);

		points = ComputingEngine.computeFractalPoints(mandelbrotSet, 1 / scale, 10, { x: - 2, y: -2, x2: 2, y2: 2 });

		ctx.setTransform(transform);
		draw(ctx, points, transform);
	}
}
