var {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLSchema,
} = require("graphql");

var GraphQLDate = require("graphql-date");

const TodoModel = require("../models").Todo;

var todoType = new GraphQLObjectType({
  name: "todo",
  fields: function () {
    return {
      id: {
        type: GraphQLInt,
      },
      completed: {
        type: GraphQLBoolean,
      },
      text: {
        type: GraphQLString,
      },
      createdAt: {
        type: GraphQLDate,
      },
      updatedAt: {
        type: GraphQLDate,
      },
    };
  },
});

var queryType = new GraphQLObjectType({
  name: "Query",
  fields: function () {
    return {
      todos: {
        args: {
          completed: {
            type: GraphQLBoolean,
            defaultValue: null,
          },
        },
        type: new GraphQLList(todoType),
        resolve: function (root, params) {
          const query = { order: [["createdAt", "DESC"]] };

          if (params.completed !== null) {
            query.where = {
              completed: params.completed,
            };
          }

          const todos = TodoModel.findAll(query);

          if (!todos) {
            throw new Error("Error");
          }
          return todos;
        },
      },
      todo: {
        type: todoType,
        args: {
          id: {
            name: "id",
            type: GraphQLString,
          },
        },
        resolve: function (root, params) {
          const todoDetails = TodoModel.findByPk(params.id).exec();
          if (!todoDetails) {
            throw new Error("Error");
          }
          return todoDetails;
        },
      },
    };
  },
});

var mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: function () {
    return {
      createTodo: {
        type: todoType,
        args: {
          text: {
            type: new GraphQLNonNull(GraphQLString),
          },
          completed: {
            type: new GraphQLNonNull(GraphQLBoolean),
          },
        },
        resolve: function (root, params) {
          const todoModel = new TodoModel(params);
          const newTodo = todoModel.save();
          if (!newTodo) {
            throw new Error("Error");
          }
          return newTodo;
        },
      },
      updateTodo: {
        type: todoType,
        args: {
          id: {
            name: "id",
            type: new GraphQLNonNull(GraphQLInt),
          },
          text: {
            type: new GraphQLNonNull(GraphQLString),
          },
          completed: {
            type: new GraphQLNonNull(GraphQLBoolean),
          },
        },
        resolve(root, params) {
          return TodoModel.findByPk(params.id)
            .then((todo) => {
              if (!todo) {
                throw new Error("Not found");
              }
              return todo
                .update({
                  text: params.text,
                  completed: params.completed,
                })
                .then(() => {
                  return todo;
                })
                .catch((error) => {
                  throw new Error(error);
                });
            })
            .catch((error) => {
              throw new Error(error);
            });
        },
      },
      removeTodo: {
        type: todoType,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLInt),
          },
        },
        resolve(root, params) {
          return TodoModel.findByPk(params.id)
            .then((todo) => {
              if (!todo) {
                throw new Error("Not found");
              }
              return todo
                .destroy()
                .then(() => {
                  return todo;
                })
                .catch((error) => {
                  throw new Error(error);
                });
            })
            .catch((error) => {
              throw new Error(error);
            });
        },
      },
    };
  },
});

module.exports = new GraphQLSchema({ query: queryType, mutation: mutation });
