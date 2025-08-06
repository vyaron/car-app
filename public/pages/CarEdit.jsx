const { useState, useEffect } = React
const { useNavigate, useParams } = ReactRouterDOM

import { carService } from "../services/car.service.local.js"
import { showErrorMsg } from "../services/event-bus.service.js"

export function CarEdit() {

    const [carToEdit, setCarToEdit] = useState(carService.getEmptyCar())
    const navigate = useNavigate()
    const params = useParams()

    useEffect(() => {
        if (params.carId) loadCar()
    }, [])

    function loadCar() {
        carService.get(params.carId)
            .then(setCarToEdit)
            .catch(err => showErrorMsg('Cannot load car'))
    }

    function handleChange({ target }) {
        const field = target.name
        let value = target.value

        switch (target.type) {
            case 'number':
            case 'range':
                value = +value || ''
                break;

            case 'checkbox':
                value = target.checked
                break

            default:
                break
        }

        setCarToEdit(prevCarToEdit => ({ ...prevCarToEdit, [field]: value }))
    }


    function onSaveCar(ev) {
        ev.preventDefault()

        carService.save(carToEdit)
            .then(() => navigate('/car'))
            .catch(err => showErrorMsg('Cannot save car'))
    }

    const { vendor, speed } = carToEdit

    return (
        <section className="car-edit">
            <form onSubmit={onSaveCar} >
                <label htmlFor="vendor">Vendor:</label>
                <input onChange={handleChange} value={vendor} type="text" name="vendor" id="vendor" />

                <label htmlFor="speed">Max Speed:</label>
                <input onChange={handleChange} value={speed} type="number" name="speed" id="speed" />

                <button>Save</button>
            </form>
        </section>
    )
}