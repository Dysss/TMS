<script>
import {
    createEventDispatcher,
    onMount
} from "svelte";
import {
    axiosInstance
} from "../axios";
import Toast from "./toast.svelte";

export let showModal = false;
export let appAcronym;
export let editMode;
export let targetTaskId;

const dispatch = createEventDispatcher();

let showToast = false;
let statusMsg = '';
let toastType;
let targetTask;
let plans;
let username;
let newTaskNotes;

let permissions;
let hasOpenPerms = false;
let hasTodoPerms = false;
let hasDoingPerms = false;
let hasDonePerms = false;

// Fetch task details
const fetchTaskDetails = async () => {
    const response = await axiosInstance.post('/api/task/get-task-details', { task_id: targetTaskId })
    targetTask = (response.data.data)[0];

    console.log((response.data.data)[0]);
}

// Fetch list of plans
const fetchPlans = async () => {
    const response = await axiosInstance.post('/api/plan/get-all-plans', { app_Acronym: appAcronym })

    plans = response.data.data
    console.log(plans)
}

// Fetch user name
const fetchUserDetails = async () => {
    const response = await axiosInstance.get('/api/users/profile')

    username = (response.data.data)[0].user_name;
    console.log(username)
}

// Get plan permissions
const fetchAppPermissions = async () => {
    const response = await axiosInstance.post('/api/app/get-app-details', { app_Acronym: appAcronym });

    permissions = (({
        app_permit_Create,
        app_permit_Open,
        app_permit_toDoList,
        app_permit_Doing,
        app_permit_Done
    }) => ({
        app_permit_Create,
        app_permit_Open,
        app_permit_toDoList,
        app_permit_Doing,
        app_permit_Done
    }))(response.data.data[0])

    checkOpenPerms();
    checkTodoPerms();
    checkDoingPerms();
    checkDonePerms();
}

const checkOpenPerms = async () => {
    if (permissions) {
        const response = await axiosInstance.post('/api/users/check-group', { group: permissions.app_permit_Open })
        
        hasOpenPerms = response.data.result
    }
}

const checkTodoPerms = async () => {
    if (permissions) {
        const response = await axiosInstance.post('/api/users/check-group', { group: permissions.app_permit_toDoList })
        
        hasTodoPerms = response.data.result
    }
}

const checkDoingPerms = async () => {
    if (permissions) {
        const response = await axiosInstance.post('/api/users/check-group', { group: permissions.app_permit_Doing })
        
        hasOpenPerms = response.data.result
    }
}

const checkDonePerms = async () => {
    if (permissions) {
        const response = await axiosInstance.post('/api/users/check-group', { group: permissions.app_permit_Done })
        
        hasOpenPerms = response.data.result
    }
}

// Generate task id
const generateTaskId = async () => {
    const response = await axiosInstance.post('/api/app/get-app-details', { app_Acronym: appAcronym })

    return (appAcronym + "_" + (response.data.data)[0].app_rnumber)
}

// Initialize new task
const initNewTask = async () => {
    console.log("Init new task")
    const taskId = await generateTaskId();

    const currDate = new Date();
    const dd = currDate.getDate().toString();
    const monthInt = parseInt(currDate.getMonth().toString(), 10) + 1;
    const mm = monthInt < 10 ? "0" + monthInt.toString() : monthInt.toString();
    const yyyy = currDate.getFullYear().toString();
    const dateStr = dd + "-" + mm + "-" + yyyy

    // const createDate = 

    targetTask = {
        task_id: taskId,
        task_name: null,
        task_description: null,
        task_notes: null,
        task_plan: null,
        task_app_Acronym: appAcronym,
        task_state: 'open',
        task_creator: username,
        task_owner: username,
        task_createDate: dateStr
    }

}

const closeModal = () => {
    dispatch('close');
}

const createTask = async () => {
    console.log(targetTask)

    const response = await axiosInstance.put('/api/task/create-task', targetTask);

    console.log("Response: ", response)
    closeModal();
}

$: if (showModal) {
    newTaskNotes = ""
    fetchPlans();
    fetchUserDetails();
    if (editMode) {
        fetchTaskDetails();
    } else {
        initNewTask();
    }
}
</script>

<!-- 
Modifiable:
task_plan (PM, PL)
task_notes: all
-->

{#if showModal && (typeof targetTask) == 'object'}
<div class="modal-backdrop" on:click={closeModal}></div>
<div class="modal">
    {#if editMode}
    <h2>Task details</h2>
    <div class="edit-task-sidebar">
        <p class="task-id"><b>ID:</b> {targetTask.task_id}</p>
        <p class="task-name"><b>Name:</b> {targetTask.task_name}</p>
        <p class="task-description"><b>Description:</b> </p>
        <p class="task-description">{targetTask.task_description}</p>
        <p class="task-state"><b>State:</b> {targetTask.task_state}</p>
        <label for="task-plan"><b>Plan:</b> </label>
        <select name="task-plan">
            <option>Some option</option>
        </select>
        <p class="task-creator"><b>Creator:</b> {targetTask.task_creator}</p>
        <p class="task-owner"><b>Owner:</b> {targetTask.task_owner}</p>
        <p class="task-create-date"><b>Create date:</b> {targetTask.task_createDate}</p>
    </div>
    <div class="edit-task-notes-area">
        <p><b>Notes</b></p>
        <p class="task-notes">{targetTask.task_notes}</p>
        <textarea
            class="task-notes-input"
            bind:value={newTaskNotes}
        />
    </div>
    <!-- <div class="modal-actions">
        <button>Do sometings</button>
    </div> -->
    {:else}
    <h2>Create task</h2>
    <div class="form-group">
        <label for="task-name">Name: </label>
        <input
            id="task-name"
            type="text"
            bind:value={targetTask.task_name}
        />
    </div>
    <div class="form-group">
        <label for="task-description">Description: </label>
        <input
            id="task-description"
            type="text"
            bind:value={targetTask.task_description}
        />
    </div>
    <div class="form-group">
        <label for="task-plan">Plan: </label>
        <select bind:value={targetTask.task_plan}>
            <option value={null}> </option>
            {#if plans}
                {#each plans as plan}
                <option value={plan.plan_MVP_name}>{plan.plan_MVP_name}</option>
                {/each}
            {/if}
        </select>
    </div>
    <div class="form-group">
        <label for="task-notes">Notes: </label>
        <textarea
            id="task-notes"
            bind:value={targetTask.task_notes}
        />
    </div>
    {/if}
    <div class="modal-actions">
        {#if editMode}
        <button on:click={closeModal}>Close</button>
            {#if targetTask.task_state == "open" && hasOpenPerms ||
                 targetTask.task_state == "todolist" && hasTodoPerms ||
                 targetTask.task_state == "doing" && hasDoingPerms ||
                 targetTask.task_state == "done" && hasDonePerms
            }
            <button>Save changes</button>
            {/if}
        {:else}
        <button on:click={closeModal}>Cancel</button>
        <button on:click={createTask}>Create task</button>
        {/if}
    </div>
</div>
{/if}

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
		width: 65vw;
		max-height: 80vh;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 100;
    }
    
    .modal h2 {
        margin: 0 0 20px 0;
        clear: both;
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
        
        gap: 10px; /* Space between buttons */
        padding-top: 20px; /* Optional: Adds spacing above the buttons */
        margin-top: 20px;
        border-top: 1px solid #eee; /* Optional: Separates the button area visually */
        clear: both; /* Ensure buttons appear below floated elements */
    }
    
    .modal-actions button {
        margin-left: 10px;
        padding: 10px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        clear: both; 
    }
    
    .modal-actions button:hover {
        background-color: #0056b3;
    }
    
    .modal::after {
        content: "";
        display: table;
        clear: both;
    }
    
    .edit-task-sidebar {
        width: 30%;
        float: left;
        padding-right: 10px;
        box-sizing: border-box;
        overflow-y: auto;
    }

    .edit-task-notes-area {
        width: 70%;
        min-height: 100%;
        float: left;
        padding: 10px 0 10px 10px;
        box-sizing: border-box;
        overflow-y: auto;
    }

    .task-notes {
        height: 70%;
        border: 1px solid black;
        padding: 18px;
        box-sizing: border-box;
        min-height: 230px;
        overflow-y: auto;
    }

    .task-notes-input {
        width: 100%;
        border: 1px solid black; 
        padding: 10px; /* Padding inside the border */
        box-sizing: border-box; /* Ensure padding and border are included in the width */
        margin-top: 10px; /* Space between task-notes and input */
        overflow-y: auto;
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

    .form-group textarea {
        height: 150px;
    }
</style>