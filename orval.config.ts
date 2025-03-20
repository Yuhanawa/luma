module.exports = {
	DiscourseAPI: {
		output: {
			target: "./lib/gen/api/discourseAPI.ts",
			schemas: "./lib/gen/api/discourseAPI/schemas",
			client: "axios",
			clean: true,
			biome: true,
			override: {
				//   mutator: {
				//     path: './lib/api/axiosInstance.ts',
				//     name: 'customInstance',
				//   },
			},
		},
		input: {
			target: "./lib/api/openapi.json",
		},
	},
};
