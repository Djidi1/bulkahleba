// import _ from 'lodash.orderby';
// window._ = require('lodash.orderby');

// Set up some useful globals
window.isMaterial = !window.Framework7.prototype.device.ios;
window.isiOS = window.Framework7.prototype.device.ios;

window.store = {
  todos: todoStorage.fetch(),
  state: {
    selectedCategory: 'Все',
    categories: todoStorage.categories,        
  },  
  changeCategory (category) {
    this.state.selectedCategory = category;
  },   
};


// Init F7 Vue Plugin
Vue.use(Framework7Vue);

// Init Page Components
Vue.component('page-tabs', {
  template: '#page-tabs',
  name: 'Tabs', 
  data () {
    return {
      isMounted: false    
    };
  },   
  computed: {
    isiOS () {
      return window.isiOS;
    },
    isMaterial () {
      return window.isMaterial;
    }
  }
});

Vue.component('page-pending', {
  template: '#page-pending',
  data () {
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
    onItemDeleted (todo) {
      removeTodo(todo);
    },
    // Toggle completed status
    onToggle (todo, key) {
      // Only do the toggle if the checkbox is specifically clicked, not the whole item itself as it could also be sliding over to do a delete
      if (event.srcElement.classList.contains('icon-form-checkbox') || event.srcElement.classList.contains('label-checkbox')) {
        toggleTodo(key);        
      } 
      else event.preventDefault();
    },
      displayItem (todo) {
          return (!todo.completed) && (todo.category === this.sharedState.selectedCategory || this.sharedState.selectedCategory === 'Все');
      },
    displayItemCompleted (todo) {
        return (todo.completed) && (todo.category === this.sharedState.selectedCategory || this.sharedState.selectedCategory === 'Все');
    },
      addNewTodo () {
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
      addHowMany () {
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
  name: 'Купленные',
  data () {
    return {
      title: 'Купленные',
      todos: window.store.todos,
      store: window.store,
      sharedState: window.store.state
    };
  },
  methods: {
      onItemDeleted (todo) {
          removeTodo(todo);
      },
    // Toggle completed status
    onToggle (todo, key) {
      // Only do the toggle if the checkbox is specifically clicked, not the whole item itself as it could also be sliding over to do a delete
      if (event.srcElement.classList.contains('icon-form-checkbox') || event.srcElement.classList.contains('label-checkbox')) {      
        toggleTodo(key);        
      } 
      else event.preventDefault();
    },
    displayItem (todo) {
      return (todo.completed) && (todo.category === this.sharedState.selectedCategory || this.sharedState.selectedCategory === 'Все');
    }
  }
});

Vue.component('todo-item', {
  template: '#todo-item',
  name: 'todo-item',
  data () {
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
    addNewTodo () {
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
      this.title = ''; this.category = ''; this.desc = ''; this.highlight = false; this.urgent = false;
    }    
  }
});

Vue.component('about-item', {
  template: '#about-item',
  name: 'about-item',
});


Vue.component('login-item', {
  template: '#login-item',
  name: 'login-item',
  data () {
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
    addNewTodo () {
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
      this.title = ''; this.category = ''; this.desc = ''; this.highlight = false; this.urgent = false;
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
  data () {
    return {
      sharedState: window.store.state,
      categories: window.store.state.categories,
      item: '',
      isMounted: false       
    };
  },
  methods: {
      filterCategory (cat) {
          this.isActive = true;
          window.store.changeCategory(cat);
      }
  },
  computed: {
    isiOS () {
      return window.isiOS;
    },
    isMaterial () {
      return window.isMaterial;
    }
  }
});

// Need to add this event or static text in pages will flash quickly
window.addEventListener("load", function(event) {
    console.log(event);
    myVue.isMounted = true;
});