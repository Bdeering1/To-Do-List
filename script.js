const pageTitle = document.querySelector('[data-page-title]');
const listsDisplayContainer = document.querySelector('[data-lists-display-container]');
const listsContainer = document.querySelector('[data-lists]');
const newListForm = document.querySelector('[data-new-list-form]');
const newListInput = document.querySelector('[data-new-list-input]');
const deleteListButton = document.querySelector('[data-delete-list-button]');
const tasksDisplayContainer = document.querySelector('[data-tasks-display-container]');
const tasksDisplayPlaceholder = document.querySelector('[data-tasks-display-placeholder]');
const createListHint = document.querySelector('[data-create-list-hint]');
const tasksTitleElement = document.querySelector('[data-tasks-title]');
const taskCountElement = document.querySelector('[data-task-count]');
const tasksContainer = document.querySelector('[data-tasks]');
const taskTemplate = document.querySelector('[data-task-template]');
const newTaskForm = document.querySelector('[data-new-task-form]');
const newTaskInput = document.querySelector('[data-new-task-input]');
const clearCompletedButton = document.querySelector('[data-clear-completed-button]');

const LOCAL_STORAGE_LIST_KEY = 'task.list';
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListId';
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY) || 'none';

listsDisplayContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'li') {
        selectedListId = e.target.dataset.listId;
        saveAndRender();
    }
    if (newListInput === document.activeElement && createListHint.style.display !== 'none') {
        createListHint.style.display = 'none';
    }
});

tasksContainer.addEventListener('click', e => {
    if (e.target.hasAttribute('data-task')) {
        const selectedTask = getSelectedList().tasks.find(task => task.id === e.target.querySelector('input').id);
        selectedTask.complete = !selectedTask.complete;
        e.target.querySelector('input').checked = selectedTask.complete;
        save();
        renderTaskCount(getSelectedList());
    } else if (e.target.tagName.toLowerCase() === 'input') {
        const selectedTask = getSelectedList().tasks.find(task => task.id === e.target.id);
        selectedTask.complete = e.target.checked;
        save();
        renderTaskCount(getSelectedList());
    }
});

newListForm.addEventListener('submit', e => {
    e.preventDefault();
    const listName = newListInput.value;
    if (listName == null || listName == '') return;
    const list = createList(listName);
    newListInput.value = null;
    lists.push(list);
    selectedListId = list.id;
    saveAndRender();
});

newTaskForm.addEventListener('submit', e => {
    e.preventDefault();
    const taskName = newTaskInput.value;
    if (taskName == null || taskName == '') return;
    const task = createTask(taskName);
    newTaskInput.value = null;
    getSelectedList().tasks.push(task);
    saveAndRender();
});

deleteListButton.addEventListener('click', e => {
    lists = lists.filter(list => list.id !== selectedListId);
    if (lists.length > 0) {
        selectedListId = lists[lists.length - 1].id;
    } else {
        selectedListId = 'none';
    }
    saveAndRender();
});

clearCompletedButton.addEventListener('click', e => {
    getSelectedList().tasks = getSelectedList().tasks.filter(task => !task.complete);
    saveAndRender();
});

document.addEventListener('keypress', e => {
    if (e.key == 'f' && getSelectedList()
        && newTaskInput !== document.activeElement
        && newListInput !== document.activeElement) {
        if (window.getComputedStyle(listsDisplayContainer).display == 'none') {
            listsDisplayContainer.style.display = ''
            pageTitle.style.visibility = '';
        } else {
            listsDisplayContainer.style.display = 'none';
            pageTitle.style.visibility = 'hidden';
        }
    }
});

function getSelectedList() {
    return lists.find(list => list.id === selectedListId);
}

function createList(name) {
    return {
        id: Date.now().toString(), name: name, tasks: []
    };
}

function createTask(name) {
    return {
        id: Date.now().toString(), name: name, complete: false
    };
}

function saveAndRender() {
    save();
    render();
}

function save() {
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists));
    localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
}

function render() {
    clearElement(listsContainer);
    renderLists();

    if (selectedListId == 'none') { /* if there are no lists, the task display container is removed from DOM */
        tasksDisplayContainer.style.display = 'none';
        tasksDisplayPlaceholder.style.display = '';
        createListHint.style.display = '';
    } else {
        let selectedList = getSelectedList();
        tasksDisplayContainer.style.display = '';
        tasksDisplayPlaceholder.style.display = 'none';
        tasksTitleElement.innerText = selectedList.name;
        renderTaskCount(selectedList);
        clearElement(tasksContainer);
        renderTasks(selectedList);
    }
}

function renderLists() {
    lists.forEach(list => {
        const listElement = document.createElement('li');
        listElement.dataset.listId = list.id;
        listElement.classList.add('list-name');
        listElement.innerText = list.name;
        if (list.id === selectedListId) listElement.classList.add('active-list');
        listsContainer.appendChild(listElement);
    });
}

function renderTasks(selectedList) {
    selectedList.tasks.forEach(task => {
        const taskElement = document.importNode(taskTemplate.content, true);
        const checkbox = taskElement.querySelector('input');
        checkbox.checked = task.complete;
        checkbox.id = task.id;
        const label = taskElement.querySelector('label');
        label.htmlFor = task.id;
        const taskText = document.createElement('p');
        taskText.innerText = task.name;
        label.append(taskText);
        tasksContainer.appendChild(taskElement);
    });
}

function renderTaskCount(selectedList) {
    const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length;
    const taskString = incompleteTaskCount === 1 ? 'item' : 'items';
    taskCountElement.innerText = `${incompleteTaskCount} ${taskString} remaining`
}

function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}


if (selectedListId == null) { /*resolves a previous problem with local storage*/
    selectedListId = 'none';
}
render();