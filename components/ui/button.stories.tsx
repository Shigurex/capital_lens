import type { Meta, StoryObj } from "@storybook/nextjs";

import { Button } from "@/components/ui/button";

const meta = {
	title: "ui/Button",
	component: Button,
	tags: ["autodocs"],
	args: {
		children: "Button",
		variant: "default",
		size: "default",
	},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Outline: Story = {
	args: {
		variant: "outline",
		children: "Outline",
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
		children: "Disabled",
	},
};
