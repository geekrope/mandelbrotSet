class ComplexNumber
{
	private _real: number;
	private _imaginary: number;

	public get real()
	{
		return this._real;
	}
	public get imaginary()
	{
		return this._imaginary;
	}
	public get absolute()
	{
		return Math.sqrt(this._real * this._real + this._imaginary * this._imaginary)
	}

	public static sum(z1: ComplexNumber, z2: ComplexNumber)
	{
		return new ComplexNumber(z1.real + z2.real, z1.imaginary + z2.imaginary);
	}
	public static multiply(z1: ComplexNumber, z2: ComplexNumber)
	{
		return new ComplexNumber(z1.real * z2.real - z1.imaginary * z2.imaginary, z1.real * z2.imaginary + z1.imaginary * z2.real);
	}
	public static square(z: ComplexNumber)
	{
		return ComplexNumber.multiply(z, z);
	}

	public constructor(real: number, imaginary: number)
	{
		this._real = real;
		this._imaginary = imaginary;
	}
}

const scope = { x: -2, y: -2, width: 4, height: 4 };
const z_0 = new ComplexNumber(0, 0);

function isInSet(itters: number, point: ComplexNumber)
{
	let z = new ComplexNumber(0, 0);
	let belongs = true;

	for (let itter = 0; itter < itters && belongs; itter++)
	{
		z = ComplexNumber.sum(ComplexNumber.square(z), point);

		if (z.absolute > 2)
		{
			belongs = false;
		}
	}

	return belongs;
}

function draw(ctx: CanvasRenderingContext2D)
{
	const d = 0.001;
	const itters = 100;
	const points: ComplexNumber[] = [];
	for (let x = scope.x; x < scope.width + scope.x; x += d)
	{
		for (let y = scope.y; y < scope.height + scope.y; y += d)
		{
			const point = new ComplexNumber(x, y);

			if (isInSet(itters, point))
			{
				points.push(point);
			}
		}
	}

	points.forEach((point) => { ctx.fillRect(point.real * 200 + 500, point.imaginary * 200 + 500, 1, 1) });
}

window.onload = () =>
{
	const cnvs: HTMLCanvasElement = document.getElementById("cnvs") as HTMLCanvasElement;
	const ctx = cnvs.getContext("2d");

	draw(ctx);

}
