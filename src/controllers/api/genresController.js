const db = require('../../database/models');
const sequelize = db.sequelize;
const {checkID} = require('../../helpers')
const {Op} = require('sequelize');


const genresController = {
    list: async (req, res) => {

        try {

           let genres =  await db.Genre.findAll();
           let response = {
            ok: true,
            meta: {
                status: 200,
                total: genres.length
            },
            data: genres
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
                return res.status(200).json(response)
            
        }

    },
    detail: async (req, res) => {

        if(checkID(req.params.id)) {
           
            return res.status(400).json(checkID(req.params.id))
        }

        try {

            let genre =  await db.Genre.findByPk(req.params.id);
           let response;

            if(!genre) {
                response = {
                    ok: false,
                    meta: {
                        status: 404,
                    },
                    msg: 'No se encuentra el género'
                }
                return res.status(404).json(response)
            }
                response = {
                    ok: true,
                    meta: {
                        status: 200
                    },
                    data: genre
                }
                return res.status(200).json(response)
            }   
        
        
         catch (error) {

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
    name: async (req,res) => {

        try {
            let genre = await db.Genre.findOne({
                where: {
                    name: {[Op.substring] : req.params.name}
                }
            })
            let response;

            if(!genre) {
                response = {
                    ok: false,
                    meta: {
                        status: 404,
                    },
                    msg: 'No hay un género con el nombre ' + req.params.name
                }
                return res.status(404).json(response)
 
            }

                response = {
                    ok: true,
                    meta: {
                        status: 200
                    },
                    data: genre
                }
                return res.status(200).json(response)
            }
             catch (error) {
    
                console.log(error)
                    let response = {
                        ok: false,
                        meta: {
                            status: 500
                        },
                        msg: error.message ? error.message: 'Comuníquese con el Administrador'
                    }
                    return res.status(200).json(response)
                
            }
    }

    

}

module.exports = genresController;