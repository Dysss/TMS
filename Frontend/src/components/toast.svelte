<script>
	export let message = '';
	export let visible = false;
	export let duration = 3000;
	export let bgColor = '#ff0000';

	let show = false;

	$: {
		if (visible) {
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
	}
	.toast.show {
		opacity: 1;
	}
</style>
