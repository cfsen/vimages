import cs from "./common.module.css";

export enum CssPreset {
	Container,
	Row,
	Column,
	InputFieldActive,
	InputFieldInactive,
};

export function CssSelect(preset: CssPreset): string {
	switch(preset){
		case CssPreset.Container:
			return [cs.Container, cs.Row].join(" ");
		case CssPreset.Row:
			return [cs.FlexRow, cs.Gap, cs.ContainerMargin].join(" ");
		case CssPreset.Column:
			return [cs.FlexColum].join(" ");
		case CssPreset.InputFieldActive:
			return [cs.Bg900, cs.ColPrimary100, cs.InputBorder, cs.BorderColPrimary700, cs.InputPadding].join(" ");
		case CssPreset.InputFieldInactive:
			return [cs.Bg900, cs.Col600, cs.InputBorder, cs.BorderCol700, cs.InputPadding].join(" ");
		default:
			return "";
	}
}
