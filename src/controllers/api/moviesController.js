const path = require('path');
const db = require('../../database/models');
const {checkID} = require('../../helpers')
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require('moment');

const {request} = require('express');

const getURL = (req = request) => req.protocol + req.get('host') + req.originalUrl;


const moviesController = {
    list: async (req, res) => {

        try {

            let movies = await db.Movie.findAll({
                include: ['genre']
            })
            let response = {
                ok: true,
                meta: {
                    status: 200,
                    total: movies.length
                },
                data: movies
            }
            return res.status(200).json(response)
            
        } catch (error) {
            
        }

    },
    detail: async (req, res) => {

        if(checkID(req.params.id)) {
           
            return res.status(400).json(checkID(req.params.id))
        }

        try {
            let movie = await db.Movie.findByPk(req.params.id,
                {
                    include : ['genre']
                })

            if(!movie) {
                response = {
                    ok: false,
                    meta: {
                        status: 404,
                    },
                    msg: 'No se encuentra la pelicula'
                }
                return res.status(404).json(response)
            }

            response = {
                ok: true,
                meta: {
                    status: 200
                },
                data: movie
            }
            return res.status(200).json(response)

        } catch (error) {

            console.log(error)
                let response = {
                    ok: false,
                    meta: {
                        status: 500
                    },
                    msg: error.message ? error.message: 'Comuníquese con el Administrador'
                }
                return res.status(error.statusCode || 500).json(response)
        }
 
    },
    new: async (req, res) => {

        try {

            let movies = await db.Movie.findAll({
                order : [
                    ['release_date', 'DESC']
                ],
                limit: +req.query.limit || 5
            })

            response = {
                ok: true,
                meta: {
                    status: 200,
                    total: movies.length
                },
                data: movies
            }
            return res.status(200).json(response)
            
        } catch (error) {

            console.log(error)
                let response = {
                    ok: false,
                    meta: {
                        status: 500
                    },
                    msg: error.message ? error.message: 'Comuníquese con el Administrador'
                }
                return res.status(error.statusCode || 500).json(response)
            
        }
    
            
    },
    recomended: async (req, res) => {

        try {
            let movies = await  db.Movie.findAll({
                include: ['genre'],
                where: {
                    rating: {[db.Sequelize.Op.gte] : req.query.rating || 8}
                },
                order: [
                    ['rating', 'DESC']
                ]
            })

            response = {
                ok: true,
                meta: {
                    status: 200,
                    total: movies.length
                },
                data: movies
            }
            return res.status(200).json(response)

        } catch (error) {

            console.log(error)
                let response = {
                    ok: false,
                    meta: {
                        status: 500
                    },
                    msg: error.message ? error.message: 'Comuníquese con el Administrador'
                }
                return res.status(error.statusCode || 500).json(response)
            
        }
       
    },
    //Aqui dispongo las rutas para trabajar con el CRUD
    /* add: function (req, res) {
        let promGenres = Genres.findAll();
        let promActors = Actors.findAll();
        
        Promise
        .all([promGenres, promActors])
        .then(([allGenres, allActors]) => {
            return res.render(path.resolve(__dirname, '..', 'views',  'moviesAdd'), {allGenres,allActors})})
        .catch(error => res.send(error))
    }, */

    create: async (req,res) => {

      /* return res.json(getURL); */

        const {title,rating,awards,release_date,length,genre_id} = req.body;

        try {

            let genres = await db.Genre.findAll();
            let genresId = genres.map(genre => genre.id);

            if(!genresId.includes(+genre_id)){
                let error = new Error('ID de género inexistente');
                error.status = 400;
                throw error
            }

            let newMovie = await Movies.create({

                    title,
                    rating,
                    awards,
                    release_date,
                    length,
                    genre_id

            })

            if(newMovie){

                response = {
                    ok: true,
                    meta: {
                        status: 200,
                        url: getURL(req) + newMovie + '/' + newMovie.id
                    },
                    data: newMovie
                }
                return res.status(200).json(response)
            }
            
        } catch (error) {

            console.log(error);
            let errors = []; 

            if(error.errors){

                errors = error.errors.map(error => {
                    return {
                        path: error.path,
                        msg: error.message,
                        value: error.value
                    }
                })

            }

                let response = {
                    ok: false,
                    meta: {
                        status: 500
                    },
                    errors,
                    msg: error.message ? error.message: 'Comuníquese con el administrador del sitio'
                }
                return res.status(error.statusCode || 500).json(response)
        }

    },

    /* edit: function(req,res) {
        let movieId = req.params.id;
        let promMovies = Movies.findByPk(movieId,{include: ['genre','actors']});
        let promGenres = Genres.findAll();
        let promActors = Actors.findAll();
        Promise
        .all([promMovies, promGenres, promActors])
        .then(([Movie, allGenres, allActors]) => {
            Movie.release_date = moment(Movie.release_date).format('L');
            return res.render(path.resolve(__dirname, '..', 'views',  'moviesEdit'), {Movie,allGenres,allActors})})
        .catch(error => res.send(error))
    }, */

    update: async (req,res) => {

        if(checkID(req.params.id)) {
            return res.status(400).json(checkID(req.params.id))
        }

        const {title,rating,awards,release_date,length,genre_id} = req.body;

        try {
    
            let statusUpdate = await db.Movie
            .update(
                {
                    title,
                    rating,
                    awards,
                    release_date,
                    length,
                    genre_id
                },
                {
                    where: {id: req.params.id}
                })

                if(statusUpdate[0] === 1) {

                    response = {
                        ok: true,
                        meta: {
                            status: 201,
                        },
                        msg: 'Los cambios fueron guardados exitosamente'
                    }
                    return res.status(201).json(response)

                } else {

                    response = {
                        ok: true,
                        meta: {
                            status: 200,
                        },
                        msg: 'No se realizaron cambios'
                    }
                    return res.status(200).json(response)

                }

        } catch (error) {

            console.log(error);
            let errors = []; 

            if(error.errors){

                errors = error.errors.map(error => {
                    return {
                        path: error.path,
                        msg: error.message,
                        value: error.value
                    }
                })

            }

                let response = {
                    ok: false,
                    meta: {
                        status: 500
                    },
                    errors,
                    msg: error.message ? error.message: 'Comuníquese con el administrador del sitio'
                }
                return res.status(error.statusCode || 500).json(response)
            
        }

    },
   /*  delete: function (req,res) {
        let movieId = req.params.id;
        Movies
        .findByPk(movieId)
        .then(Movie => {
            return res.render(path.resolve(__dirname, '..', 'views',  'moviesDelete'), {Movie})})
        .catch(error => res.send(error))
    }, */
    destroy: async (req,res) => {

        if(checkID(req.params.id)) {
            return res.status(400).json(checkID(req.params.id))
        }

        const {title,rating,awards,release_date,length,genre_id} = req.body;

        try {
            
            let movies = await db.Movie.findAll();
            let moviesId = movies.map(movie => movie.id);

            if(!moviesId.includes(+req.params.id)){
                let error = new Error('ID de película inexistente');
                error.status = 400;
                throw error
            }

            let statusDestroy = await db.Movies
            .destroy({where: {id: req.params.id}, force: true}) // force: true es para asegurar que se ejecute la acción

            if(statusDestroy){

                response = {
                    ok: true,
                    meta: {
                        status: 201,
                    },
                    msg: 'La película fue eliminada exitosamente'
                }
                return res.status(201).json(response)

            } else {

                response = {
                    ok: true,
                    meta: {
                        status: 100,
                    },
                    msg: 'No se realizaron cambios'
                }
                return res.status(100).json(response)

            }

            
           
        } catch (error) {

            console.log(error);
            let errors = []; 

            if(error.errors){

                errors = error.errors.map(error => {
                    return {
                        path: error.path,
                        msg: error.message,
                        value: error.value
                    }
                })

            }


            let response = {
                ok: false,
                meta: {
                    status: 500
                },
                errors,
                msg: error.message ? error.message: 'Comuníquese con el administrador del sitio'
            }
            return res.status(error.statusCode || 500).json(response)
            
        }
       
    }
}

module.exports = moviesController;