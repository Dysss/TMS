<script>
	import { axiosInstance } from '../../axios';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { error } from '@sveltejs/kit';
	import TopNavbar from '../../components/navbar.svelte';
	import Toast from '../../components/toast.svelte';

	let username = '';
	let email = '';

	let newEmail = '';
	let newPassword = '';

	let updatingEmail = false;
	let updatingPassword = false;

	let statusMsg = '';
	let showToast = false;
	let toastType;

	const fetchDetails = async () => {
		const response = await axiosInstance.get('/api/users/profile');

		if (response.status == 401) {
			console.log('401 unauthorized, redirecting to login');
			goto('/login');
		} else if (response.status == 500) {
			error(500, {
				message: 'Internal server error'
			});
		} else if (response.status == 200) {
			username = response.data.data[0].user_name;
			email = response.data.data[0].email;
		}
	};

	onMount(() => {
		fetchDetails();
	});

	const updateEmail = async () => {
		updatingEmail = true;

		try {
			if (validateEmail(newEmail)) {
				const response = await axiosInstance.put('/api/users/update-email', {
					targetUser: username,
					newEmail: newEmail
				});

				if (response.data.success == true) {
					triggerToast('Email successfully updated', 'success');
					newEmail = '';
					fetchDetails();
				} else {
					triggerToast('Error: Failed to update email', 'error');
					console.log(response.data);
				}
			} else {
				triggerToast('Error: Invalid email format', 'error');
			}
		} catch (err) {
			console.log(err);
		} finally {
			updatingEmail = false;
		}
	};

	const updatePassword = async () => {
		updatingPassword = true;

		try {
			if (validatePassword(newPassword)) {
				const response = await axiosInstance.put('/api/users/update-password', {
					targetUser: username,
					newPassword: newPassword
				});

				if (response.data.success == true) {
					triggerToast('Password successfully updated', 'success');
					newPassword = '';
					fetchDetails();
				} else {
					triggerToast('Error: Failed to update email', 'error');
				}
			} else {
				triggerToast(
					'Error: Invalid password format. Please use a password of 8-10 characters consisting of alphabets, numbers and special characters', 'error'
				);
			}
		} catch (err) {
			console.log(err);
		} finally {
			updatingPassword = false;
		}
	};

	const validatePassword = (password) => {
		const hasLetter = /[a-zA-Z]/;
		const hasNum = /\d/;
		const hasSpecialChar = /[~!@#$%^&*()_+{}|:"<>?\-=\[\]\\;',./]/;

		return hasLetter.test(password) && hasNum.test(password) && hasSpecialChar.test(password);
	};

	const validateEmail = (email) => {
		const validEmail =
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		return validEmail.test(email);
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

<TopNavbar pageTitle="User profile" />
<div class="container">
	<h1>User details</h1>
	<p>Username: {username}</p>
	<p>Email: {email}</p>

	<h1>Change email</h1>
	<form class="update-email" on:submit|preventDefault={updateEmail}>
		<label for="email">New email: </label>
		<input id="email" type="text" bind:value={newEmail} required />
		<button type="submit" disabled={updatingEmail}>Update email</button>
	</form>

	<h1>Change password</h1>
	<form class="update-password" on:submit|preventDefault={updatePassword}>
		<label for="password">New password: </label>
		<input id="password" type="password" bind:value={newPassword} required />
		<button type="submit" disabled={updatingPassword}>Update password</button>
	</form>

	<Toast message={statusMsg} visible={showToast} type={toastType} duration="2000" />
</div>

<style>
	.container {
		padding: 30px;
	}

	button {
		padding: 10px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 16px;
	}

	button:disabled {
		background-color: #ccc;
		cursor: not-allowed;
	}

	button:hover:enabled {
		background-color: #0056b3;
	}
</style>
