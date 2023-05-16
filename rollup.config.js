import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export default [
	{
		input: 'src/nethack.ts',
		output: {
			dir: 'build',
			format: 'esm'
		},
		plugins: [nodePolyfills(), resolve(), commonjs(), typescript()],
	},
	{
		input: 'src/ui/nethack-ui.ts',
		output: {
			dir: 'build',
			format: 'esm'
		},
		plugins: [typescript()],
	}
]