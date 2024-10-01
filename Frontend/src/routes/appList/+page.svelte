<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { axiosInstance } from '../../axios';
	import { onMount } from 'svelte';
	import TopNavbar from '../../components/navbar.svelte';
	import AppModal from '../../components/appModal.svelte';
	import axios from 'axios';
	import { sharedAppAcronym } from '$lib/store';

	let isPL;
	let apps = [];
	let showAppModal = false;
	let appModalEditMode;
	let targetAppAcronym;

	const fetchApps = async () => {
		let response = await axiosInstance.get('/api/app/get-all-apps-overview');
		apps = response.data.data;
	}

	const checkPL = async() => {
		let response = await axiosInstance.post('/api/users/check-group', {
			group: "pl"
		})
		isPL = response.data.result;
	}

	onMount(async () => {
		await fetchApps();
		await checkPL();
	})

	const openAppModal = async (editMode, targetAcronym) => {
		await checkPL();
		appModalEditMode = editMode;
		targetAppAcronym = targetAcronym

		showAppModal = true;
	}

	const closeAppModal = async (event) => {
		appModalEditMode = null;
		showAppModal = false;
		await fetchApps()
	}

	const gotoApp = (appAcronym) => {
		sharedAppAcronym.set(appAcronym);
		goto('/app');
	}
</script>

<TopNavbar pageTitle="App List" />

<div class="header">
	<h1>Applications</h1>
	{#if isPL}
		<button class="create-btn" on:click={() => openAppModal(false, null)}>Create App</button>
	{/if}
</div>

{#if appModalEditMode !== null}
	<AppModal showModal={showAppModal} on:close={closeAppModal} editMode={appModalEditMode} targetAppAcronym={targetAppAcronym}/>
{/if}

<div class='container'>
	<div class="app-list">
		{#each apps as app}
			<div class="app-card">
				<h2>{app.app_acronym}</h2>
				<p>{app.app_description}</p>
				<p>{app.app_rnumber}</p>
				<button on:click={() => gotoApp(app.app_acronym)}>View</button>
				{#if isPL}
					<button on:click={() => openAppModal(true, app.app_acronym)}>Edit</button>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.container {
		width: 80%;
		margin: auto;
		padding: 20px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		font-family: Arial, sans-serif;
	}

	.header {
		display: flex;
		justify-content: space-between;
		padding: 20px 30px 20px 30px;
		align-items: center;
		margin-bottom: 20px;
	}

	.app-list {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20px;
	}

	.app-card {
		padding: 20px;
		border: 1px solid #ccc;
		border-radius: 5px;
		text-align: left;
		max-height: 200px;
		overflow: hidden;
		position: relative;
	}

	.app-card h2 {
		font-size: 1.2em;
		margin-bottom: 10px;
		white-space: nowrap; /* Prevent text from wrapping */
		overflow: hidden; /* Hide the overflow */
		text-overflow: ellipsis; /* Show ellipses for truncated text */
	}

	.app-card p {
		margin: 10px 0;
		white-space: pre-wrap; /* Prevent text from wrapping */
		overflow: hidden; /* Hide the overflow */
		text-overflow: ellipsis; /* Show ellipses for truncated text */
	}

	button {
		padding: 10px 20px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}

	button:hover {
		padding: 10px 20px;
		background-color: #0056b3;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}
</style>