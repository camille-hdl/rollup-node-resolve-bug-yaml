
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default [
	{
		input: 'src/main.js',
		output: {
            dir: "./public/dist/",
            format: "es",
        },
		plugins: [
			resolve({
                mainFields: ["module", "main", "browser"],
            }),
			commonjs()
		]
	}
];
