module.exports = function(app) {
    var userController = require('../controllers/userController');
  
    // todoList Routes
    app.route('/user')
      .get(userController.getUsers);
  
  
    // app.route('/tasks/:taskId')
    //   .get(todoList.read_a_task)
    //   .put(todoList.update_a_task)
    //   .delete(todoList.delete_a_task);
  };