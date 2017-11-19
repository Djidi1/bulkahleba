/* localStorage handling */
const STORAGE_KEY = 'pg-todos';
// Set up initial set of todos and categories if any saved in local storage
const todoStorage = {
    categories: [],
    fetch() {
        const todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        // Read and store the categories found from the todos in localStorage for the side menu list
        this.addCategories(todos);
        return todos;
    },
    save(todos, from_server) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
        localStorage.setItem('todos_updated', new Date());
        if (!from_server) {
            updateServerList();
        }
    },
    addCategories(todos) {
        todos.filter((todo) => {
            if (this.categories.indexOf(todo.category.toUpperCase()) === -1) {
                this.categories.push(todo.category.toUpperCase());
            }
        });
    }
};

function updateTodo(todo, prevCat) {
    // Need to find the index of the object with the matching id and then update it
    // then use it again in the splice to trigger the deep update in the lists
    let todoIndex = store.todos.findIndex(function (item) {
        return item.id === todo.id;
    });
    if (todoIndex > -1) {
        store.todos[todoIndex] = todo;
        // Force the update in the list - need this line or the Vue.set command
        // https://vuejs.org/v2/guide/list.html#Caveats
        store.todos.splice(todoIndex, 1, todo);
        if (todo.category !== prevCat) {
            // Look for existence of the previous category and if not found in any others remove it
            let prevIndex = store.todos.findIndex(function (item) {
                return item.category === prevCat;
            });
            if (prevIndex === -1 && prevCat !== 'Без категории') {
                let catIndex = store.state.categories.indexOf(prevCat.toUpperCase());
                if (store.state.selectedCategory === prevCat) {
                    window.store.changeCategory('Все');
                }
                store.state.categories.splice(catIndex, 1);
            }
            // Look for existence of the new category and if not found add it to store
            if (store.state.categories.indexOf(todo.category.toUpperCase()) === -1) {
                store.state.categories.push(todo.category.toUpperCase());
            }
        }
        saveTodosToLocalStorage(false);
    }
}

function addTodo(todo) {
    let todo_items = todo.title.split(","),
        i;

    for (i = 0; i < todo_items.length; i++) {
        if (todo_items[i] !== '') {
            let todo_new = {};
            todo_new.id = Math.floor(Math.random() * 10000);
            todo_new.title = todo_items[i].split(':')[0].trim();
            todo_new.quantity = (todo_items[i].split(':')[1] || '').trim();
            todo_new.category = todo.category;
            todo_new.desc = todo.desc;
            todo_new.highlight = todo.highlight;
            todo_new.urgent = todo.urgent;
            todo_new.completed = todo.completed;
            store.todos.unshift(todo_new);
        }
    }
    store.todos.filter((todo_new) => {
        if (store.state.categories.indexOf(todo_new.category.toUpperCase()) === -1) {
            store.state.categories.push(todo_new.category.toUpperCase());
        }
    });
    saveTodosToLocalStorage(false);
}

function saveTodosToLocalStorage(from_server) {
    todoStorage.save(store.todos, from_server);
}

function removeTodo(todo) {
    let idx = store.todos.indexOf(todo);
    store.todos.splice(idx, 1);
    let elem = document.getElementById(todo.category);
    if (elem !== null) {
        let catIndex = store.todos.indexOf(todo);
        store.state.categories.splice(catIndex, 1);
    }
    saveTodosToLocalStorage(false);
}

function toggleTodo(key) {
    store.todos[key].completed = !store.todos[key].completed;
    saveTodosToLocalStorage(false);
}
