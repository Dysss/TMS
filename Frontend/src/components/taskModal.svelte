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

let loaded = false;
let showToast = false;
let statusMsg = '';
let toastType;
let targetTask;
let targetPlan;
let plans = [];
let username;
let addTaskNotes;
let stateSeq = ['create', 'open', 'todolist', 'doing', 'done'];
let stateButtons = ['Create', 'Release', 'Take on', 'To review', 'Approve'];
let promoteLabel = "Promote";
let demoteLabel = "Demote";

let permissions;
let hasOpenPerms = false;
let hasTodoPerms = false;
let hasDoingPerms = false;
let hasDonePerms = false;
let planEditable = false;

$: {
    if (targetTask) {
        switch (targetTask.task_state) {
            case "open": 
                promoteLabel = "Release Task";
                break;
            case "todolist":
                promoteLabel = "Take on";
                break;
            case "doing":
                promoteLabel = "Send Review"
                demoteLabel = "Give up";
                break;
            case "done":
                promoteLabel = "Approve";
                demoteLabel = "Reject";
                break;
        }
    }
}

// Fetch task details
const fetchTaskDetails = async () => {
    const response = await axiosInstance.post('/api/task/get-task-details', { task_id: targetTaskId })
    targetTask = (response.data.data)[0];

    if (targetTask.task_notes) {
        targetTask["task_notes_arr"] = targetTask.task_notes.split("␟");
    } else {
        targetTask["task_notes_arr"] = []
    }

    targetPlan = targetTask.task_plan;

    await checkDonePerms();
    await checkOpenPerms();
    
    if ((targetTask.task_state == "open" && hasOpenPerms) || (targetTask.task_state == "done" && hasDonePerms)) {
        planEditable = true;
    } else {
        planEditable = false;
    }
    
    // await checkPlanEditable();
    // console.log(targetTask)
}

// Fetch list of plans
const fetchPlans = async () => {
    const response = await axiosInstance.post('/api/plan/get-all-plans', { app_Acronym: appAcronym })

    plans = response.data.data
    // console.log("fetched plans: ", plans)
}

// Fetch user name
const fetchUserDetails = async () => {
    const response = await axiosInstance.get('/api/users/profile')

    username = (response.data.data)[0].user_name;
    // console.log(username)
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
    
    await checkOpenPerms();
    await checkTodoPerms();
    await checkDoingPerms();
    await checkDonePerms();
}

const checkOpenPerms = async () => {
    if (permissions) {
        const response = await axiosInstance.post('/api/users/check-group', { group: permissions.app_permit_Open })

        // console.log(response)
        
        hasOpenPerms = response.data.result
        // console.log(hasOpenPerms)
    }
}

const checkTodoPerms = async () => {
    if (permissions) {
        const response = await axiosInstance.post('/api/users/check-group', { group: permissions.app_permit_toDoList })
        
        hasTodoPerms = response.data.result
        // console.log(hasTodoPerms)
    }
}

const checkDoingPerms = async () => {
    if (permissions) {
        const response = await axiosInstance.post('/api/users/check-group', { group: permissions.app_permit_Doing })
        
        hasDoingPerms = response.data.result
        // console.log(hasDoingPerms)
    }
}

const checkDonePerms = async () => {
    if (permissions) {
        const response = await axiosInstance.post('/api/users/check-group', { group: permissions.app_permit_Done })
        
        hasDonePerms = response.data.result
        // console.log(hasDonePerms)
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

    targetTask = {
        task_id: taskId,
        task_name: null,
        task_description: null,
        task_notes: "",
        task_plan: null,
        task_app_Acronym: appAcronym,
        task_state: 'create',
        task_creator: username,
        task_owner: username,
        task_createDate: dateStr
    }

}

const closeModal = () => {
    loaded = false;
    dispatch('close');
}

const createTask = async () => {
    console.log(targetTask)

    if (targetTask.task_description.length > 255) {
        return triggerToast("Task description cannot exceed 255 characters", 'error')
    }

    const timestamp = new Date().toString()
    targetTask.task_notes = username + " at " + timestamp + " in " + targetTask.task_state + " state " + "␟" + targetTask.task_notes + "␟" + "Task created";

    const response = await axiosInstance.put('/api/task/create-task', targetTask);

    // console.log("Response: ", response)
    fetchPlans();
    closeModal();
}

const checkPlanEditable = async () => {
    // console.log("Checking if plan is editable: ")

    // fetchAppPermissions();
    
    console.log("Has open perms: ", hasOpenPerms)
    console.log("Has done perms: ", hasDonePerms)
    console.log("Task is doing or done: ", targetTask.task_state != "doing" || targetTask.task_state != "done");
    
    planEditable = hasOpenPerms && hasDonePerms && (targetTask.task_state == "doing" || targetTask.task_state == "done")

}

const updateNotes = async (stateChange=null) => {
    console.log("Adding task notes")

    if (stateChange || addTaskNotes) {
        const timestamp = new Date().toString()
    
        if (addTaskNotes) {
            targetTask.task_notes_arr.unshift(addTaskNotes);
        }

        if (stateChange) {
            let stateChangeMsg = `Task state updated to ${stateChange}`
            targetTask.task_notes_arr.unshift(stateChangeMsg);
        }
    
        targetTask.task_notes_arr.unshift(username + " at " + timestamp + " in " + targetTask.task_state + " state ");
        
        // console.log(targetTask.task_notes_arr)
        
        const newTaskNotes = targetTask.task_notes_arr.join("␟")
        
        const response = await axiosInstance.put('/api/task/update-task-notes', {
            task_app_Acronym: appAcronym,
            task_state: targetTask.task_state,
            task_id: targetTask.task_id,
            task_notes: newTaskNotes
        })
        
        addTaskNotes = "";
        fetchTaskDetails();
        // console.log(response.data);
    }
    console.log("Added task notes")
}

const updateTaskPlan = async () => {
    console.log(targetTask)
    // console.log(targetPlan)
    if (targetTask.task_plan != targetPlan) {
        console.log("Updating task plan")
        const response = await axiosInstance.put('/api/task/update-task-plan', {
            task_app_Acronym: appAcronym,
            task_id: targetTask.task_id,
            task_plan:targetTask.task_plan,
            task_state: targetTask.task_state,
        })

    }
    console.log("Updated task plan")
}

const updateTaskState = async (action) => {
    updateTaskPlan()
    if (action == "promote") {
        updateNotes(stateSeq[stateSeq.indexOf(targetTask.task_state) + 1])
    } else {
        updateNotes(stateSeq[stateSeq.indexOf(targetTask.task_state) - 1])
    }

    const response = await axiosInstance.put('/api/task/update-task-state', {
        task_app_Acronym: appAcronym,
        task_id: targetTask.task_id,
        task_state: targetTask.task_state,
        action: action,
    })

    await fetchTaskDetails();

    closeModal();

    // console.log(response.data)
}

// const generateButtonText (state, action) => {
//     if (action == 'promote') {
//         if (state == )
//     }
// }

const triggerToast = (message, type="info") => {
    console.log("trigger toast")
    statusMsg = message;
    showToast = true;
    toastType = type;

    setTimeout(() => {
        showToast = false;
    }, 2000);
};

$: if (showModal) {
    addTaskNotes = ""
    plans = [];
    targetTask = null;
    targetPlan = null;

    ( async () => {
        await fetchPlans();
        await fetchUserDetails();
        await fetchAppPermissions();
        if (editMode) {
            await fetchTaskDetails();
        } else {
            await initNewTask();
        }

        loaded = true
    })();
}

// $: console.log("Plans during lifecycle: ", plans)
</script>

<Toast message={statusMsg} visible={showToast} type={toastType}  duration="2000" />

{#if loaded}
{#if showModal && (typeof targetTask) == 'object'}
<div class="modal-backdrop" on:click={closeModal}></div>
<div class="modal">
    {#if editMode}
    <h2>Task details</h2>
    <div class="edit-task-sidebar">
        <p class="task-id"><b>ID:</b> {targetTask.task_id}</p>
        <p class="task-name"><b>Name:</b> {targetTask.task_name}</p>
        <p class="task-description"><b>Description:</b> </p>
        <textarea disabled class="task-description-text" >{targetTask.task_description}</textarea>
        <p class="task-state"><b>State:</b> {targetTask.task_state}</p>
        <label for="task-plan"><b>Plan:</b> </label>
        <select name="task-plan" disabled={!planEditable} bind:value={targetTask.task_plan}>
            <option value={null}> </option>
            {console.log("html console.log: ", plans)}
            {#if plans}
                {#each plans as plan}
                <option value={plan.plan_MVP_name}>{plan.plan_MVP_name}</option>
                {/each}
            {/if}
        </select>
        <p class="task-creator"><b>Creator:</b> {targetTask.task_creator}</p>
        <p class="task-owner"><b>Owner:</b> {targetTask.task_owner}</p>
        <p class="task-create-date"><b>Create date:</b> {targetTask.task_createDate}</p>
    </div>
    <div class="edit-task-notes-area">
        <p><b>Notes</b></p>
        <div class="task-notes">
            {#each targetTask.task_notes_arr as taskNote}
                <p>{taskNote}</p>
            {/each}
        </div>
        {#if targetTask.task_state == "open" && hasOpenPerms ||
            targetTask.task_state == "todolist" && hasTodoPerms ||
            targetTask.task_state == "doing" && hasDoingPerms ||
            targetTask.task_state == "done" && hasDonePerms
        }
        <textarea class="task-notes-input" bind:value={addTaskNotes} />
        {:else}
        <textarea class="task-notes-input" bind:value={addTaskNotes}  disabled/>
        {/if}
    </div>
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
        <textarea
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
            {#if targetTask.task_state != "closed"}
                {#if targetTask.task_state == "open" && hasOpenPerms ||
                    targetTask.task_state == "todolist" && hasTodoPerms ||
                    targetTask.task_state == "doing" && hasDoingPerms ||
                    targetTask.task_state == "done" && hasDonePerms
                }
                    {#if targetPlan == targetTask.task_plan || targetTask.task_state != 'done'}
                    <!-- Save changes -->
                        <button on:click={async () => {
                            await updateNotes();
                            await updateTaskPlan();
                            closeModal();
                        }} >
                            Save changes
                        </button>
                    {:else}
                        <button disabled>Save changes</button>
                    {/if}
                    <!-- Demote -->
                    {#if targetTask.task_state == "doing" || targetTask.task_state == "done"}
                        <button on:click={() => updateTaskState('demote')}>{demoteLabel}</button>
                    {/if}
                    <!-- Promote -->
                    {#if targetPlan == targetTask.task_plan || targetTask.task_state != 'done'}
                    <button on:click={() => updateTaskState('promote')}>{promoteLabel}</button>
                    {:else}
                    <button disabled>Promote</button>
                    {/if}
                {:else}
                    <button on:click={() => triggerToast("Insufficient permissions", 'error')} disabled >Save changes</button>
                {/if}
            {/if}
        {:else}
            <button on:click={closeModal}>Cancel</button>
            <button on:click={createTask}>Create task</button>
        {/if}
    </div>
</div>
{/if}
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
		/* max-height: 80vh; */
        height: 80vh;
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
    
	.modal-actions button:disabled {
		background-color: gray;
		cursor: not-allowed;
	}
    
    .modal::after {
        content: "";
        display: table;
        clear: both;
    }

    .task-description-text {
        resize: none;
        min-height: 10vh;
        max-height: 10vh;
        min-width: 100%;
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
        min-height: 80%;
        /* height: 100%; */
        float: left;
        padding: 10px 0 10px 10px;
        box-sizing: border-box;
        overflow-y: auto;
    }

    .task-notes {
        height: 70%;
        border: 1px solid black;
        padding: 4px 12px;
        box-sizing: border-box;
        min-height: 230px;
        max-height: 230px;
        overflow-y: auto;
        white-space: pre-wrap;
    }

    .task-notes p {
        margin: 0;
    }

    .task-notes-input {
        width: 100%;
        min-height: 20vh;
        border: 1px solid black; 
        padding: 10px; /* Padding inside the border */
        box-sizing: border-box; /* Ensure padding and border are included in the width */
        margin-top: 10px; /* Space between task-notes and input */
        overflow-y: auto;
        resize: none;
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
        height: 130px;
    }
</style>