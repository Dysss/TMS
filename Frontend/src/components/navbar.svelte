<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { axiosInstance } from '../axios';

	let isAdmin = false;
	let username;
	export let pageTitle = 'TMS';

	onMount(async () => {
		// console.log("Mounting navbar")
		try {
			const checkActive = await axiosInstance.get('/api/auth/verify');

			if (checkActive.status != 200) {
				console.log("User unauthorized");
				logout();
			}

			const checkAdminRes = await axiosInstance.post('/api/users/check-group', {
				group: 'admin'
			});

			if (checkAdminRes.data.result == true) {
				isAdmin = true;
			}
	
			const getUsernameRes = await axiosInstance.get('/api/users/profile');
	
			if (getUsernameRes.status == 200) {
				username = getUsernameRes.data.data[0].user_name;
			}
		} catch (err) {
			console.log("Unknown error");
			logout();
		}
	});

	const logout = async () => {
		try {
			const logoutRes = await axiosInstance.get('/api/auth/logout');

			if (logoutRes.status == 200) {
				console.log("Logging out");
				goto('/login');
			} else {
				console.log(logoutRes);
			}
		} catch (err) {
			console.log(err);
		}
	};
</script>

<nav>
	<div class="nav-container">
		<div class="nav-title">{pageTitle}</div>
		<div class="user-profile">
			<div class="user-name">{username}</div>
			<div class="user-icon">U</div>
			<div class="dropdown">
				<a href="/appList">App list</a>
				<a href="/profile">Profile</a>
				{#if isAdmin}
					<a href="/user-management">User management</a>
				{/if}
				<a on:click={logout}>Logout</a>
			</div>
		</div>
	</div>
</nav>

<style>
	/* General reset */
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	body {
		font-family: Arial, sans-serif;
		line-height: 1.6;
	}

	/* Navbar styling */
	nav {
		background-color: #333;
		color: #fff;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
	}

	.nav-container {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.nav-title {
		font-size: 1.5rem;
		font-weight: bold;
	}

	/* .user-profile {
		position: relative;
		display: inline-block;
		cursor: pointer;
		padding: 10px;
	} */
	.user-profile {
		position: relative;
		display: flex;
		align-items: center;
		cursor: pointer;
		padding: 10px;
	}

	.user-name {
		padding-right: 10px;
	}

	.user-icon {
		width: 40px;
		height: 40px;
		background-color: #888;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 1.2rem;
		color: white;
	}

	/* Dropdown menu styling */
	.dropdown {
		display: none;
		position: absolute;
		top: 50px;
		right: 0;
		background-color: #444;
		padding: 1rem;
		border-radius: 5px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		min-width: 150px;
		z-index: 1000;
	}

	.dropdown a {
		color: #fff;
		text-decoration: none;
		display: block;
		padding: 0.5rem 0;
		transition: background-color 0.3s ease;
	}

	.dropdown a:hover {
		background-color: #555;
	}

	.user-profile:hover .dropdown,
	.user-profile:focus-within .dropdown {
		display: block;
	}
</style>
