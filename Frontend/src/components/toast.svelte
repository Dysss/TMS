<script>
	export let message = '';
	export let visible = false;
	export let duration = 3000;
	export let type = 'info';

	let show = false;
	let bgColor;

	$: {
		if (visible) {
			if (type === "info") bgColor = '#0000ff';
			else if (type === "error") bgColor = '#ff0000';
			else if (type === "success") bgColor = '#00ff00'

			show = true;
			setTimeout(() => {
				show = false;
			}, duration);
		}
	}
</script>

<div class="toast {show ? 'show' : ''}" style="background-color: {bgColor}">
	{message}
</div>

<style>
	.toast {
		position: fixed;
		bottom: 20px;
		left: 20px;
		color: white;
		padding: 15px;
		border-radius: 5px;
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
		z-index: 999;
	}
	.toast.show {
		opacity: 1;
	}
</style>
