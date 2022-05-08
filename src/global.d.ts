/* Settings have to be global */
declare global {
	interface Window {
		settings: {
			[index: string]: boolean | string | number
		};
	}
}

export {};
