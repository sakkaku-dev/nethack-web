import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';

export default [
	{
		input: 'src/nethack.ts',
		output: {
			dir: 'build',
			format: 'esm'
		},
		plugins: [commonjs(), typescript()]
	}
]