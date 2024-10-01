<script>
import {
    sharedAppAcronym
} from "$lib/store";
import {
    onMount
} from "svelte";
import {
    axiosInstance
} from "../../axios";
import Navbar from "../../components/navbar.svelte";
import PlansModal from "../../components/plansModal.svelte"
import AppModal from "../../components/appModal.svelte";
import TaskModal from "../../components/taskModal.svelte";

let taskList = [];
let taskStates = ['open', 'todolist', 'doing', 'done', 'closed']
let plans = [];
let planColors = {};
let showPlansModal = false;
let plansModalEditMode;
let targetPlanName;
let showTaskModal = false;
let taskModalEditMode;
let targetTaskId;
let permissions;
let hasCreatePerms = false;
let hasPlanPerms = false;

$: app_Acronym = $sharedAppAcronym;

const fetchTasks = async () => {
    taskList = [];
    // console.log(app_Acronym)
    const response = await axiosInstance.post('/api/task/get-app-tasks', {
        task_app_acronym: app_Acronym
    });

    taskList = response.data.data;
    // console.log(response.data.data);
}

const fetchPlans = async () => {
    const response = await axiosInstance.post('/api/plan/get-all-plans', {
        app_Acronym: app_Acronym
    })

    if (response.status !== 200) {
        return plans = false;
    }

    plans = response.data.data;
    planColors = plans.reduce((accumulator, plan) => {
        accumulator[plan.plan_MVP_name] = plan.plan_color;
        return accumulator
    }, {})

    // console.log(plans)
}

const fetchAppPermissions = async () => {
    const response = await axiosInstance.post('/api/app/get-app-details', {
        app_Acronym: app_Acronym
    });

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
    
    checkCreatePerms();
    checkPlanPerms();
}

const getTasksByState = (taskState) => {
    return taskList.filter(task => task.task_state == taskState);
}

// const getPlanColor = (plan) => {
//     return plans.filter(plan => plan.plan_MVP_name)
// }

const checkCreatePerms = async () => {
    if (permissions) {
        const response = await axiosInstance.post('/api/users/check-group', { group: permissions.app_permit_Create })
        
        hasCreatePerms = response.data.result
    }
}

const checkPlanPerms = async () => {
    if (permissions) {
        const response = await axiosInstance.post('/api/users/check-group', { group: "pm" });
        
        hasPlanPerms = response.data.result
    }
}

onMount(() => {
    fetchTasks();
    fetchPlans();
    fetchAppPermissions();
});

const openPlansModal = async (editMode, targetName) => {
    plansModalEditMode = editMode;
    targetPlanName = targetName;

    showPlansModal = true;
}

const closePlansModal = async (event) => {
    plansModalEditMode = null;
    showPlansModal = false;
    await fetchPlans();
}

const openTaskModal = async (editMode, targetName) => {
    taskModalEditMode = editMode;
    targetTaskId = targetName;

    showTaskModal = true;
}

const closeTaskModal = async (event) => {
    taskModalEditMode = null;
    showTaskModal = false;
    await fetchTasks();
}
</script>

<Navbar pageTitle="{app_Acronym} details" />

<PlansModal showModal={showPlansModal} on:close={closePlansModal} editMode={plansModalEditMode} targetPlanName={targetPlanName} appAcronym={app_Acronym} />

<TaskModal showModal={showTaskModal} on:close={closeTaskModal} editMode={taskModalEditMode} targetTaskId={targetTaskId} appAcronym={app_Acronym} />

<div class="kanban-wrapper">
    <!-- Create app and plans buttons -->
    <div class="header">
        {#if hasCreatePerms}
        <div class="create-app">
            <button on:click={() => openTaskModal(false, null)}>Create task</button>
        </div>
        {/if}

        {#if hasPlanPerms}
        <div class="dropdown">
            <button>Plans</button>
            <div class="plans-dropdown">
                {#each plans as plan}
                <a on:click={() => openPlansModal(true, plan.plan_MVP_name)}>{plan.plan_MVP_name}</a>
                {/each}
                <a on:click={() => openPlansModal(false, null)}>Create plan</a>
            </div>
        </div>
        {/if}
    </div>

    <!-- Kanban -->
    {#if taskList.length > 0}
    <div class="kanban">
        {#each taskStates as state}
        <div class="column">
            <h3>{state}</h3>
            {#each getTasksByState(state) as task}
            <div class="task-card">
                <div class="color-indicator" style="background-color: {"#" + planColors[task.task_plan]}"></div>
                <div class="task-details">
                    <h4>{task.task_name}</h4>
                    <p>{task.task_description}</p>
                    <p><strong>Owner:</strong> {task.task_owner}</p>
                    <button on:click={() => openTaskModal(true, task.task_id)}>View</button>
                </div>
            </div>
            {/each}
        </div>
        {/each}
    </div>
    {/if}
</div>

<style>
.kanban-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
    margin-top: 16px;
}

.kanban {
    display: flex;
    gap: 20px;
}

.column {
    flex: 1;
    background-color: #f4f4f4;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.column h3 {
    margin-bottom: 12px;
}

.task-card {
    display: flex;
    align-items: center;
    background-color: white;
    padding: 12px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 12px;
    position: relative;
}

.task-card .color-indicator {
    width: 8px;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    border-radius: 4px 0 0 4px;
}

.task-details {
    padding-left: 16px;
}

.task-details h4 {
    margin: 0;
    font-size: 16px;
}

.task-details p {
    margin: 4px 0 0;
    color: #555;
}

.create-app button {
    background-color: #007bff;
    color: white;
    padding: 10px 10px;
    font-size: 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    width: 140px;
    margin: 0 10px;
}

.create-app button:hover,
.create-app:hover button {
    background-color: #0056b3;
}

.dropdown {
    position: relative;
    display: inline-block;
}

.dropdown button {
    background-color: #007bff;
    color: white;
    padding: 10px 10px;
    font-size: 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    width: 140px;
    margin: 0 10px;
}

.dropdown button:hover,
.dropdown:hover button {
    background-color: #0056b3;
}

.plans-dropdown {
    display: none;
    position: absolute;
    right: 0;
    background-color: #f1f1f1;
    min-width: 140px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    z-index: 1;
    margin: 0 10px;
}

.plans-dropdown a {
    color: black;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
}

.plans-dropdown a:hover {
    background-color: #ddd;
    cursor: pointer;
}

.dropdown:hover .plans-dropdown {
    display: block;
}
</style>
