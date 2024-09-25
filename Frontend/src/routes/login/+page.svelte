<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { axiosInstance } from '../../axios';
	import Toast from '../../components/toast.svelte';

	let username = '';
	let password = '';
	let errorMsg = '';
	let isLoading = false;
	let statusMsg = '';
	let showToast = false;
	let toastType;

	const login = async () => {
		isLoading = true;
		errorMsg = '';

		if (!username || !password) {
			triggerToast('Incorrect credentials', 'error');
			isLoading = false;
		} else {
			try {
				const res = await axiosInstance.post(
					'/api/auth/login',
					JSON.stringify({
						username: username,
						password: password
					})
				);

				if (res.data.success == true) {
					console.log('logged in')
					goto('/appList');
				} else {
					console.log(res.data)
					triggerToast('Incorrect credentials', 'error');
				}
			} catch (err) {
				console.log(err);
				throw err;
			} finally {
				isLoading = false;
			}
		}
	};

	const triggerToast = (message, type='info') => {
		statusMsg = message;
		showToast = true;
		toastType = type;

		setTimeout(() => {
			showToast = false;
		}, 2000);
	};
</script>

<div class="login-container">
	<form class="login-form" on:submit|preventDefault={login}>
		<h1 class="login-title">Login</h1>

		<div>
			<label for="username">Username:</label>
			<input id="username" type="text" bind:value={username} />
		</div>
		<div>
			<label for="password">Password:</label>
			<input id="password" type="password" bind:value={password} />
		</div>
		<button type="submit" disabled={isLoading}>
			{isLoading ? 'Logging in...' : 'Login'}
		</button>
	</form>

	<Toast message={statusMsg} visible={showToast} type={toastType} duration="2000" />
</div>

<style>
	.login-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		background-color: #f9f9f9;
	}

	.login-form {
		display: flex;
		flex-direction: column;
		width: 300px;
		padding: 20px;
		border-radius: 5px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		background-color: white;
	}

	.login-title {
		margin-bottom: 20px;
		text-align: center;
		font-size: 24px;
		font-weight: bold;
		color: #333;
	}

	.login-form input {
		margin-bottom: 15px;
		padding: 10px;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 14px;
	}

	.login-form button {
		padding: 10px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 16px;
	}

	.login-form button:disabled {
		background-color: #ccc;
		cursor: not-allowed;
	}

	.login-form button:hover:enabled {
		background-color: #0056b3;
	}
</style>
