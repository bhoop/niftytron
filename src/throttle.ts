type F = (...args: any[]) => any;

// export default function throttle<T extends F>(func: T, time = 300) {

export default function throttle<T extends F>(func: T, wait = 300): T {
	var timeout, context, args, result;
	var previous = 0;

	var later = function () {
		previous = Date.now();
		timeout = null;
		result = func.apply(context, args);
		if (!timeout) context = args = null;
	};

	var throttled = function () {
		var _now = Date.now();
		if (!previous) previous = _now;
		var remaining = wait - (_now - previous);
		context = this;
		args = arguments;
		if (remaining <= 0 || remaining > wait) {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
			previous = _now;
			result = func.apply(context, args);
			if (!timeout) context = args = null;
		} else if (!timeout) {
			timeout = setTimeout(later, remaining);
		}
		return result;
	};

	throttled.cancel = function () {
		clearTimeout(timeout);
		previous = 0;
		timeout = context = args = null;
	};

	return throttled;
}
