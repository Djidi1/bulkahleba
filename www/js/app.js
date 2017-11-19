// import _ from 'lodash.orderby';
// window._ = require('lodash.orderby');
let cacheName = 'bh_offline_cache:v0.1';
socket = io.connect('https://bulka-hleba-auth-djidi.c9users.io/');
// Set up some useful globals
window.isMaterial = !window.Framework7.prototype.device.ios;
window.isiOS = window.Framework7.prototype.device.ios;

window.store = {
    todos: todoStorage.fetch(),
    state: {
        selectedCategory: 'Все',
        categories: todoStorage.categories,
    },
    changeCategory(category) {
        this.state.selectedCategory = category;
    },
};


// Init F7 Vue Plugin
Vue.use(Framework7Vue);

// Init http requests
// Vue.use(VueResource);

// Init Page Components
Vue.component('page-tabs', {
    template: '#page-tabs',
    name: 'Tabs',
    data() {
        return {
            isMounted: false
        };
    },
    computed: {
        isiOS() {
            return window.isiOS;
        },
        isMaterial() {
            return window.isMaterial;
        }
    }
});

Vue.component('page-pending', {
    template: '#page-pending',
    data() {
        return {
            title_block: 'Список покупок',
            todos: window.store.todos,
            sharedState: window.store.state,
            store: window.store,
            id: '',
            title: '',
            category: '',
            desc: '',
            highlight: false,
            urgent: false,
            item: ''
        };
    },
    methods: {
        onItemDeleted(todo) {
            removeTodo(todo);
        },
        // Toggle completed status
        onToggle(todo, key) {
            // Only do the toggle if the checkbox is specifically clicked, not the whole item itself as it could also be sliding over to do a delete
            if (event.srcElement.classList.contains('icon-form-checkbox') || event.srcElement.classList.contains('label-checkbox')) {
                toggleTodo(key);
            }
            else event.preventDefault();
        },
        displayItem(todo) {
            return (!todo.completed) && (todo.category === this.sharedState.selectedCategory || this.sharedState.selectedCategory === 'Все');
        },
        displayItemCompleted(todo) {
            return (todo.completed) && (todo.category === this.sharedState.selectedCategory || this.sharedState.selectedCategory === 'Все');
        },
        addNewTodo() {
            this.item = {
                id: Math.floor(Math.random() * 10000),
                title: this.title,
                category: 'Без категории',
                desc: '',
                highlight: false,
                urgent: false,
                completed: false
            };
            if (!this.title) {
                this.$f7.alert('Необходимо написать название покупки.', 'Что вы хотите купить?');
            } else {
                addTodo(this.item);
            }
            this.title = '';
        },
        addHowMany() {
            if (!this.title) {
                this.$f7.alert('Сначала необходимо написать название покупки, а потом количество.', 'Что вы хотите купить?');
            } else {
                if (this.title.indexOf(':') === -1) {
                    this.title += ' : ';
                }
            }
            this.$refs.todo_input.$el.children[0].focus();
        }

    }
});

Vue.component('page-completed', {
    template: '#page-completed',
    name: 'Completed',
    data() {
        return {
            title: 'Купленные',
            todos: window.store.todos,
            store: window.store,
            sharedState: window.store.state
        };
    },
    methods: {
        onItemDeleted(todo) {
            removeTodo(todo);
        },
        // Toggle completed status
        onToggle(todo, key) {
            // Only do the toggle if the checkbox is specifically clicked, not the whole item itself as it could also be sliding over to do a delete
            if (event.srcElement.classList.contains('icon-form-checkbox') || event.srcElement.classList.contains('label-checkbox')) {
                toggleTodo(key);
            }
            else event.preventDefault();
        },
        displayItem(todo) {
            return (todo.completed) && (todo.category === this.sharedState.selectedCategory || this.sharedState.selectedCategory === 'Все');
        }
    }
});

Vue.component('todo-item', {
    template: '#todo-item',
    name: 'todo-item',
    data() {
        return {
            id: '',
            title: '',
            category: '',
            desc: '',
            highlight: false,
            urgent: false,
            item: ''
        }
    },
    methods: {
        addNewTodo() {
            this.item = {
                id: Math.floor(Math.random() * 10000),
                title: this.title,
                category: this.category.length > 0 ? this.category.toUpperCase() : 'Без категории',
                desc: this.desc,
                highlight: this.highlight,
                urgent: this.urgent,
                completed: false
            };
            if (!this.title) {
                this.$f7.alert('Что вы хотите купить?', 'Необходимо название');
            } else {
                addTodo(this.item);
                this.$f7.closeModal();
            }
            this.title = '';
            this.category = '';
            this.desc = '';
            this.highlight = false;
            this.urgent = false;
        }
    }
});

Vue.component('about-item', {
    template: '#about-item',
    name: 'about-item',
});

Vue.component('register-item', {
    template: '#register-item',
    name: 'register-item',
    data() {
        return {
            displayName: '',
            username: '',
            password: ''
        }
    },
    methods: {
        register_user() {
            if (!this.username || !this.displayName || !this.password) {
                this.$f7.alert('Заполните, пожалуйста, все поля.', 'Регистрация ');
            } else {
                let form_data = {
                    "displayName": this.displayName.trim(),
                    "email": this.username.toLowerCase().trim(),
                    "password": this.password
                };
                socket.emit('register', JSON.stringify(form_data));
            }
        }
    }
});

Vue.component('login-item', {
    template: '#login-item',
    name: 'login-item',
    data() {
        return {
            username: '',
            password: ''
        }
    },
    methods: {
        auth_user() {
            if (!this.username) {
                this.$f7.alert('Введите ваш логин и пароль.', 'Авторизация');
            } else {
                let form_data = {
                    "username": this.username,
                    "password": this.password
                };
                socket.emit('login', JSON.stringify(form_data))
                // this.$http.post('https://bulka-hleba-auth-djidi.c9users.io/login', form_data).then((response) => {
                //     console.log(response.data);
                // });
            }
        }
    }
});


// Init App
let myVue = new Vue({
    el: '#app',
    // Init Framework7 by passing parameters here
    framework7: {
        root: '#app',
        swipePanel: 'left',
        material: window.isMaterial,
        animateNavBackIcon: window.isiOS,
        pushState: true,
        pushStateNoAnimation: true
    },
    data() {
        return {
            not_auth: true,
            user_name: '',
            sharedState: window.store.state,
            categories: window.store.state.categories,
            item: '',
            isMounted: false
        };
    },
    methods: {
        filterCategory(cat) {
            this.isActive = true;
            window.store.changeCategory(cat);
        },
        exit_from_app() {
            myVue._data.not_auth = true;
            myVue._data.user_name = 'Гость';
            localStorage.removeItem('auth_data');
        },
        clear_cache_app() {
            caches.delete(cacheName)
        }
    },
    computed: {
        isiOS() {
            return window.isiOS;
        },
        isMaterial() {
            return window.isMaterial;
        }
    }
});

// Need to add this event or static text in pages will flash quickly
window.addEventListener("load", function (event) {
    console.log(event);
    myVue.isMounted = true;
});