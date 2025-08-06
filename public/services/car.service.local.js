import { utilService } from './util.service.js'
import { storageService } from './async-storage.service.js'
import { authService } from './auth.service.js'

const CAR_KEY = 'carDB'
_createCars()

export const carService = {
    query,
    get,
    remove,
    save,
    getEmptyCar,
    getDefaultFilter,
    getSpeedStats,
    getVendorStats
}

function query(filterBy = {}) {
    return storageService.query(CAR_KEY)
        .then(cars => {
            if (filterBy.txt) {
                const regExp = new RegExp(filterBy.txt, 'i')
                cars = cars.filter(car => regExp.test(car.vendor))
            }

            if (filterBy.minSpeed) {
                cars = cars.filter(car => car.speed >= filterBy.minSpeed)
            }

            return cars
        })
}

function get(carId) {
    return storageService.get(CAR_KEY, carId)
        .then(car => {
            car = _setNextPrevCarId(car)
            return car
        })
}

function remove(carId) {
    return storageService.remove(CAR_KEY, carId)
}

function save(car) {
    if (car._id) {
        return storageService.put(CAR_KEY, car)
    } else {
        car.owner = authService.getLoggedinUser()
        return storageService.post(CAR_KEY, car)
    }
}

function getEmptyCar(vendor = '', speed = '') {
    return { vendor, speed }
}

function getDefaultFilter(filterBy = { txt: '', minSpeed: 0 }) {
    return { txt: filterBy.txt, minSpeed: filterBy.minSpeed }
}

function getSpeedStats() {
    return storageService.query(CAR_KEY)
        .then(cars => {
            const carCountBySpeedMap = _getCarCountBySpeedMap(cars)
            const data = Object.keys(carCountBySpeedMap).map(speedName => ({ title: speedName, value: carCountBySpeedMap[speedName] }))
            return data
        })

}

function getVendorStats() {
    return storageService.query(CAR_KEY)
        .then(cars => {
            const carCountByVendorMap = _getCarCountByVendorMap(cars)
            const data = Object.keys(carCountByVendorMap)
                .map(vendor =>
                ({
                    title: vendor,
                    value: Math.round((carCountByVendorMap[vendor] / cars.length) * 100)
                }))
            return data
        })
}

function _createCars() {
    let cars = utilService.loadFromStorage(CAR_KEY)
    if (!cars || !cars.length) {
        cars = []
        const vendors = ['audu', 'fiak', 'subali', 'mitsu']
        for (let i = 0; i < 6; i++) {
            const vendor = vendors[utilService.getRandomIntInclusive(0, vendors.length - 1)]
            cars.push(_createCar(vendor, utilService.getRandomIntInclusive(80, 300)))
        }
        utilService.saveToStorage(CAR_KEY, cars)
    }
}

function _createCar(vendor, maxSpeed = 250) {
    const car = getEmptyCar(vendor, maxSpeed)
    car._id = utilService.makeId()
    car.owner = authService.getLoggedinUser()
    return car
}

function _setNextPrevCarId(car) {
    return storageService.query(CAR_KEY).then((cars) => {
        const carIdx = cars.findIndex((currCar) => currCar._id === car._id)
        const nextCar = cars[carIdx + 1] ? cars[carIdx + 1] : cars[0]
        const prevCar = cars[carIdx - 1] ? cars[carIdx - 1] : cars[cars.length - 1]
        car.nextCarId = nextCar._id
        car.prevCarId = prevCar._id
        return car
    })
}

function _getCarCountBySpeedMap(cars) {
    const carCountBySpeedMap = cars.reduce((map, car) => {
        if (car.maxSpeed < 120) map.slow++
        else if (car.maxSpeed < 200) map.normal++
        else map.fast++
        return map
    }, { slow: 0, normal: 0, fast: 0 })
    return carCountBySpeedMap
}

function _getCarCountByVendorMap(cars) {
    const carCountByVendorMap = cars.reduce((map, car) => {
        if (!map[car.vendor]) map[car.vendor] = 0
        map[car.vendor]++
        return map
    }, {})
    return carCountByVendorMap
}

// For Debug (easy access from console):
// window.cs = carService