import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'

import { carService } from './services/car.service.js'
import { userService } from './services/user.service.js'
import { loggerService } from './services/logger.service.js'
import { authService } from './services/auth.service.js'

const app = express()

// Express Config:
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

// Express Routing:
app.get('/puki', (req, res) => {
    var visitCount = req.cookies.visitCount || 0
    visitCount++
    res.cookie('visitCount', visitCount)
    res.cookie('lastVisitedCarId', 'c101', { maxAge: 60 * 60 * 1000 })

    res.send('Hello Puki')
})

app.get('/nono', (req, res) => res.redirect('/'))

// REST API for Cars

app.get('/api/car', (req, res) => {
    const filterBy = {
        txt: req.query.txt || '',
        minSpeed: req.query.minSpeed || 0,
        pageIdx: req.query.pageIdx || undefined,
    }
    carService.query(filterBy)
        .then(cars => res.send(cars))
        .catch(err => {
            loggerService.error('Cannot get cars', err)
            res.status(400).send('Cannot get cars')
        })
})

app.get('/api/car/:carId', (req, res) => {
    const { carId } = req.params

    carService.getById(carId)
        .then(car => res.send(car))
        .catch(err => {
            loggerService.error('Cannot get car', err)
            res.status(400).send('Cannot get car')
        })
})

app.post('/api/car', (req, res) => {

    const car = {
        vendor: req.body.vendor,
        speed: +req.body.speed,
    }
    carService.save(car)
        .then(savedCar => res.send(savedCar))
        .catch(err => {
            loggerService.error('Cannot save car', err)
            res.status(400).send('Cannot save car')
        })
})

app.put('/api/car/:id', (req, res) => {

    const car = {
        _id: req.params.id,
        vendor: req.body.vendor,
        speed: +req.body.speed,
        owner: req.body.owner,
    }
    carService.save(car)
        .then(savedCar => res.send(savedCar))
        .catch(err => {
            loggerService.error('Cannot save car', err)
            res.status(400).send('Cannot save car')
        })
})

app.delete('/api/car/:carId', (req, res) => {

    const { carId } = req.params
    carService.remove(carId)
        .then(() => res.send('Removed!'))
        .catch(err => {
            loggerService.error('Cannot remove car', err)
            res.status(400).send('Cannot remove car')
        })
})

// User API
app.get('/api/user', (req, res) => {
    userService.query()
        .then(users => res.send(users))
        .catch(err => {
            loggerService.error('Cannot load users', err)
            res.status(400).send('Cannot load users')
        })
})

app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params

    userService.getById(userId)
        .then(user => res.send(user))
        .catch(err => {
            loggerService.error('Cannot load user', err)
            res.status(400).send('Cannot load user')
        })
})

// Auth API
app.post('/api/auth/login', (req, res) => {
    const credentials = req.body

    authService.checkLogin(credentials)
        .then(user => {
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(() => res.status(404).send('Invalid Credentials'))
})

app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body
    
    userService.add(credentials)
        .then(user => {
            if (user) {
                const loginToken = authService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(400).send('Cannot signup')
            }
        })
        .catch(err => res.status(400).send('Username taken.'))
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('logged-out!')
})

// Fallback route
app.get('/*x', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const PORT = process.env.PORT || 3030
app.listen(PORT, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`)
)
