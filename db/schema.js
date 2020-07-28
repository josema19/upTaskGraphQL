const { gql } = require('apollo-server');

// Crear Type Definition
const typeDefs = gql`
    type Token {
        token: String
    }

    type Proyecto {
        id: ID,
        nombre: String
    }

    type Tarea {
        id: ID,
        nombre: String
        proyecto: String
        estado: Boolean
    }

    type Query {
        obtenerProyectos: [Proyecto]
        obtenerTareas(input: ProyectoIDInput): [Tarea]
    }

    type Mutation {
        # Usuarios
        crearUsuario(input: UsuarioInput): String
        autenticarUsuario(input: AutenticarInput): Token

        # Proyectos
        nuevoProyecto(input: ProyectoInput): Proyecto
        actualizarProyecto(id: ID!, input: ProyectoInput): Proyecto
        eliminarProyecto(id: ID!): String

        # Tareas
        nuevaTarea(input: TareaInput): Tarea
        actualizarTarea(id: ID!, input: TareaInput, estado: Boolean): Tarea
        eliminarTarea(id: ID!): String
    }

    input UsuarioInput {
        nombre: String!
        email: String!
        password: String!
    }

    input AutenticarInput {
        email: String!
        password: String!
    }

    input ProyectoInput {
        nombre: String!
    }

    input TareaInput {
        nombre: String!
        proyecto: String
    }

    input ProyectoIDInput {
        proyecto: String!
    }
`;

module.exports = typeDefs;