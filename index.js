require('dotenv').config({ path: 'variables.env' });
const { ApolloServer } = require('apollo-server');
const jwt = require('jsonwebtoken');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const conectarDB = require('./config/db');

// Definir Servidor
const server = new ApolloServer({
    typeDefs, 
    resolvers,
    context: ({req}) => {
        const token = req.headers['authorization'] || '';
        if (token) {
            try {
                const usuario = jwt.verify(token.replace('Bearer ', ''), process.env.SECRETA);
                return usuario;
            } catch (error) {
                console.log(error);
            }
        };
    }
});

// Contectar con Base de Datos
conectarDB();

// Ejecutar servidor
server.listen({ port: process.env.PORT || 4000 }).then(({url}) => {
    console.log(`Servidor listo en la URL ${url}`);
});