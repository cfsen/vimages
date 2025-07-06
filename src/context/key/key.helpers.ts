const numeric = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function isStrictInteger(input: string): boolean {
  const num = Number(input);
  return Number.isInteger(num) && input.trim() === num.toString();
}

export function getNumberEndsIdx(input: string): number {
	let lastNumberIdx = -1;
	for(let i = 0; i < input.length; i++){
		if(numeric.includes(input[i])) lastNumberIdx = i;	
		else break;
	}
	return lastNumberIdx;
}


