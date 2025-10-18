export function timestamp(): string {
	return new Date().toLocaleTimeString('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	});
}

export function BooleanToString(bool: boolean): string {
	return bool ? "True" : "False";
}
