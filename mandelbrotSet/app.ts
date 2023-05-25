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
	public static computeFromMatrix(transformedPoint: DOMPoint, matrix: DOMMatrix): DOMPoint
	{
		const x = (-matrix.c * matrix.f + matrix.c * transformedPoint.y + matrix.d * matrix.e - matrix.d * transformedPoint.x) / (matrix.b * matrix.c - matrix.a * matrix.d);
		const y = (-matrix.b * matrix.e + matrix.b * transformedPoint.x + matrix.a * matrix.f - matrix.a * transformedPoint.y) / (matrix.b * matrix.c - matrix.a * matrix.d)

		return new DOMPoint(x, y);
	}
	public static computeMatrix(relativePoint: DOMPoint, scale: number)
	{
		return new DOMMatrix([scale, 0, 0, scale, relativePoint.x * (1 - scale), relativePoint.y * (1 - scale)]);
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

function draw(ctx: CanvasRenderingContext2D, transform: DOMMatrix, scale)
{
	const frameEdge1 = Transform.computeFromMatrix(new DOMPoint(0, 0), transform);
	const frameEdge2 = Transform.computeFromMatrix(new DOMPoint(1920, 1080), transform);

	ctx.clearRect(frameEdge1.x, frameEdge1.y, frameEdge2.x - frameEdge1.x, frameEdge2.y - frameEdge1.y);

	const points = ComputingEngine.computeFractalPoints(mandelbrotSet, 1 / scale, 10, { x: - 2, y: -2, x2: 2, y2: 2 });

	points.forEach((point) => { ctx.fillRect(point.real, point.imaginary, 1 / scale, 1 / scale) });
}

window.onload = () =>
{
	const cnvs: HTMLCanvasElement = document.getElementById("cnvs") as HTMLCanvasElement;
	const ctx = cnvs.getContext("2d");

	let scale = 100;
	let transform = new DOMMatrix([scale, 0, 0, scale, 500, 500]);

	ctx.setTransform(transform);

	draw(ctx, transform, scale);

	cnvs.onmousedown = (e) =>
	{
		scale += 100;

		transform = Transform.computeMatrix(Transform.computeFromMatrix(new DOMPoint(e.x, e.y), transform), scale);

		transform.e += e.x;
		transform.f += e.y;

		ctx.setTransform(transform);
		draw(ctx, transform, scale);
	}
}
