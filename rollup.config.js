import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import cleanup from 'rollup-plugin-cleanup';
import shebang from 'rollup-plugin-preserve-shebang';
import license from 'rollup-plugin-license';

export default [
	{
		input: 'src/index.ts',
		output: [
			{
				file: 'bin/index.min.js',
				format: 'module',
				sourcemap: false,
				exports: 'named',
			},
		],
		external: ['log-symbols', '@inquirer/prompts', 'clipboardy', 'jose'],
		plugins: [
			license({
				banner:
					'Copyright (c) 2023 Facundo Carbonel / JWTier\n\nThis source code is licensed under the MIT license found in the\nLICENSE file in the root directory of this source tree.',
			}),
			shebang(),
			cleanup({ comments: 'license' }),
			process.env.NODE_ENV === 'production' &&
				terser({
					output: {
						comments: true,
					},
				}),
			typescript(),
		],
	},
	{
		input: `src/index.ts`,
		plugins: [dts()],
		output: {
			file: `bin/index.d.ts`,
			format: 'es',
		},
	},
];
