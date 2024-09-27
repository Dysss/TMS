<script>
	import { axiosInstance } from '../axios';
	import { createEventDispatcher, onMount } from 'svelte';
	import Toast from './toast.svelte';

	export let showModal = false;
    export let editMode;
    export let targetPlanName;

	const dispatch = createEventDispatcher();
	
	let showToast = false;
	let statusMsg = '';
	let toastType;
    let targetPlan;
    
    const fetchPlanDetails = async () => {
        const response = await axiosInstance.post("/api/plan/get-plan-details", { plan_mvp_name: targetPlanName })
        
        console.log((response.data.data)[0])
    }

    const initNewPlan = () => {
        targetPlan = {
            plan_MVP_name: null,
            plan_startDate: null,
            plan_endDate: null,
            plan_app_acronym: null,
            plan_color: null
        }
    }
    
	const closeModal = () => {
        dispatch('close');
	};
    
	const triggerToast = (message, type='info') => {
        statusMsg = message;
		showToast = true;
		toastType = type;
        
		setTimeout(() => {
            showToast = false;
		}, 2000);
	};

    onMount(() => {
        if (editMode) {
            fetchPlanDetails();
        } else {
            initNewPlan();
        }
    });

    $: if (showModal) {
        if (editMode) {
            fetchPlanDetails();
        } else {
            initNewPlan();
        }
    }
</script>

{#if showModal}
	<div class="modal-backdrop" on:click={closeModal}></div>
	<div class="modal">
        {#if editMode}
            <h2>Edit plan</h2>
        {:else}
		    <h2>Add New Group</h2>
		{/if}
        <div class="form-group">
            <label for="plan_name">Plan MVP Name: </label>
            <input
                id="plan_name"
                type="text"
                bind:value={targetPlan.plan_MVP_name}
                placeholder="Plan MVP Name"
                readonly={editMode}
            />
            {console.log("Target plan mvp name: ", targetPlan.plan_MVP_name)}
        </div>
		<div class="modal-actions">
			<!-- <button on:click={addGroup}>Add Group</button>
			<button on:click={closeModal}>Cancel</button> -->
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
        z-index: 99;
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
