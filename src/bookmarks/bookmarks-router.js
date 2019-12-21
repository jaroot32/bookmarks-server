const express = require('express')
const uuid = require('uuid/v4')
const validUrl = require('valid-url')
const logger = require('../logger')
const { bookmarks } = require('../store')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.json(bookmarks)
    })
    .post(bodyParser, (req, res) => {
        const { title, url, description, rating } = req.body;

        if (!title){
            logger.error(`Title is required`)
            return res
                .status(400)
                .send(`Invalid title`)
        }
        if (!url){
            logger.error(`URL is required`)
            return res
                .status(400)
                .send(`Invalid url`)
        }
        if (!rating){
            logger.error(`Rating is required`)
            return res
                .status(400)
                .send(`Invalid rating`)
        }

        if(!validUrl.isUri(url)){
            logger.error(`Invalid url: '${url}'`)
            return res
                .status(400)
                .send(`Invalid url`)
        }

        if (isNaN(rating) || rating<0 || rating>5 ){
            logger.err(`Invalid rating: ${rating}`)
            return res
                .status(400)
                .send(`Invalid rating`)
        }

        const id = uuid()
        const bookmark = {
            id,
            title,
            url,
            description,
            rating
        }

        bookmarks.push(bookmark)

        logger.info(`Bookmark with id ${id} created.`)
        res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${id}`)
            .json(bookmark);
    })

bookmarksRouuter
    .route('/bookmarks/:id')
    .get((req, res) => {
        const { id } = req.params
        const bookmark = bookmarks.find( b => b.id == id)

        if(!bookmark){
            logger.error(`Bookmark with id ${id} not found`)
            return res
                .status(404)
                .send('Bookmark not found')
        }
        res.json(bookmark)
    })
    .delete((req, res) => {
        const { id } = req.params

        const bookmarkIndex = bookmarks.findIndex( b => b.id == id)

        if (bookmarkIndex === -1){
            logger.error(`Card with id ${id} not found`)
            return res
                .status(404)
                .send(`Not Found`)
        }

        bookmarks.splice(bookmarkIndex, 1)

        logger.info(`Bookmark with id ${id} deleted`)
        res
            .status(204)
            .end()
    })

module.exports = bookmarksRouter