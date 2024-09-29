<script>
	import { axiosInstance } from '../axios';
	import { createEventDispatcher, onMount } from 'svelte';
	import Toast from './toast.svelte';
	import axios from 'axios';

	export let showModal = false;
	export let editMode;
	export let targetAppAcronym = null;

	const dispatch = createEventDispatcher();
	
	let showToast = false;
	let statusMsg = '';
	let groupList = [];
	let toastType;
    let targetApp;
	
	const fetchGroups = async () => {
		// Grab group list and convert to array
		const response = await axiosInstance.get('/api/groups/get-all-groups');
		groupList = response.data.result.map((grp) => grp.group_name);
	}

	const fetchAppDetails = async () => {
		if (targetAppAcronym) {
			const response = await axiosInstance.post('/api/app/get-app-details', {
				app_acronym: targetAppAcronym
			});
			targetApp = response.data.data[0];
			targetApp.app_startDate = targetApp.app_startDate.split("-").reverse().join("-");	// Reverse input to match html standard
			targetApp.app_endDate = targetApp.app_endDate.split("-").reverse().join("-");
			// console.log(response)
		} else {
			console.log("Target app acronym: ", targetAppAcronym)
		}
	}

	const initNewApp = () => {
		targetApp = {
			app_Acronym: null,
			app_description: null,
			app_rnumber: null,
			app_startDate: null,
			app_endDate: null,
			app_permit_Create: null,
			app_permit_Open: null,
			app_permit_toDoList: null,
			app_permit_Doing: null,
			app_permit_Done: null,
		}
	}

	onMount(() => {
		// console.log(targetAppAcronym)
		fetchGroups();
		if (editMode) {
			fetchAppDetails();
		} else {
			initNewApp();
		}
	});

	$: if (showModal) {
		fetchGroups();
		if (editMode) {
			fetchAppDetails();
		} else {
			initNewApp();
		}
	}

	const createApp = async () => {
		console.log(targetApp)
		// Check app acronym
		if (!targetApp.app_Acronym) {
			return triggerToast("Please input an app acronym", 'error');
		}

		if (targetApp.app_Acronym.length > 64) {
			return triggerToast("App acronym length cannot exceed 64 characters.", 'error');
		}

		// Check app description
		if (targetApp.app_description) {	
			if (targetApp.app_description.length  > 255) {
				return triggerToast("App description length cannot exceed 255 characters.", 'error');
			}
		}

		// Check r number
		if (!targetApp.app_rnumber) {
			return triggerToast("Please input an app R number", 'error');
		}

		// Check dates
		if (Date.parse(targetApp.app_endDate) < Date.parse(targetApp.app_startDate)) {
			return triggerToast("End date cannot be earlier than start date", 'error');
		}
		
		try {
			const response = await axiosInstance.put('/api/app/create-app', targetApp)
		} catch (err) {
			console.log(err);
		}
	}

	const saveApp = async () => {
		console.log("saving")
		// Check app description
		if (targetApp.app_description) {	
			if (targetApp.app_description.length  > 255) {
				return triggerToast("App description length cannot exceed 255 characters.", 'error');
			}
		}
		
		try {
			const response = await axiosInstance.put('/api/app/update-app', targetApp)
		} catch (err) {
			console.log(err);
		}
	}

	const closeModal = () => {
		dispatch('close');
	};


	const triggerToast = (message, type="info") => {
		statusMsg = message;
		showToast = true;
		toastType = type;

		setTimeout(() => {
			showToast = false;
		}, 2000);
	};
</script>

{#if showModal && groupList.length != 0}
	<div class="modal-backdrop" on:click={closeModal}></div>
	<div class="modal">
		{#if editMode}
			<h2>Edit app</h2>
		{:else}
			<h2>Create app</h2>
		{/if}
		<div class="form-group">
			<label for="app-acronym">Acronym</label>
			<input 
				id="app-acronym" 
				type="text" 
				bind:value={targetApp.app_Acronym} 
				placeholder="App acronym" 
				readonly={editMode}
			/>
		</div>
		
		<div class="form-group">
			<label for="app-description">Description</label>
			<textarea 
				id="app-description" 
				bind:value={targetApp.app_description} 
				placeholder="App description" 
			/>
		</div>

		<div class="form-group">
			<label for="app-rnumber">R number</label>
			<input 
				id="app-rnumber" 
				type="number" 
				min='0' 
				bind:value={targetApp.app_rnumber} 
				placeholder="App r_number" 
				readonly={editMode}
			/>
		</div>
		
		<div class="date-fields">
			<div class="form-group">
				<label for="app-startdate">Start date</label>
				<input 
					id="app-startdate" 
					type="date" 
					bind:value={targetApp.app_startDate} 
					placeholder="App start date" 
					readonly={editMode}
				/>
			</div>
			
			<div class="form-group">
				<label for="app-enddate">End date</label>
				<input 
				id="app-enddate" 
				type="date" 
				bind:value={targetApp.app_endDate} 
				placeholder="App end date" 
				readonly={editMode}
			/>
			</div>
		</div>

		<div class="permit-fields">
			<div class="permit-left">
				<div class="form-group">
					<label for="app-permit-create">Permit create</label>
					<select id="app-permit-create" bind:value={targetApp.app_permit_Create}>
							<option> </option>
						{#each groupList as group}
							<option>{group}</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label for="app-permit-open">Permit open</label>
					<select id="app-permit-open" bind:value={targetApp.app_permit_Open}>
							<option> </option>
						{#each groupList as group}
							<option>{group}</option>
						{/each}
					</select>
				</div>
				
				<div class="form-group">
					<label for="app-permit-todolist">Permit todolist</label>
					<select id="app-permit-todolist" bind:value={targetApp.app_permit_toDoList}>
							<option> </option>
						{#each groupList as group}
							<option>{group}</option>
						{/each}
					</select>
				</div>
			</div>
		
			<div class="permit-right">
				<div class="form-group">
					<label for="app-permit-doing">Permit doing</label>
					<select id="app-permit-doing" bind:value={targetApp.app_permit_Doing}>
							<option> </option>
						{#each groupList as group}
							<option>{group}</option>
						{/each}
					</select>
				</div>
				
				<div class="form-group">
					<label for="app-permit-done">Permit done</label>
					<select id="app-permit-done" bind:value={targetApp.app_permit_Done}>
							<option> </option>
						{#each groupList as group}
							<option>{group}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
		<div class="modal-actions">
			{#if editMode}
				<button on:click={saveApp}>Save changes</button>
			{:else}
				<button on:click={createApp}>Create app</button>
			{/if}
			<button on:click={closeModal}>Cancel</button>
		</div>
	</div>
{/if}

<Toast message={statusMsg} visible={showToast} type={toastType}  duration="2000" />

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.5);
	}

	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: white;
		padding: 20px;
		border-radius: 8px;
		width: 65vw;
		max-height: 80vh;
		overflow-y: auto;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		z-index: 100;
	}

	.modal h2 {
		margin: 0 0 20px 0;
	}


	.form-group {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 5px;
	}

	.form-group label {
		width: 100%;
		font-size: 1rem;
		color: #333;
		flex-basis: 20%;
		margin-bottom: 5px;
	}

	.form-group input, .form-group select, .form-group textarea {
		width: 100%;
		padding: 10px;
		margin-bottom: 5px;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.date-fields {
		display: flex;
		justify-content: space-between;
	}

	.date-fields .form-group {
		flex-basis: 45%;
	}

	.date-fields label {
		font-size: 1rem;
		color: #333;
		display: block;
		margin-bottom: 5px;
	}

	.permit-fields {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.permit-left {
		flex-basis: 45%;
	}

	.permit-right {
		flex-basis: 45%;
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
	}

	.modal-actions button {
		margin-left: 10px;
		padding: 10px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}

	.modal-actions button:hover {
		background-color: #0056b3;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}
</style>
