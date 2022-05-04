
type F = (...args: any[]) => any;

export default function debounce<T extends F>(func: T, timeout = 300) {
	let timer: number;
	return ( ...args: Parameters<T> ) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			func( ...args );
		}, timeout);
	};
}
