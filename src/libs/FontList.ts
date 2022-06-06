import { useMemo, useEffect } from 'react'

export const FontList = [
	'MS UI Gothic',
	'ＭＳ Ｐゴシック',
	'MS PGothic',
	'ＭＳ ゴシック',
	'MS Gothic',
	'ＭＳ Ｐ明朝',
	'MS PMincho',
	'ＭＳ 明朝',
	'MS Mincho',
	'メイリオ',
	'Meiryo',
	'Meiryo UI',
	'游ゴシック',
	'Yu Gothic',
	'游明朝',
	'Yu Mincho',
	'ヒラギノ角ゴ Pro W3',
	'Hiragino Kaku Gothic Pro',
	'ヒラギノ角ゴ ProN W3',
	'Hiragino Kaku Gothic ProN',
	'HiraKakuProN-W3',
	'ヒラギノ角ゴ Pro W6',
	'HiraKakuPro-W6',
	'ヒラギノ角ゴ ProN W6',
	'HiraKakuProN-W6',
	'ヒラギノ角ゴ Std W8',
	'Hiragino Kaku Gothic Std',
	'ヒラギノ角ゴ StdN W8',
	'Hiragino Kaku Gothic StdN',
	'ヒラギノ丸ゴ Pro W4',
	'Hiragino Maru Gothic Pro',
	'ヒラギノ丸ゴ ProN W4',
	'Hiragino Maru Gothic ProN',
	'ヒラギノ明朝 Pro W3',
	'Hiragino Mincho Pro',
	'ヒラギノ明朝 ProN W3',
	'Hiragino Mincho ProN',
	'HiraMinProN-W3',
	'ヒラギノ明朝 Pro W6',
	'HiraMinPro-W6',
	'ヒラギノ明朝 ProN W6',
	'HiraMinProN-W6',
	'游ゴシック体',
	'YuGothic',
	'游明朝体',
	'YuMincho',
	'游明朝体+36ポかな',
	'YuMincho +36p Kana',
	'クレー',
	'Klee',
	'筑紫A丸ゴシック',
	'Tsukushi A Round Gothic',
	'筑紫B丸ゴシック',
	'Tsukushi B Round Gothic',
	'Osaka',
	'Osaka－等幅',
	'Osaka-Mono',
	'Droid Sans',
	'Roboto',
	'cursive',
	'Comic Sans MS',
	'HGP行書体',
	'HG正楷書体-PRO',
	'Jenkins v2.0',
	'Mv Boli',
	'Script',
]

// check if specified font is installed
export const isFontInstalled = (font:string) => {
	const test = document.createElement('span')
	test.style.fontFamily = font
	return test.style.fontFamily === font
}

export const useFontList = (defaultFont:string, ignoreInvalid:boolean=true) => {
	const fontList = useMemo(() => {
		const list = FontList.slice()
			.filter(font => !ignoreInvalid || isFontInstalled(font))
			.sort()
		list.unshift(defaultFont)
		return list
	}, [])
	return fontList
}