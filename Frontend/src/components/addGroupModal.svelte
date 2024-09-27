<script>
	import { axiosInstance } from '../axios';
	import { createEventDispatcher, onMount } from 'svelte';
	import Toast from './toast.svelte';

	export let showModal = false;
	// export let existingGroups;

	const dispatch = createEventDispatcher();
	
	let groupName = '';
	let showToast = false;
	let statusMsg = '';
	let toastType;
	let existingGroups;
	
	const fetchGroups = async () => {
		// Grab group list and convert to array
		const groupList = await axiosInstance.get('/api/groups/get-all-groups');
		existingGroups = groupList.data.result.map((grp) => grp.group_name);
	}

	onMount(fetchGroups);

	const closeModal = () => {
		dispatch('close');
	};
	
	const addGroup = async () => {
		if (groupName) {
			if (!verifyGroup(groupName)) {
				return triggerToast(
					'Invalid group name. Group names can only consist of alphanumeric and underscore characters', 'error'
				);
			}

			if (existingGroups.includes(groupName)) {
				return triggerToast('Group already exists', 'error');
			}

			const addGroupRes = await axiosInstance.put('/api/groups/add-group', {
				groupName: groupName
			});

			if (addGroupRes.status == 200) {
				groupName = '';
			}

			fetchGroups();
			return triggerToast('Group created successfully', 'success');
		} else {
			return triggerToast('Please enter a group name', 'error');
		}
	};

	const verifyGroup = (groupName) => {
		const validGrpName = /^[a-zA-Z0-9_]+$/;

		if (!validGrpName.test(groupName)) {
			return false;
		}

		return true;
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

{#if showModal}
	<div class="modal-backdrop" on:click={closeModal}></div>
	<div class="modal">
		<h2>Add New Group</h2>
		<input type="text" bind:value={groupName} placeholder="Group name" />
		<div class="modal-actions">
			<button on:click={addGroup}>Add Group</button>
			<button on:click={closeModal}>Cancel</button>
		</div>
	</div>
{/if}

<Toast message={statusMsg} visible={showToast} type={toastType} duration="2000" />

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
		width: 300px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		z-index: 100;
	}

	.modal h2 {
		margin: 0 0 20px 0;
	}

	.modal input {
		width: 90%;
		padding: 10px;
		margin-bottom: 20px;
		border: 1px solid #ccc;
		border-radius: 4px;
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
	}
</style>
