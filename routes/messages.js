const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const Message = require('../models/message');
const {ensureLoggedIn, ensureCorrectUser} = require('../middleware/auth')


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get('/:id', ensureLoggedIn, async (req, res, next) =>  {
    try {
        const username = req.user.username
        const result = await Message.get(req.params.id);
        if(result.to_user.username !== username && result.from_user.username !== username) {
            throw new ExpressError('Cannot read this message', 401)
        }
        return res.json( { message: result } )
    } catch(e) {
        return next(e)
    }
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedIn, async (req, res, next) =>  {
    try {
        const result = await Message.create(req.body);
        return res.json( { result } )
    } catch(e) {
        return next(e)
    }
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureLoggedIn, async (req, res, next) =>  {
    try {
        const username = req.user.username
        const result = await Message.get(req.params.id);
        if (result.to_user.username !== username) {
            throw new ExpressError('Cannot set this message to read', 401)
        }
        const message = await Message.markRead(req.params.id);

        return res.json( { message } )
    } catch(e) {
        return next(e)
    }
})

module.exports = router;

