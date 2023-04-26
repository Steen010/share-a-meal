const assert = require('assert');
const logger = require('../util/utils').logger;
const database = require('../util/database');

let index = database.users.length;

const userController = {
    getAllUsers: (req, res) =>{
        try{
            if(database.users.length >= 2) {
                res.status(200).json({
                    status: 200,
                    message: 'Lijst van gebruikers is gevonden',
                    data: database.users,
                });
            } else {
                res.status(400).json({
                    status: 400,
                    message: 'Lijst van gebruikers is niet gevonden',
                    data: {},
                })
            }
        } catch(err) {
            res.status(400).json({
                status: 400,
                message: 'Lijst van gebruikers is niet gevonden',
                data: {},
            })
        }
    },
    createUser: (req, res) =>{
        let newUser = req.body;
        let {firstName, lastName, emailAddress} = req.body;
    
        try{
            assert(typeof firstName === 'string', 'firstName must be string')
            assert(typeof lastName === 'string', 'lastName must be string')
            assert(typeof emailAddress === 'string', 'emailAddress must be string')
            index = database.index + 1;
            newUser = {
                id: index,
                firstName: firstName,
                lastName: lastName,
                emailAddress: emailAddress,
            };
            database.users.push(newUser);
            res.status(201).json({
                status: 201,
                message: `User met ID ${index} is toegevoegd`,
                data: newUser,
            });
        } catch(err) {
            res.status(400).json({
                status: 400,
                message: err.toString(),
                data: {},
            })
        }
    },
    getUser: (req, res) => {
        let userId = req.params.userId;
        let user = database.users.filter((item) => item.id == userId);
        if(user[0]) {
            res.status(200).json({
                status: 200,
                message: `User met ID ${userId} is gevonden`,
                data: user[0],
            })
        } else {
            res.status(400).json({
                status: 400,
                message: `User met ID ${userId} niet gevonden`,
                data: {},
            });
        }
    },
    getUserProfile : (req, res) => {
        try {

        assert(typeof emailaddress === 'string', 'emailAddress must be a string');
        const userIndex = database.users.findIndex(
            
            (user) => user.emailaddress === emailaddress
            );
            if (userIndex === -1) {
                throw new Error('Gebruiker niet gevonden');
            }
                
            const userDetails = {
                firstname: user.firstname,
                lastname: user.lastname,
                emailaddress: user.emailaddress,
            };
                
            res.status(200).json({
                status: 200,
                message: 'Profielgegevens opgehaald',
                data: userDetails,
            });
        } catch (err) {
            let statusCode = 400;
            if (err.message === 'Gebruiker niet gevonden') {
                statusCode = 404;
            } 
            res.status(statusCode).json({
                status: statusCode,
                message: err.message.toString(),
                data: {},
            });
        }
    },
    updateUser : (req, res) => {
        try {
            const { emailaddress, firstName, lastName } = req.body;
            const userIndex = database.users.findIndex(
            (user) => user.emailaddress === emailaddress
            );
            
            if (userIndex === -1) {
                throw new Error('Gebruiker niet gevonden');
            }
            
            const { firstname, lastname} = updateData;
            
            if (firstname && !firstname.trim()) {
                throw new Error('Voornaam is verplicht');
            }
            
            if (lastname && !lastname.trim()) {
                throw new Error('Achternaam is verplicht');
            }
            
            // Werk de gebruikersgegevens bij met de opgegeven updateData
            
            if (firstname) user.firstname = firstname;
            if (lastname) user.lastname = lastname;
            
            // Sla de bijgewerkte gebruiker op in de database
            database.users[userIndex] = user;
            res.status(200).json({
                status: 200,
                message: 'Gebruiker is met succes bijgewerkt',
                data: user,
            });
        } catch (err) {
            let statusCode = 400;
            if (err.message === 'Gebruiker niet gevonden') {
                statusCode = 404;
            }
            res.status(statusCode).json({
                status: statusCode,
                message: err.message.toString(),
                data: {},
            });
        }
    },
    deleteUser: (req, res) => {
        let userId = req.params.userId;
        let user = database.users.filter((item) => item.id == userId);
        
        if(user[0]) {
            database.users.splice(user.id - 1);
            res.status(200).json({
                status: 200,
                message: `User met ID ${userId} is verwijderd`,
                data: {},
            });
        } else {
            res.status(404).json({
                status: 404,
                message: 'Gebruiker bestaat niet', 
                data: {},
            });
        };
    },
};

module.exports = userController;