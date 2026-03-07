import type { Preview } from "@storybook/nextjs";
import "../app/globals.css";

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		layout: "centered",
	},
	globalTypes: {
		theme: {
			name: "Theme",
			description: "Global theme",
			defaultValue: "light",
			toolbar: {
				icon: "circlehollow",
				items: [
					{ value: "light", title: "Light" },
					{ value: "dark", title: "Dark" },
				],
				dynamicTitle: true,
			},
		},
	},
	decorators: [
		(Story, context) => {
			const isDark = context.globals.theme === "dark";
			return (
				<div
					className={
						isDark
							? "dark min-h-screen w-full bg-zinc-950 p-6"
							: "min-h-screen w-full bg-zinc-50 p-6"
					}
				>
					<div className="mx-auto w-full max-w-5xl">
						<Story />
					</div>
				</div>
			);
		},
	],
};

export default preview;
