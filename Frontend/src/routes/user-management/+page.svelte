<script>
	import { onMount } from 'svelte';
	import { axiosInstance } from '../../axios';
	import TopNavbar from '../../components/navbar.svelte';
	import Error from '../+error.svelte';
	import { goto } from '$app/navigation';
	import Toast from '../../components/toast.svelte';
	import AddGroupModal from '../../components/addGroupModal.svelte';
	import MultiSelect from 'svelte-multiselect';
	import axios from 'axios';

	let loaded = false;
	let users = [];
	let groups = [];
	let targetUserDetails = {};
	let targetUserGroups = [];
	let newUserDetails = {};
	let newUserGroups = [];
	let statusMsg;
	let showToast;
	let toastType;
	let showAddGrpModal = false;

	const verifyAdmin = async () => {
		const isAdmin = await axiosInstance.post('/api/users/check-group', {
			group: 'admin'
		});

		const verifyActive = async () => {
			const isActive = await axiosInstance.get('/api/users/profile')
		}

		if (!isAdmin.data.result) {
			return goto('/appList');
		}
	};

	const fetchDetails = async () => {
		try {
			// Verify user is admin
			await verifyAdmin();

			// Grab user list
			const userList = await axiosInstance.get('/api/users/user-list');

			users = userList.data.results;

			// Grab group list and convert to array
			const groupList = await axiosInstance.get('/api/groups/get-all-groups');
			groups = groupList.data.result.map((grp) => grp.group_name);
		} catch (err) {
			console.log(err);
		}
	};

	const newUserTemplate = () => {
		newUserDetails['user_name'] = '';
		newUserDetails['password'] = '';
		newUserDetails['email'] = '';
		newUserDetails['active'] = 1;
		newUserDetails['groups'] = {};
	};

	onMount(async () => {
		await fetchDetails();

		newUserTemplate();

		loaded = true;
	});

	const editUser = (user) => {
		// Get selected user
		targetUserDetails = { ...user };

		// Get array of target user's groups
		let currTargetUserGroups = targetUserDetails.groups ? targetUserDetails.groups.split(', ') : [];

		targetUserDetails.groups = [...currTargetUserGroups];
		targetUserGroups = [...currTargetUserGroups];
	};

	const toggleGroup = (target, group) => {
		target.groups[group].assigned = target.groups[group].assigned ? 0 : 1;
		target.groups[group].modified = target.groups[group].modified ? 0 : 1;
		console.log('after: ', target.groups);
	};

	const saveUser = async () => {
		await verifyAdmin();

		if (targetUserDetails.password) {
			if (!validatePassword(targetUserDetails.password)) {
				console.log(targetUserDetails.password);
				triggerToast(
					'Invalid password. Please use a password of 8-10 characters consisting of alphabets, numbers and special characters', 'error'
				);
				return;
			}
		}

		if (!validateEmail(targetUserDetails.email)) {
			triggerToast('Invalid email. Please input a proper email', 'error');
			return;
		}

		try {
			// Update email
			const emailRes = await axiosInstance.put('/api/users/update-email', {
				targetUser: targetUserDetails.user_name,
				newEmail: targetUserDetails.email
			});

			// console.log(`Email updated \n ${emailRes}`);

			// Update password
			if (targetUserDetails.password) {
				const passwordRes = await axiosInstance.put('/api/users/update-password', {
					targetUser: targetUserDetails.user_name,
					newPassword: targetUserDetails.password
				});
			}

			// console.log(`Password updated \n ${passwordRes}`);

			// Update active state
			const activeRes = await axiosInstance.put('/api/users/update-active', {
				targetUser: targetUserDetails.user_name,
				newActive: targetUserDetails.active
			});

			// console.log(`Active updated \n ${activeRes}`);

			// Update groups
			let updatedGrpsSet = new Set(targetUserGroups);
			let originalGrpsSet = new Set(targetUserDetails.groups);
			let addGroups = [];
			let removeGroups = [];

			groups.map((group) => {
				let inUpdated = updatedGrpsSet.has(group);
				let inOriginal = originalGrpsSet.has(group);

				if (inUpdated && !inOriginal) {
					addGroups.push(group);
				} else if (!inUpdated && inOriginal) {
					removeGroups.push(group);
				}
			});

			const updateGroupsRes = await axiosInstance.put('/api/users/update-groups', {
				targetUser: targetUserDetails.user_name,
				addGroups: addGroups,
				removeGroups: removeGroups
			});

			// console.log(`Groups updated \n ${updateGroupsRes}`);
			triggerToast("User updated successfully", 'success');
		} catch (err) {
			console.log(err);
		} finally {
			fetchDetails();
			targetUserDetails = {};
		}
	};

	const cancelEdit = async () => {
		await verifyAdmin();

		targetUserDetails = {};
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

		return validEmail.test(email) || !email;
	};

	const validateUsername = (username) => {
		for (const user of users) {
			// existingUsers.push(user.user_name);
			if (user.user_name == username) {
				return false;
			}
		}

		return true;
	};

	const addNewUser = async () => {
		// Verify that user is admin
		await verifyAdmin();

		// Check if user already exist
		if (!validateUsername(newUserDetails.user_name)) {
			triggerToast('Error: User already exists', 'error');
			return;
		}

		// Check valid password
		if (!validatePassword(newUserDetails.password)) {
			triggerToast(
				'Invalid password. Please include password of 8-10 characters that contain a character, number and special character', 'error'
			);
			return;
		}

		// Check valid email
		if (!validateEmail(newUserDetails.email)) {
			triggerToast('Invalid email. Please input a proper email', 'error');
		}

		try {
			const addUserRes = await axiosInstance.put('/api/users/add-user', newUserDetails);

			const addGroupsRes = await axiosInstance.put('/api/users/update-groups', {
				targetUser: newUserDetails.user_name,
				addGroups: newUserGroups
			});

			newUserDetails = {};
			newUserGroups = [];
			newUserTemplate();
			fetchDetails();

			triggerToast("User created successfully", 'success');
		} catch (err) {
			console.log(err);
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

	const openAddGrpModal = async () => {
		await verifyAdmin();
		showAddGrpModal = true;
	};

	const closeAddGrpModal = (event) => {
		showAddGrpModal = false;
		fetchDetails();
	};
</script>

<TopNavbar pageTitle="User management" />

<div class="add-new-group">
	<button on:click={openAddGrpModal}>Add group</button>
</div>

<AddGroupModal existingGroups={groups} showModal={showAddGrpModal} on:close={closeAddGrpModal} />

<div>
	<table>
		<thead>
			<tr>
				<th>Username</th>
				<th>Password</th>
				<th>Email</th>
				<th>Active</th>
				<th>Groups</th>
				<th>Edit user</th>
			</tr>
		</thead>
		<tbody>
			{#each users as user}
				{#if targetUserDetails && targetUserDetails.user_name == user.user_name}
					<tr>
						<td>{user.user_name}</td>
						<td><input type="password" bind:value={targetUserDetails.password} /></td>
						<td><input type="text" bind:value={targetUserDetails.email} /></td>
						<td>
							<select bind:value={targetUserDetails.active}>
								<option value={1}>Active</option>
								<option value={0}>Disabled</option>
							</select>
						</td>
						<td>
							<MultiSelect options={groups} bind:selected={targetUserGroups} />
						</td>
						<td>
							<button on:click|preventDefault={saveUser}>Save</button>
							<button on:click|preventDefault={cancelEdit}>Cancel</button>
						</td>
					</tr>
				{:else}
					<tr>
						<!-- View mode -->
						<td>{user.user_name}</td>
						<td>********</td>
						<td>{user.email}</td>
						<td>{user.active}</td>
						<td>{user.groups ? user.groups : ''}</td>
						<td
							>
							{#if user.user_name !== 'admin'}
							<button
								on:click={async () => {
									await verifyAdmin();
									editUser(user);
								}}>Edit</button
							>
							{/if}</td
						>
					</tr>
				{/if}
			{/each}

			<tr class="create-user">
				<td><input type="test" bind:value={newUserDetails.user_name} name="user-name" /></td>
				<td><input type="password" bind:value={newUserDetails.password} name="password" /></td>
				<td><input type="text" bind:value={newUserDetails.email} /></td>
				<td>
					<select bind:value={targetUserDetails.active}>
						<option value={1} selected="selected">Active</option>
						<option value={0}>Disabled</option>
					</select>
				</td>
				<td>
					{#if groups}
						<MultiSelect options={groups} bind:selected={newUserGroups} />
					{/if}
				</td>
				<td>
					<button type="button" on:click={addNewUser}>Add user</button>
				</td>
			</tr>
		</tbody>
	</table>
</div>

<Toast message={statusMsg} visible={showToast} type={toastType} duration="2000" />

<style>
	table {
		width: 100%;
		border-collapse: collapse;
		margin: 20px 0;
		font-size: 16px;
		text-align: left;
		table-layout: fixed;
	}

	thead th {
		background-color: #f2f2f2;
		color: #333;
		padding: 10px;
		border-bottom: 2px solid #ddd;
	}

	tbody td {
		padding: 10px;
		border-bottom: 1px solid #ddd;
	}

	tbody tr:hover {
		background-color: #f1f1f1;
	}

	input[type='text'],
	input[type='password'],
	select {
		width: 100%;
		padding: 5px;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-sizing: border-box;
	}

	button {
		padding: 5px 10px;
		background-color: #4caf50;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button:hover {
		background-color: #45a049;
	}

	td button {
		margin: 0;
	}

	.add-new-group {
		text-align: right;
		margin-bottom: 10px;
		margin-top: 10px;
		margin-right: 10px;
	}
</style>
