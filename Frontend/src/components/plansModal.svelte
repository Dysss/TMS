<script>
import {
    axiosInstance
} from '../axios';
import {
    createEventDispatcher,
    onMount
} from 'svelte';
import Toast from './toast.svelte';

export let showModal = false;
export let appAcronym;
export let editMode;
export let targetPlanName;

const dispatch = createEventDispatcher();

let showToast = false;
let statusMsg = '';
let toastType;
let targetPlan;
let planNames;

const fetchPlanDetails = async () => {
    const response = await axiosInstance.post("/api/plan/get-plan-details", {
        plan_mvp_name: targetPlanName
    })

    targetPlan = (response.data.data)[0]

    // Convert date formats to match html format
    targetPlan.plan_startDate = convertDateFormat(targetPlan.plan_startDate);
    targetPlan.plan_endDate = convertDateFormat(targetPlan.plan_endDate);

    // Add # before color hexadecimal numbers
    targetPlan.plan_color = "#" + targetPlan.plan_color

    // Add correct app acronym key name
    targetPlan.plan_app_acronym = targetPlan.plan_app_Acronym;

    // console.log(targetPlan)
}

const fetchPlanNames = async () => {
    const response = await axiosInstance.post('/api/plan/get-all-plans', {
        app_Acronym: appAcronym
    })

    if (response.status !== 200) {
        return plans = false;
    }

    planNames = response.data.data.map(plan => plan.plan_MVP_name);
}

const initNewPlan = () => {
    targetPlan = {
        plan_MVP_name: null,
        plan_startDate: null,
        plan_endDate: null,
        plan_app_acronym: appAcronym,
        plan_color: "#000000"
    }
}

const closeModal = () => {
    dispatch('close');
};

const triggerToast = (message, type = 'info') => {
    statusMsg = message;
    showToast = true;
    toastType = type;

    setTimeout(() => {
        showToast = false;
    }, 2000);
};

const convertDateFormat = (date) => {
    return date.split("-").reverse().join("-");
}

const editPlan = async () => {
    try {
        targetPlan.plan_color = targetPlan.plan_color.slice(1);
        console.log(targetPlan);
        let response = await axiosInstance.put("/api/plan/update-plan", targetPlan);

        triggerToast("Successfully edited plan", 'success')
        await fetchPlanDetails();

        // console.log(response)
    } catch (err) {
        console.log(err)
    }
}

const createPlan = async () => {
    try {
        // console.log(targetPlan);
        targetPlan.plan_color = targetPlan.plan_color.slice(1);

        if (planNames.includes(targetPlan.plan_MVP_name)) {
            return triggerToast("Plan MVP name already exists", 'error');
        }

        if (!targetPlan.plan_startDate || !targetPlan.plan_endDate) {
            console.log(targetPlan.plan_startDate);
            console.log(targetPlan.plan_endDate);
            return triggerToast("Please input plan start and end date", 'error');
        }

        let response = await axiosInstance.put("/api/plan/create-plan", targetPlan);

        triggerToast("Successfully created plan", 'success')
        initNewPlan();

        // console.log(response)
    } catch (err) {
        console.log(err)
    }
}

onMount(async () => {
    if (editMode) {
        await fetchPlanDetails();
    } else {
        initNewPlan();
    }

    // console.log(targetPlan)
});

$: if (showModal) {
    if (editMode) {
        fetchPlanDetails();
    } else {
        initNewPlan();
        fetchPlanNames();
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
        <label for="plan-name">Plan MVP Name: </label>
        <input
            id="plan-name"
            type="text"
            bind:value={targetPlan.plan_MVP_name}
            placeholder="Plan MVP Name"
            readonly={editMode}
            />
    </div>
    <div class="form-group">
        <label for="start-date">Start date: </label>
        <input
            id="start-date"
            type="date"
            bind:value={targetPlan.plan_startDate}
            />
    </div>
    <div class="form-group">
        <label for="end-date">End date: </label>
        <input
            id="end-date"
            type="date"
            bind:value={targetPlan.plan_endDate}
            />
    </div>
    <div class="form-group">
        <label for="plan-color">Color: </label>
        <input
            id="plan-color"
            type="color"
            bind:value={targetPlan.plan_color}
            />
    </div>
    <div class="modal-actions">
        {#if editMode}
        <button on:click={editPlan}>Edit Plan</button>
        <button on:click={closeModal}>Cancel</button>
        {:else}
        <button on:click={createPlan}>Add plan</button>
        <button on:click={closeModal}>Cancel</button>
        {/if}
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

.form-group #plan-color {
    min-height: 50px;
}
</style>
