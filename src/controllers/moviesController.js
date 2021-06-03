const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");


//Aqui tienen otra forma de llamar a cada uno de los modelos
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesController = {
    'list': (req, res) => {
        db.Movie.findAll()
            .then(movies => {
                console.log('-----LISTO LAS PELICULAS');
                movies.forEach(element => {
                    console.log(element.title);
                });

                //res.render('moviesList.ejs', { movies })
                res.json(movies);
            })
    },
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id)
            .then(movie => {
                console.log('---LISTO EL DETALLE');
                console.log(movie.title);
                //res.render('moviesDetail.ejs', { movie });
                res.json(movie);
            });
    },
    'new': (req, res) => {
        db.Movie.findAll({
            order: [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                //res.render('newestMovies', { movies });
                res.json(movies);
            });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            where: {
                rating: { [db.Sequelize.Op.gte]: 8 }
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                //res.render('recommendedMovies.ejs', { movies });
                res.json(movies);
            });
    },

    //Aqui dispongo las rutas para trabajar con el CRUD
    add: function (req, res) {
        console.log('-----------------ENTRE A LA FUNCION ADDdd --------');
        console.log('------------------ --------');

        // Hago los 2 llamados indpendientes
        let promGenres = Genres.findAll();
        // Para este caso no necesito hacer la llamada a Actores     
        //     let promActors = Actors.findAll();

        //Promise.all espera a que todo se cumpla (o bien al primer rechazo).
        //       Promise.all([promGenres, promActors])
        Promise.all([promGenres])
            .then(([allGenres]) => {
                //return res.render('moviesAdd', { allGenres})
                res.json(allGenres);
            })
            .catch(error => res.send(error))
    },

    create: function (req, res) {
        console.log('------ENTRE A CREATE');
        console.log('Pelicula :' + req.body.title);
        console.log('Código de Género :' + req.body.genre_id);

        db.Movie.create(
            {
                title: req.body.title,
                rating: req.body.rating,
                awards: req.body.awards,
                release_date: req.body.release_date,
                length: req.body.length,
                genre_id: req.body.genre_id
            }
        )
            .then(() => {
                return res.redirect('http://localhost:3000/peliculas')
            })
            .catch(error => res.send(error))
    },
    edit: function (req, res) {
        console.log('------ENTRE AL EDITAR -----');
        let movieId = req.params.id;
        console.log('----BUSCO LA PELI POT ID');
        let promMovies = db.Movie.findByPk(movieId, { include: ['genre', 'actors'] });
        console.log('----BUSCO TODOS LOS GENEROS');
        let promGenres = db.Genre.findAll();
        console.log('----BUSCO TODOS LOS ACTORES');
        let promActors = db.Actor.findAll();

        Promise
            .all([promMovies, promGenres, promActors])
            .then(([Movie, allGenres, allActors]) => {
                /*console.log('-----TITULO :' + Movie.title);
                console.log('-----GENERO :' + Movie.genre.name);
                console.log('-----GENERO id :' + Movie.genre.id);*/
                return res.json({ Movie, allGenres, allActors })
            })
            .catch(error => res.send(error))
    },
    update: function (req, res) {
        let movieId = req.params.id;

        db.Movie.update(
            {
                title: req.body.title,
                rating: req.body.rating,
                awards: req.body.awards,
                release_date: req.body.release_date,
                length: req.body.length,
                genre_id: req.body.genre_id
            },
            {
                where: { id: movieId }
            })
            .then(() => {
                return res.redirect('http://localhost:3000/peliculas')
            })
            .catch(error => res.send(error))
    },
    delete: function (req, res) {
        let movieId = req.params.id;

        db.Movie.findByPk(movieId)
            .then(Movie => {
                //return res.render(path.resolve(__dirname, '..', 'views', 'moviesDelete'), { Movie })
                return res.json(Movie);
            })
            .catch(error => res.send(error))
    },
    destroy: function (req, res) {
        let movieId = req.params.id;
        Movies
            .destroy({ where: { id: movieId }, force: true }) // force: true es para asegurar que se ejecute la acción
            .then(() => {
                return res.redirect('http://localhost:3000/peliculas')
            })
            .catch(error => res.send(error))
    }
}

module.exports = moviesController;