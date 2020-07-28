require('dotenv').config({ path: 'variables.env' });

const { ApolloServer } = require('apollo-server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/Usuario');
const Proyecto = require('../models/Proyecto');
const Tarea = require('../models/Tarea');

// Crea y firma un JWT
const crearToken = (usuario, secreta, expiresIn) => {
    // Obtener información del usuario autenticado
    const { id, email, nombre } = usuario;

    // Devolver token
    return jwt.sign({ id, email, nombre }, secreta, {expiresIn});
};

// Crear Resolvers
const resolvers = {
    Query: {
        obtenerProyectos: async (_, {}, ctx) => {
            try {
                const proyectos = await Proyecto.find({ creador: ctx.id });
                return proyectos;                
            } catch (error) {
                console.log(error);                
            };
        },
        obtenerTareas: async (_, {input}, ctx) => {
            try {
                const tareas = await Tarea.find({ creador: ctx.id }).where('proyecto').equals(input.proyecto);
                return tareas;
            } catch (error) {
                console.log(error);
            };
        }
    },
    Mutation: {
        crearUsuario: async (_, {input}) => {
            // Aplicar destructuración
            const { email, password } = input;

            // Validar Usuario
            const existeUsuario = await Usuario.findOne({ email });
            if (existeUsuario) {
                throw new Error('El usuario ya está registrado');
            };

            // Almacenar en la BD
            try {
                // Colocar un Hash al password
                const salt = await bcrypt.genSalt(10);
                input.password = await bcrypt.hash(password, salt);

                // Almacenar en al Base de Datos
                const nuevoUsuario = new Usuario(input);
                nuevoUsuario.save();

                // Devolver Respuesta
                return 'Usuario Creado Correctamente...';
            } catch (error) {
                console.log(error);
            };
        },
        autenticarUsuario: async (_, {input}) => {
            // Aplicar destructuración
            const { email, password } = input;

            // Verificar si el usuario existe
            const existeUsuario = await Usuario.findOne({ email });
            if (!existeUsuario) {
                throw new Error('El usuario no existe');
            };

            // Verificar el password
            const passwordCorrecto = await bcrypt.compare(password, existeUsuario.password);
            if (!passwordCorrecto) {
                throw new Error('Password incorrecto');
            };

            // Dar acceso
            return {
                token: crearToken(existeUsuario, process.env.SECRETA, '4hr')
            };
        },
        nuevoProyecto: async (_, {input}, ctx) => {
            try {
                // Definir Modelo
                const proyecto = new Proyecto(input);

                // Modificar campo de creador
                proyecto.creador = ctx.id;

                // Almacenar en la BD
                const resultado = await proyecto.save();

                // Devolver respuesta
                return resultado;
            } catch (error) {
                console.log(error);
            };
        },
        actualizarProyecto: async (_, {id, input}, ctx) => {
            // Validar que el proyecto exista
            let proyecto = await Proyecto.findById(id);
            if (!proyecto) {
                throw new Error('Proyecto no encontrado');
            };

            // Revisar que la persona que va a editar el proyecto sea el creador
            if (proyecto.creador.toString() !== ctx.id) {
                throw new Error('No tienes las credenciales para editar');
            };

            // Guardar Proyecto
            proyecto = await Proyecto.findOneAndUpdate({ _id: id }, input, { new: true });

            // Devolver Respuesta
            return proyecto;
        },
        eliminarProyecto: async (_, {id}, ctx) => {
            // Validar que el proyecto exista
            let proyecto = await Proyecto.findById(id);
            if (!proyecto) {
                throw new Error('Proyecto no encontrado');
            };

            // Revisar que la persona que va a editar el proyecto sea el creador
            if (proyecto.creador.toString() !== ctx.id) {
                throw new Error('No tienes las credenciales para editar');
            };

            // Eliminar de la BD
            try {
                await Proyecto.findOneAndDelete({ _id: id });                
            } catch (error) {
                console.log(error);
            };

            // Devolver respuesta
            return 'Proyecto Eliminado.';
        },
        nuevaTarea: async (_, {input}, ctx) => {
            try {
                // Definir tarea y modificar campos
                const tarea = new Tarea(input);
                tarea.creador = ctx.id

                // Guardar tarea y devolver resultado
                const resultado = await tarea.save();
                return resultado;
            } catch (error) {
                console.log(error);
            };
        },
        actualizarTarea: async (_, {id, input, estado}, ctx) => {
            // Verificar que exista la tarea
            let tarea = await Tarea.findById(id);
            if (!tarea) {
                throw new Error('Tarea no encontrada');
            };

            // Revisar que la persona que va a editar la tarea sea el creador
            if (tarea.creador.toString() !== ctx.id) {
                throw new Error('No tienes las credenciales para editar');
            };

            // Asignar estado
            input.estado = estado;

            // Actualizar tarea y devolver respuesta
            tarea = await Tarea.findOneAndUpdate({ _id: id }, input, { new: true });
            return tarea;
        },
        eliminarTarea: async (_, {id, input}, ctx) => {
            // Verificar que exista la tarea
            let tarea = await Tarea.findById(id);
            if (!tarea) {
                throw new Error('Tarea no encontrada');
            };

            // Revisar que la persona que va a editar la tarea sea el creador
            if (tarea.creador.toString() !== ctx.id) {
                throw new Error('No tienes las credenciales para editar');
            };

            // Eliminar de la BD
            try {
                await Tarea.findOneAndDelete({ _id: id });                
            } catch (error) {
                console.log(error);
            };

            // Devolver respuesta
            return 'Tarea Eliminada.';
        }
    }
};

// Exportar
module.exports = resolvers;
